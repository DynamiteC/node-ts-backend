import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import z from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { PaymentOrchestrator } from '../domain/payment/payment.orchestrator.js';
import { createMoney } from '../common/money.js';
import { isValidIdempotencyKey } from '../shared/idempotency.js';

// Strict Zod Schema for Input
const initiatePaymentSchema = z.object({
  amount: z.string().regex(/^\d+$/, 'Amount must be a numeric string (minor units)'),
  currency: z.string().length(3).toUpperCase(),
  referenceId: z.string().min(1),
});

export async function paymentRoutes(fastify: FastifyInstance) {
  // Dependency Injection (Orchestrator is stateless now)
  const orchestrator = new PaymentOrchestrator();

  fastify.post('/payments', {
    schema: {
      body: zodToJsonSchema(initiatePaymentSchema),
      headers: {
        type: 'object',
        properties: {
          'idempotency-key': { type: 'string', format: 'uuid' }
        },
        required: ['idempotency-key']
      }
    }
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const idempotencyKey = req.headers['idempotency-key'] as string;

    // Strict Idempotency Check
    if (!idempotencyKey || !isValidIdempotencyKey(idempotencyKey)) {
        req.log.warn('Invalid Idempotency Key');
        return reply.status(400).send({ error: 'Valid Idempotency-Key (UUID v7) header is required' });
    }

    // Validate Body
    const bodyResult = initiatePaymentSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return reply.status(400).send({ error: bodyResult.error });
    }
    const { amount, currency, referenceId } = bodyResult.data;

    // Orchestrate with Request Context (Trace ID)
    const result = await orchestrator.processPayment(
      { logger: req.log },
      {
        idempotencyKey,
        amount: createMoney(amount, currency),
        referenceId,
        source: 'API'
      }
    );

    if (!result.success) {
        return reply.status(400).send(result);
    }

    return reply.status(202).send(result);
  });
}
