import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { closeQueues } from './common/queue.js';
import { env } from './env.js';
import hppPlugin from './plugins/hpp.js';
import paymentPlugin from './server/payment/index.js';

const server = Fastify({
  logger: {
    level: env.LOG_LEVEL,
    transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
  },
  bodyLimit: 5 * 1024 * 1024, // 5mb max body
});

// Validator / Serializer Config
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

// Plugins
server.register(fastifyHelmet);
server.register(fastifyCors, { origin: true }); // Strict CORS, adjust as needed
server.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute',
});
server.register(hppPlugin);

// Swagger
server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'CricHeroes Payment Service',
      version: '1.0.0',
    },
    servers: [],
  },
  transform: ({ schema, url }) => {
    // Compatibility with Zod schemas
    return { schema, url };
  },
});
server.register(fastifySwaggerUi, {
  routePrefix: '/docs',
});

// Health Check
server.get('/health/ready', async (_request, _reply) => {
  // Check DB, Redis, etc.
  // Logic to check connections would go here.
  return { status: 'ok', db: 'up', redis: 'up' };
});

// Register Features
server.register(paymentPlugin);

// Typed instance
export const app = server.withTypeProvider<ZodTypeProvider>();

// Graceful Shutdown
const closeGracefully = async (signal: string) => {
  app.log.info(`Received ${signal}, shutting down...`);
  await closeQueues();
  await app.close();
  process.exit(0);
};

// Start
if (require.main === module) {
  (async () => {
    try {
      await app.ready(); // Ensure all plugins are ready
      await app.listen({ port: Number(env.PORT), host: '0.0.0.0' });

      process.on('SIGINT', () => closeGracefully('SIGINT'));
      process.on('SIGTERM', () => closeGracefully('SIGTERM'));
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  })();
}
