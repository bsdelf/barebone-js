import { FastifyInstance } from 'fastify';

export async function healthRoute(server: FastifyInstance) {
  server.get(
    '/health',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      reply.send({ status: 'ok' });
    }
  );
}
