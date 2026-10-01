import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Laddar ner PDF:en till en lokal fil och öppnar den native delningsmenyn
// (Filer, mejl, AirDrop m.m.) — Sharing.shareAsync kräver en lokal file://
// -uri, inte en fjärr-URL.
export async function shareInvoicePdf(pdfUrl: string, invoiceNumber: number | null): Promise<void> {
  const destination = new File(Paths.cache, `faktura-${invoiceNumber ?? 'okand'}.pdf`);
  const file = await File.downloadFileAsync(pdfUrl, destination, { idempotent: true });
  await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf' });
}
