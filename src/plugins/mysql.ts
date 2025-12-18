import fp from 'fastify-plugin';
import fastifyMysql from '@fastify/mysql';

export default fp(async (fastify) => {
  if (fastify.config.MYSQL_URL) {
    fastify.log.info('Registering MySQL...');
    await fastify.register(fastifyMysql, {
      connectionString: fastify.config.MYSQL_URL,
      promise: true
    });
  } else {
    fastify.log.debug('Skipping MySQL (MYSQL_URL not set)');
  }
}, {
    name: 'db-mysql',
    dependencies: ['config']
});
