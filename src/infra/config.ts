import fastifyEnv from '@fastify/env';
import { FastifyInstance } from 'fastify';
import z from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  PORT: z.string().default('3000').transform(Number),

  // Resilience Defaults
  RESILIENCE_TIMEOUT_DEFAULT_MS: z.string().default('5000').transform(Number),

  // Example Feature Toggle
  FEATURE_PAYMENT_V2: z.string().default('false').transform((s) => s === 'true'),
});

declare module 'fastify' {
  interface FastifyInstance {
    config: z.infer<typeof envSchema>;
  }
}

export const envPlugin = async (fastify: FastifyInstance) => {
  await fastify.register(fastifyEnv, {
    confKey: 'config',
    schema: zodToJsonSchema(envSchema),
    dotenv: true,
  });
};
