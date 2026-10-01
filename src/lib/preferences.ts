import AsyncStorage from '@react-native-async-storage/async-storage';

// Icke-känslig lokal inställning — om användaren vill logga in med Face
// ID/Touch ID i stället för lösenord. AsyncStorage räcker gott för en
// enda boolean, ingen anledning till något tyngre.

const BIOMETRIC_ENABLED_KEY = 'mobile.biometricEnabled';

export async function getBiometricEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
  return value === 'true';
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
}
