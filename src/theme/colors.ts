// Handskriven spegling av faktureringssystem-be/apps/portal/tailwind.config.ts —
// samma ink (rubriker/primära knappar), mist (sekundär text/kantlinjer),
// sienna (bränd terrakotta-accent, används sparsamt) och cream (bakgrund).
export const Colors = {
  ink: {
    50: '#eef2f7',
    100: '#dce6f0',
    200: '#b7c9dc',
    300: '#8fa8c4',
    400: '#5f80a3',
    500: '#3f6084',
    600: '#2d4a68',
    700: '#213a53',
    800: '#17293c',
    900: '#101d2b',
    950: '#0a1420',
  },
  mist: {
    50: '#f4f6f8',
    100: '#e6ebf0',
    200: '#cdd7e0',
    300: '#a9b8c6',
    400: '#7e91a3',
    500: '#5f7286',
    600: '#4a5a6c',
    700: '#3a4756',
    800: '#2b3542',
    900: '#1f2730',
  },
  sienna: {
    50: '#fbf1ec',
    100: '#f4ded2',
    200: '#e6b99e',
    300: '#d6926a',
    400: '#c37142',
    500: '#a0522d',
    600: '#82401f',
    700: '#66331a',
    800: '#4d2715',
    900: '#331a0e',
  },
  cream: {
    50: '#faf9f5',
    100: '#f3f0e8',
    200: '#e8e3d6',
  },
} as const;

// Samma status → färg-karta som apps/portal/src/components/StatusBadge.tsx,
// fast som hex-par (RN har ingen Tailwind-klassmotor). paid/delivered
// använder Tailwinds standard-emerald, inte sienna — semantisk status ska
// hållas isär från varumärkesfärgen, annars läser "betald" inte längre
// som grönt/positivt.
export const STATUS_COLORS: Record<string, { background: string; text: string }> = {
  sent: { background: Colors.ink[50], text: Colors.ink[700] },
  paid: { background: '#d1fae5', text: '#065f46' },
  overdue: { background: '#fee2e2', text: '#b91c1c' },
  credited: { background: Colors.mist[100], text: Colors.mist[600] },
  superseded: { background: Colors.mist[100], text: Colors.mist[400] },
  settled: { background: Colors.mist[100], text: Colors.mist[700] },
  none: { background: Colors.mist[100], text: Colors.mist[500] },
  queued: { background: '#fef3c7', text: '#b45309' },
  delivered: { background: '#d1fae5', text: '#065f46' },
  bounced: { background: '#fee2e2', text: '#b91c1c' },
  failed: { background: '#fee2e2', text: '#b91c1c' },
};

export const DEFAULT_STATUS_COLOR = { background: Colors.mist[100], text: Colors.mist[700] };

// Delade ytfärger som annars hade blivit upprepade hex-literaler i varje
// screen — kortbakgrunder och felmeddelanden ser likadana ut överallt.
export const CardSurface = '#ffffff';
export const DangerColors = { background: '#fee2e2', text: '#b91c1c' };

/** Svensk visningstext för InvoiceStatus — används av StatusBadge och
 *  notiserna om statusändring, så de aldrig kan hamna i otakt. */
export const INVOICE_STATUS_LABELS: Record<string, string> = {
  draft: 'utkast',
  sent: 'skickad',
  paid: 'betald',
  overdue: 'förfallen',
  credited: 'krediterad',
  superseded: 'ersatt',
  settled: 'reglerad',
};
