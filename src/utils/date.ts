const DAY_MS = 24 * 60 * 60 * 1000;

export function parseYmd(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export function diffCalendarDaysInclusive(startDate: string, endDate: string): number {
  const start = parseYmd(startDate);
  const end = parseYmd(endDate);
  return Math.floor((end.getTime() - start.getTime()) / DAY_MS) + 1;
}

export function rangesOverlap(
  newStart: string,
  newEnd: string,
  existingStart: string,
  existingEnd: string
): boolean {
  return newStart <= existingEnd && existingStart <= newEnd;
}
