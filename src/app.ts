import Fastify, { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { envPlugin } from './infra/config.js';
import { loggerOptions } from './infra/logger.js';
import { paymentRoutes } from './http/payment.controller.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: loggerOptions,
    disableRequestLogging: false,
  });

  // 1. Configuration (Must be registered first to be available)
  await app.register(envPlugin);

  // 2. Security Headers (Helmet)
  // Implementing strict CSP and HSTS as mandated by AGENTS.md
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        imgSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  });

  // 3. Rate Limiting
  // Protecting all routes by default
  await app.register(rateLimit, {
    max: 100, // 100 requests
    timeWindow: '1 minute', // per minute
    hook: 'preHandler', // Apply to all routes
    // allowList: ['127.0.0.1'], // Disable allowList for tests to verify rate limiting headers
  });

  // 4. Routes
  await app.register(paymentRoutes);

  // 5. Health Check
  app.get('/health', async () => {
    return { status: 'ok', uptime: process.uptime() };
  });

  return app;
}
