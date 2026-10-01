import { toDateOnly } from '../date';

describe('toDateOnly', () => {
  it('extracts the date part from an ISO timestamp', () => {
    expect(toDateOnly('2026-03-15T10:30:00.000Z')).toBe('2026-03-15');
  });

  it('returns a plain date string unchanged', () => {
    expect(toDateOnly('2026-03-15')).toBe('2026-03-15');
  });
});
