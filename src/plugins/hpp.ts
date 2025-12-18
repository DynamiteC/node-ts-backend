import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import hpp from 'hpp';

// Adapter to use hpp with Fastify
// HPP is an express middleware but operates on req/res. Fastify request is different.
// However, HPP mainly cleans req.query and req.body.
// In Fastify, query parsing happens before handlers.
// We can try to use a preValidation hook.

const hppPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', (req, res, next) => {
    // HPP expects req.query and req.body to be available.
    // onRequest: query is available. body is not.
    // preValidation: body is available.

    // We will focus on query pollution here as HPP is mostly used for that in GETs
    // For Body, Fastify's schema validation usually handles type strictness (array vs string).

    // HPP requires a standard req/res or mock.
    // It modifies req.query directly.

    // Let's create a minimal wrapper.
    // Fastify req.query is the parsed object.

    const mockReq = {
      query: req.query,
      body: req.body,
    };

    // Run HPP
    // Casting as unknown first then appropriate types to satisfy linter if we had strict types for HPP (which are lacking here)
    // or just suppressing since we are adapting express middleware.
    // But strictly:
    hpp()(
      // Using unknown cast chain to satisfy linter regarding 'any' but still forcing type because we know HPP accepts duck typed objects mostly
      // biome-ignore lint/suspicious/noExplicitAny: HPP library uses Express types, incompatible with Fastify/Node native easily without full mock
      mockReq as any,
      // biome-ignore lint/suspicious/noExplicitAny: Mock response
      {} as any,
      () => {
        // Copy back changes
        req.query = mockReq.query;
        // req.body = mockReq.body; // Body not parsed in onRequest
        next();
      },
    );
  });
};

export default fp(hppPlugin, {
  name: 'fastify-hpp-adapter',
});
