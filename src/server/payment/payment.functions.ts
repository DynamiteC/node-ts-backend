// Pure utility functions

export function calculateFees(amount: number): number {
  return Math.floor(amount * 0.02); // 2% fee
}

export function generateIdempotencyKey(data: unknown): string {
  return JSON.stringify(data); // Simplified hash
}
