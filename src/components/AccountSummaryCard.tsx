import { StyleSheet, Text, View } from 'react-native';

import { formatSEK } from '@/lib/money';
import { Colors } from '@/theme/colors';
import type { PortalAccountSummaryDto } from '@/types/contracts';

export function AccountSummaryCard({ summary }: { summary: PortalAccountSummaryDto }) {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>kr</Text>
      </View>
      <View>
        <Text style={styles.label}>Utestående skuld</Text>
        <Text style={styles.amount}>{formatSEK(summary.outstanding)}</Text>
        <Text style={styles.label}>
          {summary.outstandingInvoiceCount === 1
            ? '1 obetald faktura'
            : `${summary.outstandingInvoiceCount} obetalda fakturor`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.ink[50],
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.ink[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { color: Colors.sienna[300], fontWeight: '700', fontSize: 16 },
  label: { color: Colors.mist[500], fontSize: 14 },
  amount: { color: Colors.ink[900], fontSize: 24, fontWeight: '600' },
});
