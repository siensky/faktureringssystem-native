// Fixturdata för demoläget (EXPO_PUBLIC_USE_MOCKS=true, se client.ts).
// Två påhittade bolag med olika fakturastatusar, tillräckligt för att
// visa upp listan, detaljvyn och företagsbytet utan en riktig backend.

import type {
  CompanyOverviewDto,
  CurrentUserDto,
  PortalAccountSummaryDto,
  PortalInvoiceDetailDto,
  PortalInvoiceLineDto,
  PortalInvoiceSummaryDto,
} from '@/types/contracts';

const TENANTS: Record<number, string> = {
  1: 'Nordic Bygg AB',
  2: 'Solvik Konsult AB',
};

export function mockUserFor(tenantId: number): CurrentUserDto {
  const tenantName = TENANTS[tenantId] ?? TENANTS[1];
  return {
    userId: 1,
    tenantId,
    tenantName,
    email: 'demo@faktura.se',
    role: 'customer',
    customerId: tenantId,
    customerName: tenantName,
    companies: [
      { tenantId: 1, tenantName: TENANTS[1], customerId: 1 },
      { tenantId: 2, tenantName: TENANTS[2], customerId: 2 },
    ],
  };
}

export const MOCK_INVOICES: Record<number, PortalInvoiceSummaryDto[]> = {
  1: [
    {
      id: 101,
      invoiceNumber: 1042,
      ocrNumber: '150401042009',
      invoiceType: 'invoice',
      status: 'overdue',
      deliveryStatus: 'delivered',
      dateIssued: '2026-08-01',
      dateDue: '2026-08-31',
      currency: 'SEK',
      totalInclVat: 12500,
    },
    {
      id: 102,
      invoiceNumber: 1043,
      ocrNumber: '150401043006',
      invoiceType: 'invoice',
      status: 'sent',
      deliveryStatus: 'delivered',
      dateIssued: '2026-09-01',
      dateDue: '2026-09-30',
      currency: 'SEK',
      totalInclVat: 8400,
    },
    {
      id: 103,
      invoiceNumber: 1031,
      ocrNumber: '150401031002',
      invoiceType: 'invoice',
      status: 'paid',
      deliveryStatus: 'delivered',
      dateIssued: '2026-07-01',
      dateDue: '2026-07-31',
      currency: 'SEK',
      totalInclVat: 6200,
    },
  ],
  2: [
    {
      id: 201,
      invoiceNumber: 2011,
      ocrNumber: '150402011005',
      invoiceType: 'invoice',
      status: 'sent',
      deliveryStatus: 'delivered',
      dateIssued: '2026-09-10',
      dateDue: '2026-10-10',
      currency: 'SEK',
      totalInclVat: 4300,
    },
  ],
};

interface DetailExtras {
  totalExclVat: number;
  totalVat: number;
  paid: number;
  lines: PortalInvoiceLineDto[];
}

const DETAIL_EXTRAS: Record<number, DetailExtras> = {
  101: {
    totalExclVat: 10000,
    totalVat: 2500,
    paid: 0,
    lines: [
      { position: 1, description: 'Fakturaavgift augusti', quantity: 1, unit: 'st', unitPrice: 10000, vatRate: 25, lineExclVat: 10000, lineVat: 2500, lineInclVat: 12500 },
    ],
  },
  102: {
    totalExclVat: 6720,
    totalVat: 1680,
    paid: 0,
    lines: [
      { position: 1, description: 'Konsulttjänster september', quantity: 1, unit: 'st', unitPrice: 6720, vatRate: 25, lineExclVat: 6720, lineVat: 1680, lineInclVat: 8400 },
    ],
  },
  103: {
    totalExclVat: 4960,
    totalVat: 1240,
    paid: 6200,
    lines: [
      { position: 1, description: 'Konsulttjänster juli', quantity: 1, unit: 'st', unitPrice: 4960, vatRate: 25, lineExclVat: 4960, lineVat: 1240, lineInclVat: 6200 },
    ],
  },
  201: {
    totalExclVat: 3440,
    totalVat: 860,
    paid: 0,
    lines: [
      { position: 1, description: 'Rådgivning september', quantity: 1, unit: 'st', unitPrice: 3440, vatRate: 25, lineExclVat: 3440, lineVat: 860, lineInclVat: 4300 },
    ],
  },
};

export function mockInvoiceDetail(id: number): PortalInvoiceDetailDto | undefined {
  const summary = Object.values(MOCK_INVOICES)
    .flat()
    .find((invoice) => invoice.id === id);
  const extra = DETAIL_EXTRAS[id];
  if (!summary || !extra) return undefined;

  return {
    ...summary,
    totalExclVat: extra.totalExclVat,
    totalVat: extra.totalVat,
    paid: extra.paid,
    remaining: summary.totalInclVat - extra.paid,
    sentAt: summary.dateIssued,
    lines: extra.lines,
  };
}

const ACCOUNT_SUMMARIES: Record<number, PortalAccountSummaryDto> = {
  1: { outstanding: 20900, outstandingInvoiceCount: 2 },
  2: { outstanding: 4300, outstandingInvoiceCount: 1 },
};

export function mockAccountSummary(tenantId: number): PortalAccountSummaryDto {
  return ACCOUNT_SUMMARIES[tenantId] ?? ACCOUNT_SUMMARIES[1];
}

export function mockCompaniesOverview(): CompanyOverviewDto {
  return {
    companies: [
      { tenantId: 1, tenantName: TENANTS[1], customerId: 1, ...ACCOUNT_SUMMARIES[1] },
      { tenantId: 2, tenantName: TENANTS[2], customerId: 2, ...ACCOUNT_SUMMARIES[2] },
    ],
  };
}

export const MOCK_TOKENS = {
  accessToken: 'demo-access-token',
  refreshToken: 'demo-refresh-token',
  expiresIn: 3600,
  tokenType: 'Bearer' as const,
};
