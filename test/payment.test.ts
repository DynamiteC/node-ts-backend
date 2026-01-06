import t from 'tap';
import { PaymentOrchestrator } from '../src/domain/payment/payment.orchestrator';
import { createMoney } from '../src/common/money';
import pino from 'pino';

const logger = pino({ level: 'silent' });
const mockContext = { logger };

t.test('Payment Orchestrator - Business Logic', async (t) => {
  const orchestrator = new PaymentOrchestrator();

  const result = await orchestrator.processPayment(mockContext, {
    idempotencyKey: '018b3263-5471-7000-81d3-375837651234', // Valid v7-like
    amount: createMoney('1000', 'USD'),
    referenceId: 'ref_123',
    source: 'TEST'
  });

  t.equal(result.success, true);
  t.equal(result.status, 'SUCCESS');
});

t.test('Payment Orchestrator - Invalid Amount', async (t) => {
    const orchestrator = new PaymentOrchestrator();

    const result = await orchestrator.processPayment(mockContext, {
      idempotencyKey: '018b3263-5471-7000-81d3-375837651234',
      amount: createMoney('-100', 'USD'),
      referenceId: 'ref_bad',
      source: 'TEST'
    });

    t.equal(result.success, false);
    t.equal(result.status, 'FAILED');
});
