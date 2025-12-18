import { describe, expect, it, vi } from 'vitest';
import { paymentService } from './payment.service.js';

vi.mock('../../common/connector.js', () => ({
  db: {
    query: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../common/queue.js', () => ({
  paymentQueue: {
    add: vi.fn().mockResolvedValue({ id: 'job-123' }),
  },
}));

vi.mock('ioredis', () => {
  return {
    default: class RedisMock {
      store = new Map();

      get = vi.fn().mockImplementation(async (key) => {
        return this.store.get(key);
      });

      set = vi.fn().mockImplementation(async (key, value, ...args) => {
        if (args.includes('NX')) {
          if (this.store.has(key)) return null;
          this.store.set(key, value);
          return 'OK';
        }
        this.store.set(key, value);
        return 'OK';
      });

      setex = vi.fn().mockImplementation(async (key, ttl, value) => {
        this.store.set(key, value);
        return 'OK';
      });

      del = vi.fn().mockImplementation(async (key) => {
        this.store.delete(key);
        return 1;
      });
    },
  };
});

describe('paymentService', () => {
  it('should create payment intent', async () => {
    const input = {
      amount: 1000,
      currency: 'USD',
      customerId: '123e4567-e89b-12d3-a456-426614174000',
    };

    const result = await paymentService.createPaymentIntent(input, 'idempotency-key-1');
    expect(result).toHaveProperty('paymentId');
    expect(result.status).toBe('pending');
  });

  it('should handle conflict (duplicate request in progress)', async () => {
    const input = {
      amount: 1000,
      currency: 'USD',
      customerId: '123e4567-e89b-12d3-a456-426614174000',
    };

    // First call (success)
    const result1 = await paymentService.createPaymentIntent(input, 'idempotency-key-2');
    expect(result1).toHaveProperty('paymentId');

    // Second call (should return cached)
    const result2 = await paymentService.createPaymentIntent(input, 'idempotency-key-2');
    expect(result2).toEqual(result1);
  });

  it('should handle webhook via queue', async () => {
    const result = await paymentService.handleWebhook('charge.succeeded', { id: 'evt_123' });
    expect(result).toEqual({ received: true });
  });
});
