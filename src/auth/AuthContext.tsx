// Samma mönster som faktureringssystem-be/apps/portal/src/auth/AuthContext.tsx
// — se den filens kommentarer för resonemangen bakom hasAttemptedRefresh
// (StrictMode + engångs roterande refresh-token) och sessionExpiredHandler.
// loginWithBankId är inte med — BankID är inte i scope för v1 här.

import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react';

import * as authApi from '@/api/auth';
import * as companiesApi from '@/api/companies';
import { getBiometricEnabled } from '@/lib/preferences';
import type { CurrentUserDto } from '@/types/contracts';

import { authenticateWithBiometrics, isBiometricLoginAvailable } from './biometrics';
import {
  clearTokens,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  setSessionExpiredHandler,
} from './tokenStore';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: CurrentUserDto | null;
  status: Status;
  login: (email: string, password: string) => Promise<void>;
  /** Byt aktivt företag för en kundidentitet länkad till flera bolag. */
  switchCompany: (tenantId: number) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUserDto | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      setStatus('unauthenticated');
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  const hasAttemptedRefresh = useRef(false);
  useEffect(() => {
    if (hasAttemptedRefresh.current) return;
    hasAttemptedRefresh.current = true;

    (async () => {
      const existingRefresh = await getRefreshToken();
      if (!existingRefresh) {
        setStatus('unauthenticated');
        return;
      }

      // Face ID/Touch ID är en grind ovanpå den redan sparade
      // refresh-token, inte en ersättning för den — bara på om
      // användaren slagit på det OCH enheten faktiskt stödjer det.
      const biometricEnabled = await getBiometricEnabled();
      if (biometricEnabled && (await isBiometricLoginAvailable())) {
        const approved = await authenticateWithBiometrics();
        if (!approved) {
          setStatus('unauthenticated');
          return;
        }
      }

      try {
        const pair = await authApi.refresh(existingRefresh);
        setAccessToken(pair.accessToken);
        await setRefreshToken(pair.refreshToken);
        setUser(await authApi.getCurrentUser());
        setStatus('authenticated');
      } catch {
        await clearTokens();
        setStatus('unauthenticated');
      }
    })();
  }, []);

  // Delad av login och byt-företag — båda slutar med "sätt det här
  // tokenparet, hämta den nya /auth/me-vyn".
  async function applyTokens(pair: authApi.TokenPairResponse): Promise<void> {
    setAccessToken(pair.accessToken);
    await setRefreshToken(pair.refreshToken);
    setUser(await authApi.getCurrentUser());
    setStatus('authenticated');
  }

  async function login(email: string, password: string): Promise<void> {
    await applyTokens(await authApi.login(email, password));
  }

  async function switchCompany(tenantId: number): Promise<void> {
    await applyTokens(await companiesApi.switchCompany(tenantId));
  }

  async function logout(): Promise<void> {
    const token = await getRefreshToken();
    await clearTokens();
    setUser(null);
    setStatus('unauthenticated');
    if (token) {
      try {
        await authApi.logout(token);
      } catch {
        // Redan utloggad lokalt — ett misslyckat serveranrop ändrar inget för användaren.
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, status, login, switchCompany, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth måste användas inom AuthProvider');
  return ctx;
}
