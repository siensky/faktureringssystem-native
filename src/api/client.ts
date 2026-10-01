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

import {
  mockAccountSummary,
  MOCK_INVOICES,
  mockCompaniesOverview,
  mockInvoiceDetail,
  MOCK_TOKENS,
  mockUserFor,
} from './mockData';

function isMockMode(): boolean {
  return process.env.EXPO_PUBLIC_USE_MOCKS === 'true';
}

// EXPO_PUBLIC_-variabler bakas in i bundeln vid build. Faller den bort i
// en produktionsbuild (och vi inte kör demoläget, som aldrig pratar med
// en riktig backend) ska appen inte tyst peka mot localhost — det ska
// synas direkt, inte upptäckas i produktion.
if (!isMockMode() && !process.env.EXPO_PUBLIC_API_URL && !__DEV__) {
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

// Demoläget (EXPO_PUBLIC_USE_MOCKS=true) svarar mot fixturdata i
// mockData.ts istället för att göra ett riktigt nätverksanrop — så att
// vem som helst kan klona repot och köra appen utan en riktig backend.
// PDF och betalning är medvetet inte simulerade (ingen riktig fil att
// ladda ner/betala), de kastar samma fel-typer som resten av appen
// redan visar upp snyggt.
let mockActiveTenantId = 1;

async function mockRequest<T>(path: string, opts: RequestOptions): Promise<T> {
  const [route] = path.split('?');
  const method = opts.method ?? 'GET';
  if (process.env.NODE_ENV !== 'test') {
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  if (route === '/auth/login' || route === '/auth/refresh') {
    mockActiveTenantId = 1;
    return MOCK_TOKENS as T;
  }
  if (route === '/auth/logout') return { status: 'ok' } as T;
  if (route === '/auth/me') return mockUserFor(mockActiveTenantId) as T;
  if (route === '/auth/companies/overview') return mockCompaniesOverview() as T;
  if (route === '/auth/companies/switch') {
    mockActiveTenantId = (opts.body as { tenantId: number }).tenantId;
    return MOCK_TOKENS as T;
  }
  if (route === '/portal/invoices') return (MOCK_INVOICES[mockActiveTenantId] ?? []) as T;
  if (route === '/portal/account-summary') return mockAccountSummary(mockActiveTenantId) as T;

  const invoiceMatch = route.match(/^\/portal\/invoices\/(\d+)(\/pdf|\/pay)?$/);
  if (invoiceMatch) {
    const [, idText, action] = invoiceMatch;
    if (action === '/pdf') throw new ApiError(404, 'PDF-generering ingår inte i demoläget.');
    if (action === '/pay') throw new ApiError(400, 'Betalning ingår inte i demoläget.');
    const detail = mockInvoiceDetail(Number(idText));
    if (!detail) throw new ApiError(404, 'Fakturan kunde inte hittas.');
    return detail as T;
  }

  throw new ApiError(404, `Ingen mock-rutt för ${method} ${route}.`);
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  if (isMockMode()) return mockRequest<T>(path, opts);

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
