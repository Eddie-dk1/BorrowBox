import { describe, expect, it } from 'vitest';
import { diffCalendarDaysInclusive, rangesOverlap } from '../src/utils/date';

describe('date utils', () => {
  it('calculates inclusive day count', () => {
    expect(diffCalendarDaysInclusive('2026-03-01', '2026-03-01')).toBe(1);
    expect(diffCalendarDaysInclusive('2026-03-01', '2026-03-03')).toBe(3);
  });

  it('detects overlapping ranges using inclusive boundaries', () => {
    expect(rangesOverlap('2026-03-10', '2026-03-12', '2026-03-12', '2026-03-15')).toBe(true);
    expect(rangesOverlap('2026-03-10', '2026-03-12', '2026-03-13', '2026-03-15')).toBe(false);
  });
});
