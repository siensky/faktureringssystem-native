import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ApiError } from '@/api/client';
import * as invoicesApi from '@/api/invoices';
import { Screen } from '@/components/Screen';
import { StatusBadge } from '@/components/StatusBadge';
import { toDateOnly } from '@/lib/date';
import { errorFeedback, successFeedback } from '@/lib/haptics';
import { formatSEK } from '@/lib/money';
import { shareInvoicePdf } from '@/lib/shareInvoicePdf';
import type { InvoicesStackScreenProps } from '@/navigation/types';
import { CardSurface, Colors, DangerColors } from '@/theme/colors';

const PAYABLE_STATUSES = new Set(['sent', 'overdue']);

export function InvoiceDetailScreen({ route }: InvoicesStackScreenProps<'InvoiceDetail'>) {
  const { invoiceId } = route.params;
  const queryClient = useQueryClient();
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isOpeningPdf, setIsOpeningPdf] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isSharingPdf, setIsSharingPdf] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [isStartingPayment, setIsStartingPayment] = useState(false);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoices', invoiceId],
    queryFn: () => invoicesApi.getInvoice(invoiceId),
  });

  async function openPdf() {
    setPdfError(null);
    setIsOpeningPdf(true);
    try {
      const { url } = await invoicesApi.getInvoicePdfUrl(invoiceId);
      await WebBrowser.openBrowserAsync(url);
    } catch (err) {
      setPdfError(
        err instanceof ApiError && err.status === 404 ? 'PDF:en är inte klar än.' : 'Kunde inte hämta PDF:en.',
      );
    } finally {
      setIsOpeningPdf(false);
    }
  }

  async function startPayment() {
    setPayError(null);
    setIsStartingPayment(true);
    try {
      const { url } = await invoicesApi.payInvoice(invoiceId);
      await WebBrowser.openBrowserAsync(url);
      // Ingen deep-link-retur med ?payment=success som i portalen (kräver
      // en egen url-scheme-hantering) — vi nöjer oss med att hämta om
      // fakturan när in-app-browsern stängs, i väntan på att Stripes
      // webhook hunnit ikapp.
      await queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] });
      await queryClient.invalidateQueries({ queryKey: ['account-summary'] });
    } catch (err) {
      errorFeedback();
      setPayError(err instanceof Error ? err.message : 'Kunde inte starta betalningen.');
    } finally {
      setIsStartingPayment(false);
    }
  }

  async function sharePdf() {
    setShareError(null);
    setIsSharingPdf(true);
    try {
      const { url } = await invoicesApi.getInvoicePdfUrl(invoiceId);
      await shareInvoicePdf(url, invoice?.invoiceNumber ?? null);
      successFeedback();
    } catch (err) {
      errorFeedback();
      setShareError(
        err instanceof ApiError && err.status === 404 ? 'PDF:en är inte klar än.' : 'Kunde inte dela PDF:en.',
      );
    } finally {
      setIsSharingPdf(false);
    }
  }

  if (isLoading || !invoice) {
    return (
      <Screen>
        <ActivityIndicator color={Colors.ink[900]} style={styles.loading} />
      </Screen>
    );
  }

  const isPayable = PAYABLE_STATUSES.has(invoice.status) && invoice.remaining > 0;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Faktura {invoice.invoiceNumber}</Text>
          <StatusBadge value={invoice.status} />
        </View>

        {pdfError && <Text style={styles.errorText}>{pdfError}</Text>}
        {shareError && <Text style={styles.errorText}>{shareError}</Text>}
        {payError && <Text style={styles.errorText}>{payError}</Text>}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => void openPdf()}
            disabled={isOpeningPdf}
            accessibilityRole="button"
            accessibilityLabel="Öppna PDF"
            accessibilityState={{ disabled: isOpeningPdf }}
          >
            <Text style={styles.secondaryButtonText}>{isOpeningPdf ? 'Öppnar…' : 'Öppna PDF'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => void sharePdf()}
            disabled={isSharingPdf}
            accessibilityRole="button"
            accessibilityLabel="Dela PDF"
            accessibilityState={{ disabled: isSharingPdf }}
          >
            <Text style={styles.secondaryButtonText}>{isSharingPdf ? 'Delar…' : 'Dela PDF'}</Text>
          </TouchableOpacity>
          {isPayable && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => void startPayment()}
              disabled={isStartingPayment}
              accessibilityRole="button"
              accessibilityLabel="Betala nu"
              accessibilityState={{ disabled: isStartingPayment }}
            >
              <Text style={styles.primaryButtonText}>{isStartingPayment ? 'Startar…' : 'Betala nu'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoCard}>
          <View>
            <Text style={styles.infoLabel}>Fakturadatum</Text>
            <Text style={styles.infoValue}>{toDateOnly(invoice.dateIssued)}</Text>
          </View>
          <View>
            <Text style={styles.infoLabel}>Förfaller</Text>
            <Text style={styles.infoValue}>{toDateOnly(invoice.dateDue)}</Text>
          </View>
          <View>
            <Text style={styles.infoLabel}>OCR</Text>
            <Text style={styles.infoValue}>{invoice.ocrNumber ?? '—'}</Text>
          </View>
        </View>

        <View style={styles.linesCard}>
          {invoice.lines.map((line) => (
            <View key={line.position} style={styles.lineRow}>
              <View style={styles.lineMain}>
                <Text style={styles.lineDescription}>{line.description}</Text>
                <Text style={styles.lineMeta}>
                  {line.quantity} {line.unit} · {formatSEK(line.unitPrice)} · {line.vatRate}% moms
                </Text>
              </View>
              <Text style={styles.lineAmount}>{formatSEK(line.lineInclVat)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Summa exkl. moms</Text>
            <Text style={styles.summaryValue}>{formatSEK(invoice.totalExclVat)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Moms</Text>
            <Text style={styles.summaryValue}>{formatSEK(invoice.totalVat)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelStrong}>Totalt</Text>
            <Text style={styles.summaryValueStrong}>{formatSEK(invoice.totalInclVat)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryDivider]}>
            <Text style={styles.summaryLabel}>Betalt</Text>
            <Text style={styles.summaryValue}>{formatSEK(invoice.paid)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelStrong}>Återstår</Text>
            <Text style={styles.summaryValueStrong}>{formatSEK(invoice.remaining)}</Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.ink[900] },
  errorText: { color: DangerColors.text, backgroundColor: DangerColors.background, borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  secondaryButton: { borderWidth: 1, borderColor: Colors.ink[100], borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  secondaryButtonText: { color: Colors.ink[700], fontWeight: '600', fontSize: 14 },
  primaryButton: { backgroundColor: Colors.ink[900], borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  primaryButtonText: { color: CardSurface, fontWeight: '600', fontSize: 14 },
  infoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: CardSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.ink[50],
    padding: 16,
    marginBottom: 16,
  },
  infoLabel: { color: Colors.mist[500], fontSize: 12, marginBottom: 2 },
  infoValue: { color: Colors.ink[900], fontWeight: '600', fontSize: 14 },
  linesCard: {
    backgroundColor: CardSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.ink[50],
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  lineMain: { flex: 1, marginRight: 12 },
  lineDescription: { color: Colors.ink[900], fontSize: 14, marginBottom: 2 },
  lineMeta: { color: Colors.mist[500], fontSize: 12 },
  lineAmount: { color: Colors.ink[900], fontWeight: '600', fontSize: 14 },
  summaryCard: { backgroundColor: CardSurface, borderRadius: 12, borderWidth: 1, borderColor: Colors.ink[50], padding: 16, marginBottom: 32 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryDivider: { borderTopWidth: 1, borderTopColor: Colors.ink[50], marginTop: 4, paddingTop: 8 },
  summaryLabel: { color: Colors.mist[500], fontSize: 13 },
  summaryValue: { color: Colors.mist[500], fontSize: 13 },
  summaryLabelStrong: { color: Colors.ink[900], fontWeight: '700', fontSize: 14 },
  summaryValueStrong: { color: Colors.ink[900], fontWeight: '700', fontSize: 14 },
});
