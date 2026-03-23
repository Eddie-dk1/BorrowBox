export function calculateTotalPrice(totalDays: number, pricePerDay: number | string): number {
  return totalDays * Number(pricePerDay || 0);
}
