import * as LocalAuthentication from 'expo-local-authentication';

import { authenticateWithBiometrics, isBiometricLoginAvailable } from '../biometrics';

jest.mock('expo-local-authentication');

const mockedLocalAuth = LocalAuthentication as jest.Mocked<typeof LocalAuthentication>;

describe('isBiometricLoginAvailable', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('is true when the device has hardware and an enrolled biometric', async () => {
    mockedLocalAuth.hasHardwareAsync.mockResolvedValue(true);
    mockedLocalAuth.isEnrolledAsync.mockResolvedValue(true);

    expect(await isBiometricLoginAvailable()).toBe(true);
  });

  it('is false when there is no biometric hardware', async () => {
    mockedLocalAuth.hasHardwareAsync.mockResolvedValue(false);
    mockedLocalAuth.isEnrolledAsync.mockResolvedValue(true);

    expect(await isBiometricLoginAvailable()).toBe(false);
  });

  it('is false when hardware exists but nothing is enrolled', async () => {
    mockedLocalAuth.hasHardwareAsync.mockResolvedValue(true);
    mockedLocalAuth.isEnrolledAsync.mockResolvedValue(false);

    expect(await isBiometricLoginAvailable()).toBe(false);
  });
});

describe('authenticateWithBiometrics', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns true when the system reports success', async () => {
    mockedLocalAuth.authenticateAsync.mockResolvedValue({ success: true });

    expect(await authenticateWithBiometrics()).toBe(true);
  });

  it('returns false when the user cancels or authentication fails', async () => {
    mockedLocalAuth.authenticateAsync.mockResolvedValue({
      success: false,
      error: 'user_cancel',
    });

    expect(await authenticateWithBiometrics()).toBe(false);
  });
});
