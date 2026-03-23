export function calculateTotalPrice(totalDays, pricePerDay) {
  return totalDays * Number(pricePerDay || 0);
}
