import z from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // .transform(Number) makes the output number, so default should be number or string that is transformed?
  // Zod .default() applies to the input type if used before transform, or output if after?
  // Actually, standard pattern is: z.string().default('3000').transform(Number)
  // OR z.coerce.number().default(3000)
  PORT: z.coerce.number().default(3000),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  DATABASE_URL: z.string().url().default('postgres://user:pass@localhost:5432/db'), // Mock DB URL
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
});

export const env = envSchema.parse(process.env);
