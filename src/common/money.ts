/**
 * Strict Money type definition to avoid floating point errors.
 *
 * Rule: Monetary values ALWAYS { currency: string, amount: string } or BigInt
 */
export interface Money {
  /**
   * ISO 4217 Currency Code (e.g., 'USD', 'INR')
   */
  currency: string;

  /**
   * Amount as a string to preserve precision.
   * Represents the minor unit (e.g., cents, paise).
   */
  amount: string;
}

/**
 * Helper to create Money safely
 */
export const createMoney = (amount: string | bigint, currency: string): Money => {
  return {
    amount: amount.toString(),
    currency: currency.toUpperCase()
  };
};
