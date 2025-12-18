import Redis from 'ioredis';
import CircuitBreaker from 'opossum';
import { paymentQueue } from '../../common/queue.js';
import { env } from '../../env.js';
import { paymentDal } from './payment.dal.js';
import type { CreatePaymentIntentInput, PaymentIntentResponse } from './payment.schemas.js';

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  lazyConnect: true, // Don't connect immediately during build/test if not needed
  enableAutoPipelining: true,
});

// Circuit Breaker Options: 50% error or >800ms -> open circuit -> exponential backoff 30s-5min
const breakerOptions = {
  timeout: 800, // 800ms
  errorThresholdPercentage: 50,
  resetTimeout: 30000, // 30s
};

// Mock External Gateway Call
const gatewayCall = async (data: CreatePaymentIntentInput) => {
  // Simulate external call
  return await paymentDal.createPaymentIntent(data);
};

const breaker = new CircuitBreaker(gatewayCall, breakerOptions);
breaker.fallback(() => {
  throw new Error('Service Unavailable (Circuit Open)');
});

export const paymentService = {
  createPaymentIntent: async (
    data: CreatePaymentIntentInput,
    idempotencyKey: string,
  ): Promise<PaymentIntentResponse> => {
    const key = `idempotency:${idempotencyKey}`;

    // Check if result already exists
    const cached = await redis.get(key);
    if (cached) {
      // If it's a special "processing" marker, return 409
      if (cached === 'PROCESSING') {
        throw new Error('Conflict: Request already in progress'); // Will be mapped to 409
      }
      return JSON.parse(cached);
    }

    // Attempt to acquire lock
    // SET key value NX EX 30 (lock for 30s to process)
    const acquired = await redis.set(key, 'PROCESSING', 'EX', 30, 'NX');
    if (!acquired) {
      // Could not acquire lock, meaning someone else is processing OR it finished in the split second
      // Check again
      const recheck = await redis.get(key);
      if (recheck && recheck !== 'PROCESSING') {
        return JSON.parse(recheck);
      }
      throw new Error('Conflict: Request already in progress');
    }

    try {
      // Circuit Breaker wrapped call
      const result = await breaker.fire(data);

      // Store result (TTL 24h) and overwrite the processing lock
      await redis.setex(key, 86400, JSON.stringify(result));

      return result;
    } catch (err) {
      // If processing failed, remove the lock so user can retry
      await redis.del(key);
      throw err;
    }
  },

  handleWebhook: async (type: string, payload: unknown) => {
    // Process webhook logic asynchronously via queue (Reliability/Scalability)
    await paymentQueue.add('webhook-processing', { type, payload });
    return { received: true };
  },
};
