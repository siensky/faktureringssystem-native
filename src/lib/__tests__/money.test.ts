import { formatSEK } from '../money';

// Intl.NumberFormat inlägger vanligtvis en mellanslagsvariant som inte är
// ett vanligt mellanslag (icke-brytande) — normaliseras bort så testet
// inte bryts av en osynlig teckenskillnad.
function normalizeSpaces(value: string): string {
  return value.replace(/ /g, ' ');
}

describe('formatSEK', () => {
  it('formats a whole number with two decimals and a kr suffix', () => {
    expect(normalizeSpaces(formatSEK(1000))).toBe('1 000,00 kr');
  });

  it('formats a decimal amount', () => {
    expect(normalizeSpaces(formatSEK(1234.5))).toBe('1 234,50 kr');
  });

  it('formats zero', () => {
    expect(normalizeSpaces(formatSEK(0))).toBe('0,00 kr');
  });
});
