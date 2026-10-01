import type { PortalInvoiceSummaryDto } from '@/types/contracts';

export interface StatusChange {
  invoiceId: number;
  invoiceNumber: number | null;
  oldStatus: string;
  newStatus: string;
}

// Ren funktion, inget I/O — jämför två ögonblicksbilder av fakturalistan
// och returnerar bara de fakturor vars status faktiskt ändrats sedan
// förra kända listan. En helt ny faktura (finns i current men inte i
// previous) räknas inte som en statusändring.
export function findStatusChanges(
  previous: PortalInvoiceSummaryDto[],
  current: PortalInvoiceSummaryDto[],
): StatusChange[] {
  const previousById = new Map(previous.map((invoice) => [invoice.id, invoice]));
  const changes: StatusChange[] = [];

  for (const invoice of current) {
    const before = previousById.get(invoice.id);
    if (before && before.status !== invoice.status) {
      changes.push({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        oldStatus: before.status,
        newStatus: invoice.status,
      });
    }
  }

  return changes;
}
