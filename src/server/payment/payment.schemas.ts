import z from 'zod';

export const CreatePaymentIntentSchema = z.object({
  amount: z.number().int().positive(),
  currency: z.string().length(3),
  customerId: z.string().uuid(),
});

export const PaymentIntentResponseSchema = z.object({
  paymentId: z.string().uuid(),
  status: z.enum(['pending', 'completed', 'failed']),
  clientSecret: z.string(),
});

export const WebhookSchema = z.object({
  type: z.string(),
  data: z.record(z.string(), z.unknown()),
});

export const IdempotencyHeaderSchema = z.object({
  'x-idempotency-key': z.string().min(1),
});

export const PaymentSchemas = {
  createIntent: {
    body: CreatePaymentIntentSchema,
    headers: IdempotencyHeaderSchema,
    response: {
      201: PaymentIntentResponseSchema,
    },
  },
  webhook: {
    body: WebhookSchema,
    response: {
      200: z.object({ received: z.boolean() }),
    },
  },
};

export type CreatePaymentIntentInput = z.infer<typeof CreatePaymentIntentSchema>;
export type PaymentIntentResponse = z.infer<typeof PaymentIntentResponseSchema>;
export type WebhookInput = z.infer<typeof WebhookSchema>;
