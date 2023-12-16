
export function calculateRound(total: number, totalLength: number) {
  return Math.round(total / totalLength) ? Math.round(total / totalLength) : 0
}