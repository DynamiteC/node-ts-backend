import fp from 'fastify-plugin';
import fastifyPostgres from '@fastify/postgres';

export default fp(async (fastify) => {
  if (fastify.config.POSTGRES_URL) {
    fastify.log.info('Registering Postgres...');
    await fastify.register(fastifyPostgres, {
      connectionString: fastify.config.POSTGRES_URL,
    });
  } else {
    fastify.log.debug('Skipping Postgres (POSTGRES_URL not set)');
  }
}, {
    name: 'db-postgres',
    dependencies: ['config']
});
