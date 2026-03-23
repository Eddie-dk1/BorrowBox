const DAY_MS = 24 * 60 * 60 * 1000;

export function parseYmd(value) {
  return new Date(`${value}T00:00:00`);
}

export function diffCalendarDaysInclusive(startDate, endDate) {
  const start = parseYmd(startDate);
  const end = parseYmd(endDate);
  return Math.floor((end - start) / DAY_MS) + 1;
}

export function rangesOverlap(newStart, newEnd, existingStart, existingEnd) {
  return newStart <= existingEnd && existingStart <= newEnd;
}
