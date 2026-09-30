// Identisk med faktureringssystem-be/apps/portal/src/lib/money.ts.
// API:t returnerar redan kronor (backend konverterar öre -> kronor sist),
// ingen konvertering behövs klientsidan.
export function formatSEK(kronor: number): string {
  return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(kronor);
}
