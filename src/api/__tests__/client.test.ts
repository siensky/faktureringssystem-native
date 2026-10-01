import * as tokenStore from '@/auth/tokenStore';

import { ApiError, apiRequest } from '../client';

jest.mock('@/auth/tokenStore');

const mockedTokenStore = tokenStore as jest.Mocked<typeof tokenStore>;

function jsonResponse(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response;
}

describe('apiRequest', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  it('returns the parsed JSON body on success', async () => {
    mockedTokenStore.getAccessToken.mockReturnValue('access-123');
    (global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse(200, { hello: 'world' }));

    const result = await apiRequest('/portal/invoices');

    expect(result).toEqual({ hello: 'world' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/portal/invoices'),
      expect.objectContaining({ headers: expect.objectContaining({ authorization: 'Bearer access-123' }) }),
    );
  });

  it('refreshes the token once on a 401 and retries the original request', async () => {
    mockedTokenStore.getAccessToken.mockReturnValue('expired-token');
    mockedTokenStore.getRefreshToken.mockResolvedValue('refresh-123');

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse(401, { success: false, code: 401, message: 'Utgången token' }))
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: 'new-access', refreshToken: 'new-refresh' }))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    const result = await apiRequest('/portal/invoices');

    expect(result).toEqual({ ok: true });
    expect(mockedTokenStore.setAccessToken).toHaveBeenCalledWith('new-access');
    expect(mockedTokenStore.setRefreshToken).toHaveBeenCalledWith('new-refresh');
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('clears the session and throws when the refresh attempt also fails', async () => {
    mockedTokenStore.getAccessToken.mockReturnValue('expired-token');
    mockedTokenStore.getRefreshToken.mockResolvedValue('refresh-123');

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse(401, { success: false, code: 401, message: 'Utgången token' }))
      .mockResolvedValueOnce(jsonResponse(401, { success: false, code: 401, message: 'Ogiltig refresh-token' }));

    await expect(apiRequest('/portal/invoices')).rejects.toThrow(ApiError);

    expect(mockedTokenStore.clearTokens).toHaveBeenCalled();
    expect(mockedTokenStore.notifySessionExpired).toHaveBeenCalled();
  });

  it('throws an ApiError with the backend message on a non-ok response', async () => {
    mockedTokenStore.getAccessToken.mockReturnValue(null);
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      jsonResponse(400, { success: false, code: 400, message: 'Ogiltig e-postadress' }),
    );

    await expect(apiRequest('/auth/login', { method: 'POST', body: {} })).rejects.toThrow('Ogiltig e-postadress');
  });

  it('returns undefined for a 204 response', async () => {
    mockedTokenStore.getAccessToken.mockReturnValue('access-123');
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, status: 204 } as Response);

    const result = await apiRequest('/auth/logout', { method: 'POST' });

    expect(result).toBeUndefined();
  });
});

describe('apiRequest (demoläge, EXPO_PUBLIC_USE_MOCKS)', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_USE_MOCKS = 'true';
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_USE_MOCKS;
  });

  it('loggar in med valfria uppgifter utan nätverksanrop', async () => {
    const result = await apiRequest<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: { email: 'vem@som.helst', password: 'fel-lösenord-funkar-också' },
    });

    expect(result.accessToken).toBeTruthy();
  });

  it('returnerar fakturor för det aktiva bolaget och byter när man byter bolag', async () => {
    await apiRequest('/auth/companies/switch', { method: 'POST', body: { tenantId: 1 } });

    const before = await apiRequest<{ id: number }[]>('/portal/invoices');
    expect(before.map((invoice) => invoice.id)).toEqual([101, 102, 103]);

    await apiRequest('/auth/companies/switch', { method: 'POST', body: { tenantId: 2 } });

    const after = await apiRequest<{ id: number }[]>('/portal/invoices');
    expect(after.map((invoice) => invoice.id)).toEqual([201]);
  });

  it('nekar PDF- och betalningsanrop med samma ApiError-typ som resten av appen redan hanterar', async () => {
    await expect(apiRequest('/portal/invoices/101/pdf')).rejects.toThrow(ApiError);
    await expect(apiRequest('/portal/invoices/101/pay', { method: 'POST', body: {} })).rejects.toThrow(ApiError);
  });
});
