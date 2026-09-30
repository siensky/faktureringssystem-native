import * as SecureStore from 'expo-secure-store';

import { clearTokens, getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from '../tokenStore';

jest.mock('expo-secure-store');

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('tokenStore', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setAccessToken(null);
  });

  it('keeps the access token in memory only', () => {
    setAccessToken('access-123');
    expect(getAccessToken()).toBe('access-123');
  });

  it('persists a new refresh token to SecureStore', async () => {
    await setRefreshToken('refresh-123');

    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith('mobile.refreshToken', 'refresh-123');
    expect(await getRefreshToken()).toBe('refresh-123');
  });

  it('removes the refresh token from SecureStore when cleared', async () => {
    await setRefreshToken(null);

    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('mobile.refreshToken');
    expect(await getRefreshToken()).toBeNull();
  });

  it('clearTokens wipes both the access and refresh token', async () => {
    setAccessToken('access-123');
    await setRefreshToken('refresh-123');

    await clearTokens();

    expect(getAccessToken()).toBeNull();
    expect(await getRefreshToken()).toBeNull();
  });
});
