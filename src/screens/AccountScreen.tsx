import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { Screen } from '@/components/Screen';
import type { AccountStackScreenProps } from '@/navigation/types';
import { Colors } from '@/theme/colors';

export function AccountScreen({ navigation }: AccountStackScreenProps<'AccountHome'>) {
  const { user, logout } = useAuth();
  const hasMultipleCompanies = (user?.companies?.length ?? 0) > 0;

  return (
    <Screen>
      <Text style={styles.title}>Konto</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Inloggad som</Text>
        <Text style={styles.value}>{user?.email ?? user?.customerName ?? '—'}</Text>
        <Text style={styles.label}>Företag</Text>
        <Text style={styles.value}>{user?.tenantName}</Text>
      </View>

      {hasMultipleCompanies && (
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('CompanySwitcher')}>
          <Text style={styles.rowText}>Byt företag</Text>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={() => void logout()}>
        <Text style={styles.logoutText}>Logga ut</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: Colors.ink[900], marginBottom: 16 },
  card: {
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
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
    borderColor: '#fee2e2',
    padding: 14,
    alignItems: 'center',
    marginTop: 'auto',
  },
  logoutText: { color: '#b91c1c', fontWeight: '600' },
});
