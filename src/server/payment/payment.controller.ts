import type { FastifyInstance } from 'fastify';
import {
  type CreatePaymentIntentInput,
  type PaymentIntentResponse,
  PaymentSchemas,
  type WebhookInput,
} from './payment.schemas.js';
import { paymentService } from './payment.service.js';

export async function paymentController(fastify: FastifyInstance) {
  fastify.post<{ Body: CreatePaymentIntentInput; Reply: PaymentIntentResponse }>(
    '/intent',
    {
      schema: PaymentSchemas.createIntent,
    },
    async (request, reply) => {
      const idempotencyKey = request.headers['x-idempotency-key'] as string;

      request.log.info({ msg: 'Creating payment intent', idempotencyKey });

      try {
        const result = await paymentService.createPaymentIntent(request.body, idempotencyKey);
        return reply.status(201).send(result);
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message.includes('Circuit Open')) {
            return reply.status(503).send({
              error: 'Service Temporarily Unavailable',
            } as unknown as PaymentIntentResponse);
          }
          if (error.message.includes('Conflict')) {
            return reply
              .status(409)
              .send({ error: error.message } as unknown as PaymentIntentResponse);
          }
        }
        throw error;
      }
    },
  );

  fastify.post<{ Body: WebhookInput }>(
    '/webhooks/stripe',
    {
      schema: PaymentSchemas.webhook,
    },
    async (request, reply) => {
      await paymentService.handleWebhook(request.body.type, request.body.data);
      return reply.status(200).send({ received: true });
    },
  );
}
