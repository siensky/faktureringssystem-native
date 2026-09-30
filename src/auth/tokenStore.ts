// Samma mönster som faktureringssystem-be/apps/portal/src/auth/tokenStore.ts:
// access-token i minnet (försvinner vid omstart, ersätts av ett
// refresh-anrop), refresh-token krypterat i Keychain/Keystore via
// expo-secure-store (native-motsvarigheten till localStorage) så
// inloggningen överlever en omstart. EGEN nyckel — skiljd från portalens
// "portal.refreshToken" så de två aldrig kan krocka.
//
// expo-secure-store är async (till skillnad från localStorage), så till
// skillnad från portalen cachar vi det inlästa värdet i minnet efter
// första läsningen i stället för att slå upp Keychain varje gång.

import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'mobile.refreshToken';

let accessToken: string | null = null;
let cachedRefreshToken: string | null | undefined;
let onSessionExpired: (() => void) | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export async function getRefreshToken(): Promise<string | null> {
  if (cachedRefreshToken !== undefined) return cachedRefreshToken;
  try {
    cachedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    cachedRefreshToken = null;
  }
  return cachedRefreshToken;
}

export async function setRefreshToken(token: string | null): Promise<void> {
  cachedRefreshToken = token;
  try {
    if (token) await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    else await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    // Keychain otillgänglig — sessionen håller ändå för den här appstarten.
  }
}

export async function clearTokens(): Promise<void> {
  setAccessToken(null);
  await setRefreshToken(null);
}

/** AuthContext registrerar sig här för att bli informerad om en 401 som
 *  ett lyckat refresh-försök inte kunde rädda (utloggad, revokerad session). */
export function setSessionExpiredHandler(handler: (() => void) | null): void {
  onSessionExpired = handler;
}

export function notifySessionExpired(): void {
  onSessionExpired?.();
}
