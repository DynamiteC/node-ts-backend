import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { UserService } from '../../services/user.service.js';

const userRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new UserService(fastify);
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Schema Definitions
  const UserSchema = z.object({
      id: z.union([z.string(), z.number()]).optional(),
      name: z.string().min(2),
      email: z.string().email(),
  });

  app.get('/', {
    schema: {
      tags: ['Users'],
      response: {
        200: z.array(UserSchema)
      }
    }
  }, async () => {
    // Explicit casting to match schema since raw DB results might be any
    const users = await service.findAll();
    return users as z.infer<typeof UserSchema>[];
  });

  app.post('/', {
      schema: {
          tags: ['Users'],
          body: UserSchema.omit({ id: true }),
          response: {
              201: UserSchema
          }
      }
  }, async (req, reply) => {
      const newUser = await service.create(req.body);
      return reply.status(201).send(newUser as z.infer<typeof UserSchema>);
  });
};

export default userRoutes;
