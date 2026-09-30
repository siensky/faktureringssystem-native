// Handskriven spegling av de typer vi använder från @faktura/contracts i
// faktureringssystem-be/packages/contracts/src/rest/{invoices,portal,auth,
// company-overview}.ts. Ingen tsconfig path-mapping till det repot härifrån:
// den här appen ligger inte som ett syskonprojekt till backend-repot
// (faktureringssystem-native i ~/Downloads, faktureringssystem-be i
// ~/Desktop), och ett portfolio-repo ska funka fristående utan att en
// specifik mappstruktur på just den här datorn krävs. TokenPairResponse
// följer samma mönster som portalens egen api/auth.ts — den är inte del
// av det delade contracts-paketet där heller, utan definieras lokalt.

export type InvoiceType = 'invoice' | 'credit_note' | 'reminder';

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'paid'
  | 'overdue'
  | 'credited'
  | 'superseded'
  | 'settled';

export type DeliveryStatus = 'none' | 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed';

export interface PortalInvoiceSummaryDto {
  id: number;
  invoiceNumber: number | null;
  ocrNumber: string | null;
  invoiceType: InvoiceType;
  status: InvoiceStatus;
  deliveryStatus: DeliveryStatus;
  dateIssued: string;
  dateDue: string;
  currency: string;
  totalInclVat: number;
}

export interface PortalInvoiceLineDto {
  position: number;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number;
  lineExclVat: number;
  lineVat: number;
  lineInclVat: number;
}

export interface PortalInvoiceDetailDto extends PortalInvoiceSummaryDto {
  totalExclVat: number;
  totalVat: number;
  paid: number;
  remaining: number;
  sentAt: string | null;
  lines: PortalInvoiceLineDto[];
}

/** GET /portal/invoices/:id/pdf — tidsbegränsad, signerad S3-URL. */
export interface PortalInvoicePdfDto {
  url: string;
}

export interface PortalAccountSummaryDto {
  outstanding: number;
  outstandingInvoiceCount: number;
}

/** POST /portal/invoices/:id/pay — Stripe Checkout-session-URL. */
export interface PortalPaymentSessionDto {
  url: string;
}

export type UserRole = 'admin' | 'customer';

/** Ett av de företag en BankID-kundidentitet är länkad till. */
export interface CompanyLinkDto {
  tenantId: number;
  tenantName: string;
  customerId: number;
}

export interface CurrentUserDto {
  userId: number;
  tenantId: number;
  tenantName: string;
  email: string | null;
  role: UserRole;
  customerId: number | null;
  customerName: string | null;
  /** Bara satt för en BankID-kundidentitet med minst ett länkat företag. */
  companies?: CompanyLinkDto[];
}

export interface CompanyOverviewEntry extends CompanyLinkDto, PortalAccountSummaryDto {}

/** GET /auth/companies/overview */
export interface CompanyOverviewDto {
  companies: CompanyOverviewEntry[];
}
