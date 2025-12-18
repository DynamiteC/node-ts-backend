import type { FastifyInstance } from 'fastify';
import { paymentController } from './payment.controller.js';

export default async function paymentPlugin(fastify: FastifyInstance) {
  fastify.register(paymentController, { prefix: '/payments' });
}
