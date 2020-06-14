import test from 'ava';
import { buildFastifyServer } from '../utils';
import { healthRoute } from '../../src/routes/health';

test('GET /health', async (t) => {
  const fastify = await buildFastifyServer(t, healthRoute);
  const response = await fastify.inject({
    method: 'GET',
    url: '/health',
  });
  t.deepEqual(response.statusCode, 200);
  t.deepEqual(response.json(), { status: 'ok' });
});
