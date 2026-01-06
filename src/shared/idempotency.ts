import { v7 as uuidv7 } from 'uuid';

/**
 * Interface for Idempotency logic
 */
export interface IdempotencyContext {
  key: string;
  scope: string; // e.g., 'PAYMENT_INIT', 'REFUND'
}

/**
 * Generates a version 7 UUID for use as an Idempotency Key.
 * UUID v7 is time-ordered, providing better database indexing performance.
 */
export const generateIdempotencyKey = (): string => {
  return uuidv7();
};

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates format of an idempotency key (basic UUID check for now)
 * Optimized: Regex is defined at module scope to avoid recompilation on every call.
 */
export const isValidIdempotencyKey = (key: string): boolean => {
  return uuidRegex.test(key);
};
