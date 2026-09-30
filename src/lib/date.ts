// Identisk med faktureringssystem-be/apps/portal/src/lib/date.ts — en enkel
// slice är trygg här eftersom backend alltid skickar ISO-datum.
export function toDateOnly(value: string): string {
  return value.slice(0, 10);
}
