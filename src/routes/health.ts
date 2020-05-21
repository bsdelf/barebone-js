import { FastifyInstance } from 'fastify';

export const health = async (fastify: FastifyInstance) => {
  fastify.get('/health', async (_request, reply) => {
    reply.send({ status: 'ok' });
  });
};
