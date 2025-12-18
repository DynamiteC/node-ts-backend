import path from 'node:path';
import { db } from '../../common/connector.js';
import type { CreatePaymentIntentInput, PaymentIntentResponse } from './payment.schemas.js';

export const paymentDal = {
  createPaymentIntent: async (data: CreatePaymentIntentInput): Promise<PaymentIntentResponse> => {
    // Usage of internal safe connector
    // Resolving path relative to this file to work in both src (dev) and dist (prod)
    const queryPath = path.join(__dirname, 'payment.queries.json');

    // In a real app, this would use the SQL from queries.json
    await db.query(queryPath, 'createPaymentIntent', {
      amount: data.amount,
      currency: data.currency,
    });

    // Mock response
    return {
      paymentId: '123e4567-e89b-12d3-a456-426614174000', // Mock UUID
      status: 'pending',
      clientSecret: 'pi_123_secret_456',
    };
  },
};
