import test, { ExecutionContext } from 'ava';
import fastify from 'fastify';
import { VertexFactory } from 'dag-maker';
import { context } from '../src/context';
import * as providers from '../src/providers';

export function initContext(...providerFactories: VertexFactory<any>[]) {
  test.before(async () => {
    await context.initialize({ providerFactories: providerFactories });
  });
  test.after(async () => {
    await context.finalize();
  });
}

export function initBasicContext() {
  initContext(providers.ConfigProvider, providers.RedisProvider, providers.SequelizeProvider);
}

type RoutePlugin = (fastify: fastify.FastifyInstance) => Promise<void>;

export async function buildFastifyServer(t: ExecutionContext<unknown>, ...routePlugins: RoutePlugin[]) {
  const server = fastify();
  for (const plugin of routePlugins) {
    server.register(plugin);
  }
  await server.ready();
  t.teardown(() => server.close());
  return server;
}
