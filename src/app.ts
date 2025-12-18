import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import autoload from '@fastify/autoload';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
    }
  });

  // Zod validation
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  // Load Plugins (Config, DBs, etc.)
  await fastify.register(autoload, {
    dir: path.join(__dirname, 'plugins'),
    encapsulate: false, // Plugins in /plugins are usually global shared utils
  });

  // Load Routes
  await fastify.register(autoload, {
    dir: path.join(__dirname, 'routes'),
    options: { prefix: '/api' },
  });

  return fastify;
}
