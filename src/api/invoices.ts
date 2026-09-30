import type {
  PortalAccountSummaryDto,
  PortalInvoiceDetailDto,
  PortalInvoicePdfDto,
  PortalInvoiceSummaryDto,
  PortalPaymentSessionDto,
} from '@/types/contracts';

import { apiRequest } from './client';

// Ingen sidbläddring — en enskild kunds fakturalista är i en helt annan
// storleksordning än en hel tenants. Backend cappar ändå hårt.
const LIMIT = 200;

export function listInvoices(): Promise<PortalInvoiceSummaryDto[]> {
  return apiRequest(`/portal/invoices?limit=${LIMIT}`);
}

export function getInvoice(id: number): Promise<PortalInvoiceDetailDto> {
  return apiRequest(`/portal/invoices/${id}`);
}

export function getInvoicePdfUrl(id: number): Promise<PortalInvoicePdfDto> {
  return apiRequest(`/portal/invoices/${id}/pdf`);
}

export function getAccountSummary(): Promise<PortalAccountSummaryDto> {
  return apiRequest('/portal/account-summary');
}

/** Ingen body — servern räknar fram beloppet ur den levande fakturan. */
export function payInvoice(id: number): Promise<PortalPaymentSessionDto> {
  return apiRequest(`/portal/invoices/${id}/pay`, { method: 'POST', body: {} });
}
