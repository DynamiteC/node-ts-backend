import fp from 'fastify-plugin';
import fastifyMongodb from '@fastify/mongodb';

export default fp(async (fastify) => {
  if (fastify.config.MONGO_URL) {
    fastify.log.info('Registering MongoDB...');
    await fastify.register(fastifyMongodb, {
      url: fastify.config.MONGO_URL,
      forceClose: true
    });
  } else {
    fastify.log.debug('Skipping MongoDB (MONGO_URL not set)');
  }
}, {
    name: 'db-mongo',
    dependencies: ['config']
});
