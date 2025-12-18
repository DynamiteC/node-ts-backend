import { Queue } from 'bullmq';
import { env } from '../env.js';

// Shared Redis connection options
const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};

// Example queue for payment related background jobs
export const paymentQueue = new Queue('payment-jobs', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
  },
});

// Function to gracefully close queues
export async function closeQueues() {
  await paymentQueue.close();
}
