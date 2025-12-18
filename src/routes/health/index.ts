import type { FastifyPluginAsync } from 'fastify';
import '@fastify/postgres';
import '@fastify/mysql';
import '@fastify/mongodb';
import '@fastify/redis';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        postgres: !!fastify.pg,
        mysql: !!fastify.mysql,
        mongo: !!fastify.mongo,
        redis: !!fastify.redis
      }
    };
  });
};

export default healthRoutes;
