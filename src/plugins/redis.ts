import fp from 'fastify-plugin';
import fastifyRedis from '@fastify/redis';

export default fp(async (fastify) => {
  if (fastify.config.REDIS_URL) {
    fastify.log.info('Registering Redis...');
    await fastify.register(fastifyRedis, {
      url: fastify.config.REDIS_URL,
    });
  } else {
    fastify.log.debug('Skipping Redis (REDIS_URL not set)');
  }
}, {
    name: 'db-redis',
    dependencies: ['config']
});
