import * as LocalAuthentication from 'expo-local-authentication';

export async function isBiometricLoginAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
}

export async function authenticateWithBiometrics(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Logga in med Face ID / Touch ID',
    cancelLabel: 'Avbryt',
  });
  return result.success;
}
