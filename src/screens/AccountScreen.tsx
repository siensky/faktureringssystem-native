import { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { authenticateWithBiometrics, isBiometricLoginAvailable } from '@/auth/biometrics';
import { Screen } from '@/components/Screen';
import { errorFeedback, successFeedback } from '@/lib/haptics';
import { getBiometricEnabled, setBiometricEnabled } from '@/lib/preferences';
import type { AccountStackScreenProps } from '@/navigation/types';
import { CardSurface, Colors, DangerColors } from '@/theme/colors';

export function AccountScreen({ navigation }: AccountStackScreenProps<'AccountHome'>) {
  const { user, logout } = useAuth();
  const hasMultipleCompanies = (user?.companies?.length ?? 0) > 1;

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);

  useEffect(() => {
    (async () => {
      setBiometricAvailable(await isBiometricLoginAvailable());
      setBiometricEnabledState(await getBiometricEnabled());
    })();
  }, []);

  // Slår man på biometrisk inloggning görs en riktig Face ID/Touch
  // ID-prompt direkt, både som bekräftelse på att det faktiskt funkar på
  // enheten och som synlig feedback — annars sparas bara en boolean och
  // inget märks förrän nästa appstart, vilket lätt läser som trasigt.
  async function toggleBiometric(enabled: boolean) {
    if (enabled) {
      const approved = await authenticateWithBiometrics();
      if (!approved) {
        errorFeedback();
        return;
      }
      successFeedback();
    }
    setBiometricEnabledState(enabled);
    await setBiometricEnabled(enabled);
  }

  return (
    <Screen>
      <Text style={styles.title}>Konto</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Inloggad som</Text>
        <Text style={styles.value}>{user?.email ?? user?.customerName ?? '—'}</Text>
        <Text style={styles.label}>Företag</Text>
        <Text style={styles.value}>{user?.tenantName}</Text>
      </View>

      {biometricAvailable && (
        <View style={styles.row}>
          <Text style={styles.rowText}>Logga in med Face ID / Touch ID</Text>
          <Switch
            value={biometricEnabled}
            onValueChange={(value) => void toggleBiometric(value)}
            trackColor={{ true: Colors.sienna[400] }}
            accessibilityLabel="Logga in med Face ID / Touch ID"
          />
        </View>
      )}

      {hasMultipleCompanies && (
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('CompanySwitcher')}
          accessibilityRole="button"
          accessibilityLabel="Byt företag"
        >
          <Text style={styles.rowText}>Byt företag</Text>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => void logout()}
        accessibilityRole="button"
        accessibilityLabel="Logga ut"
      >
        <Text style={styles.logoutText}>Logga ut</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: Colors.ink[900], marginBottom: 16 },
  card: {
    backgroundColor: CardSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.ink[50],
    padding: 16,
    marginBottom: 16,
    gap: 4,
  },
  label: { color: Colors.mist[500], fontSize: 12, marginTop: 8 },
  value: { color: Colors.ink[900], fontSize: 15, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CardSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.ink[50],
    padding: 16,
    marginBottom: 16,
  },
  rowText: { color: Colors.ink[900], fontSize: 15, fontWeight: '600' },
  chevron: { color: Colors.mist[300] },
  logoutButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: DangerColors.background,
    padding: 14,
    alignItems: 'center',
    marginTop: 'auto',
  },
  logoutText: { color: DangerColors.text, fontWeight: '600' },
});
