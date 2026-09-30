// Fetch-wrapper mot nginx-gatewayen — samma mönster som
// faktureringssystem-be/apps/portal/src/api/client.ts: bär access-token,
// försöker en gång att förnya den på 401 (delad in-flight-promise så
// flera samtidiga 401:or aldrig race:ar om samma engångs-refreshtoken),
// kastar ApiError med backendens svenska felmeddelande.

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  notifySessionExpired,
  setAccessToken,
  setRefreshToken,
} from '@/auth/tokenStore';

// EXPO_PUBLIC_-variabler bakas in i bundeln vid build. Faller den bort i
// en produktionsbuild ska appen inte tyst peka mot localhost — det ska
// synas direkt, inte upptäckas i produktion.
if (!process.env.EXPO_PUBLIC_API_URL && !__DEV__) {
  throw new Error('EXPO_PUBLIC_API_URL måste sättas i en produktionsbuild.');
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

interface PublicErrorBody {
  success: false;
  code: number;
  message: string;
}

function rawRequest(path: string, opts: RequestOptions): Promise<Response> {
  const token = getAccessToken();
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  return fetch(`${API_BASE_URL}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}

async function doRefresh(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  setAccessToken(data.accessToken);
  await setRefreshToken(data.refreshToken);
  return true;
}

let refreshPromise: Promise<boolean> | null = null;

function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  let res = await rawRequest(path, opts);

  if (res.status === 401 && (await getRefreshToken()) && (await tryRefresh())) {
    res = await rawRequest(path, opts);
  }
  if (res.status === 401) {
    await clearTokens();
    notifySessionExpired();
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as PublicErrorBody | null;
    throw new ApiError(res.status, body?.message ?? `Något gick fel (HTTP ${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
