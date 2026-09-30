import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text } from 'react-native';

import * as invoicesApi from '@/api/invoices';
import { AccountSummaryCard } from '@/components/AccountSummaryCard';
import { InvoiceListItem } from '@/components/InvoiceListItem';
import { Screen } from '@/components/Screen';
import { tapFeedback } from '@/lib/haptics';
import type { InvoicesStackScreenProps } from '@/navigation/types';
import { Colors } from '@/theme/colors';
import type { PortalInvoiceSummaryDto } from '@/types/contracts';
import { useInvoiceStatusNotifications } from '@/notifications/useInvoiceStatusNotifications';

export function InvoicesScreen({ navigation }: InvoicesStackScreenProps<'InvoicesList'>) {
  const [isRefetching, setIsRefetching] = useState(false);
  const summaryQuery = useQuery({ queryKey: ['account-summary'], queryFn: invoicesApi.getAccountSummary });
  const invoicesQuery = useQuery({ queryKey: ['invoices'], queryFn: invoicesApi.listInvoices });

  useInvoiceStatusNotifications(invoicesQuery.data);

  async function handleRefresh() {
    setIsRefetching(true);
    await Promise.all([summaryQuery.refetch(), invoicesQuery.refetch()]);
    setIsRefetching(false);
  }

  return (
    <Screen>
      <Text style={styles.title}>Mina fakturor</Text>
      <FlatList<PortalInvoiceSummaryDto>
        data={invoicesQuery.data}
        keyExtractor={(invoice) => String(invoice.id)}
        ListHeaderComponent={summaryQuery.data ? <AccountSummaryCard summary={summaryQuery.data} /> : null}
        ListEmptyComponent={
          invoicesQuery.isLoading ? (
            <ActivityIndicator color={Colors.ink[900]} style={styles.loading} />
          ) : (
            <Text style={styles.empty}>Inga fakturor än.</Text>
          )
        }
        renderItem={({ item }) => (
          <InvoiceListItem
            invoice={item}
            onPress={() => {
              tapFeedback();
              navigation.navigate('InvoiceDetail', { invoiceId: item.id });
            }}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => void handleRefresh()} tintColor={Colors.ink[900]} />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: Colors.ink[900], marginBottom: 16 },
  loading: { marginTop: 32 },
  empty: { textAlign: 'center', color: Colors.mist[400], marginTop: 32 },
});
