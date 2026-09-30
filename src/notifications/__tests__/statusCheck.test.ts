import type { PortalInvoiceSummaryDto } from '@/types/contracts';

import { findStatusChanges } from '../statusCheck';

function invoice(overrides: Partial<PortalInvoiceSummaryDto> & { id: number }): PortalInvoiceSummaryDto {
  return {
    invoiceNumber: 100,
    ocrNumber: null,
    invoiceType: 'invoice',
    status: 'sent',
    deliveryStatus: 'delivered',
    dateIssued: '2026-01-01',
    dateDue: '2026-01-31',
    currency: 'SEK',
    totalInclVat: 1000,
    ...overrides,
  };
}

describe('findStatusChanges', () => {
  it('returns no changes when nothing changed', () => {
    const invoices = [invoice({ id: 1 })];
    expect(findStatusChanges(invoices, invoices)).toEqual([]);
  });

  it('detects a status change on an existing invoice', () => {
    const previous = [invoice({ id: 1, status: 'sent' })];
    const current = [invoice({ id: 1, status: 'paid' })];

    expect(findStatusChanges(previous, current)).toEqual([
      { invoiceId: 1, invoiceNumber: 100, oldStatus: 'sent', newStatus: 'paid' },
    ]);
  });

  it('ignores brand new invoices with no previous state', () => {
    const current = [invoice({ id: 1 })];
    expect(findStatusChanges([], current)).toEqual([]);
  });

  it('only reports the invoices whose status actually changed', () => {
    const previous = [invoice({ id: 1, status: 'sent' }), invoice({ id: 2, status: 'paid' })];
    const current = [invoice({ id: 1, status: 'overdue' }), invoice({ id: 2, status: 'paid' })];

    expect(findStatusChanges(previous, current)).toEqual([
      { invoiceId: 1, invoiceNumber: 100, oldStatus: 'sent', newStatus: 'overdue' },
    ]);
  });
});
