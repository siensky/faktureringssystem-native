import AsyncStorage from '@react-native-async-storage/async-storage';

import { getBiometricEnabled, setBiometricEnabled } from '../preferences';

describe('preferences', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('defaults to disabled when nothing has been stored', async () => {
    expect(await getBiometricEnabled()).toBe(false);
  });

  it('remembers that biometric login was enabled', async () => {
    await setBiometricEnabled(true);
    expect(await getBiometricEnabled()).toBe(true);
  });

  it('remembers that biometric login was disabled again', async () => {
    await setBiometricEnabled(true);
    await setBiometricEnabled(false);
    expect(await getBiometricEnabled()).toBe(false);
  });
});
