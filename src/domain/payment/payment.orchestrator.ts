import { FastifyBaseLogger } from 'fastify';
import { Money } from '../../common/money.js';
import { Logger } from '../../infra/logger.js';

export interface PaymentRequest {
  idempotencyKey: string;
  amount: Money;
  referenceId: string;
  source: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  error?: string;
}

export interface PaymentContext {
  logger: Logger | FastifyBaseLogger;
}

export class PaymentOrchestrator {
  // Domain services should be stateless singletons where possible,
  // receiving context (logger/tracing) per method call.
  constructor() {}

  /**
   * Orchestrates the payment flow.
   *
   * Strict Rules Compliance:
   * - One-way dependency: Domain does not import HTTP.
   * - Money Safety: Uses strict Money type.
   * - Observability: Requires Logger with context (Request ID) passed in.
   */
  async processPayment(ctx: PaymentContext, request: PaymentRequest): Promise<PaymentResult> {
    const { idempotencyKey, amount, referenceId } = request;
    const { logger } = ctx;

    // Logs now include the Request ID from the http layer
    logger.info({
      msg: 'Initiating Payment',
      idempotencyKey,
      currency: amount.currency,
      referenceId
    });

    // 1. Validate Business Rules (Domain Logic)
    if (BigInt(amount.amount) <= 0n) {
        logger.warn({ msg: 'Invalid payment amount', amount });
        return {
            success: false,
            transactionId: '',
            status: 'FAILED',
            error: 'Amount must be positive'
        };
    }

    // TODO: 2. Check Idempotency (Infra call via interface)
    // TODO: 3. Interact with Payment Gateway (Infra call via interface, wrapped in Circuit Breaker)

    // Mock Result for now
    logger.info({ msg: 'Payment processed successfully', referenceId });

    return {
      success: true,
      transactionId: `tx_${Date.now()}`,
      status: 'SUCCESS'
    };
  }
}
