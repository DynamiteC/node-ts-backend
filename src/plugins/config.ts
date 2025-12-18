import fp from 'fastify-plugin';
import fastifyEnv from '@fastify/env';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  // Database URLs - Optional
  POSTGRES_URL: z.string().optional(),
  MYSQL_URL: z.string().optional(),
  MONGO_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
});

declare module 'fastify' {
  interface FastifyInstance {
    config: z.infer<typeof schema>;
  }
}

export default fp(async (fastify) => {
  await fastify.register(fastifyEnv, {
    confKey: 'config',
    schema: {
        type: 'object',
        properties: {
            NODE_ENV: { type: 'string', default: 'development' },
            PORT: { type: 'number', default: 3000 },
            LOG_LEVEL: { type: 'string', default: 'info' },
            POSTGRES_URL: { type: 'string' },
            MYSQL_URL: { type: 'string' },
            MONGO_URL: { type: 'string' },
            REDIS_URL: { type: 'string' },
        }
    },
    data: process.env, // Load from process.env directly (dotenv loaded in server.ts or via -r dotenv/config)
    dotenv: true // or let fastify-env handle .env loading
  });

  // Zod validation on top if strict typing needed beyond JSON Schema,
  // but fastify-env uses AJV. For boilerplate simplicity we rely on fastify-env's schema
  // which maps to our Zod types roughly.
}, {
  name: 'config'
});
