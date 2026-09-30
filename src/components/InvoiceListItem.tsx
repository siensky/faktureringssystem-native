import { Pressable, StyleSheet, Text, View } from 'react-native';

import { toDateOnly } from '@/lib/date';
import { formatSEK } from '@/lib/money';
import { Colors } from '@/theme/colors';
import type { PortalInvoiceSummaryDto } from '@/types/contracts';

import { StatusBadge } from './StatusBadge';

export function InvoiceListItem({
  invoice,
  onPress,
}: {
  invoice: PortalInvoiceSummaryDto;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={styles.main}>
        <Text style={styles.invoiceNumber}>{invoice.invoiceNumber ?? '—'}</Text>
        <StatusBadge value={invoice.status} />
      </View>
      <View style={styles.meta}>
        <Text style={styles.due}>Förfaller {toDateOnly(invoice.dateDue)}</Text>
        <Text style={styles.amount}>{formatSEK(invoice.totalInclVat)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.ink[50] },
  rowPressed: { backgroundColor: Colors.sienna[50] },
  main: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  invoiceNumber: { fontSize: 16, fontWeight: '600', color: Colors.ink[900] },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  due: { color: Colors.mist[600], fontSize: 13 },
  amount: { color: Colors.ink[900], fontWeight: '600', fontSize: 14 },
});
