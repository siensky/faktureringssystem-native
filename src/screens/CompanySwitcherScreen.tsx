import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import * as companiesApi from '@/api/companies';
import { useAuth } from '@/auth/AuthContext';
import { Screen } from '@/components/Screen';
import { formatSEK } from '@/lib/money';
import type { AccountStackScreenProps } from '@/navigation/types';
import { CardSurface, Colors, DangerColors } from '@/theme/colors';
import type { CompanyOverviewEntry } from '@/types/contracts';

export function CompanySwitcherScreen({ navigation }: AccountStackScreenProps<'CompanySwitcher'>) {
  const { switchCompany } = useAuth();
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [switchingTenantId, setSwitchingTenantId] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['companies', 'overview'],
    queryFn: companiesApi.getCompaniesOverview,
  });

  async function openCompany(tenantId: number) {
    setSwitchError(null);
    setSwitchingTenantId(tenantId);
    try {
      await switchCompany(tenantId);
      navigation.goBack();
    } catch (err) {
      setSwitchError(err instanceof Error ? err.message : 'Kunde inte byta företag.');
    } finally {
      setSwitchingTenantId(null);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Dina företag</Text>

      {isLoading && <ActivityIndicator color={Colors.ink[900]} />}
      {error && <Text style={styles.errorText}>Kunde inte hämta dina företag.</Text>}
      {switchError && <Text style={styles.errorText}>{switchError}</Text>}
      {data && data.companies.length === 0 && <Text style={styles.empty}>Inga företag kopplade.</Text>}

      <FlatList<CompanyOverviewEntry>
        data={data?.companies}
        keyExtractor={(company) => String(company.tenantId)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => void openCompany(item.tenantId)}
            disabled={switchingTenantId !== null}
            accessibilityRole="button"
            accessibilityLabel={`Byt till ${item.tenantName}`}
            accessibilityState={{ disabled: switchingTenantId !== null }}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.tenantName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.main}>
              <Text style={styles.tenantName}>{item.tenantName}</Text>
              <Text style={styles.meta}>
                {item.outstandingInvoiceCount === 0
                  ? 'Inga obetalda fakturor'
                  : `${item.outstandingInvoiceCount} obetald${item.outstandingInvoiceCount === 1 ? '' : 'a'} faktura${item.outstandingInvoiceCount === 1 ? '' : 'r'}`}
              </Text>
            </View>
            {switchingTenantId === item.tenantId ? (
              <ActivityIndicator color={Colors.ink[900]} />
            ) : (
              <Text style={styles.amount}>{formatSEK(item.outstanding)}</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: Colors.ink[900], marginBottom: 16 },
  errorText: { color: DangerColors.text, backgroundColor: DangerColors.background, borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 12 },
  empty: { color: Colors.mist[400], marginBottom: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: CardSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.ink[50],
    padding: 16,
    marginBottom: 12,
  },
  avatar: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.ink[900], alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.sienna[300], fontWeight: '700' },
  main: { flex: 1 },
  tenantName: { color: Colors.ink[900], fontWeight: '600', fontSize: 15 },
  meta: { color: Colors.mist[500], fontSize: 13, marginTop: 2 },
  amount: { color: Colors.ink[900], fontWeight: '600' },
});
