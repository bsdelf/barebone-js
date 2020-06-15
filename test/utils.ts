import { ExecutionContext, TestInterface } from 'ava';
import fastify from 'fastify';
import { VertexFactory } from 'dag-maker';
import { context } from '../src/context';
import * as providers from '../src/providers';
import * as commands from '../src/commands/migration';

export async function clearRedis() {
  const { keyPrefix } = context.config.providers.redis;
  if (!keyPrefix.startsWith('test')) {
    throw new Error(`Invalid key prefix ${keyPrefix}, must contain "test"`);
  }
  const prefixedKeys = await context.redis.keys(`${keyPrefix}*`);
  if (prefixedKeys.length > 0) {
    const keys = prefixedKeys.map((item) => item.slice(keyPrefix.length));
    await context.redis.del(keys);
  }
}

export async function clearSequelize() {
  const { database } = context.config.providers.sequelize;
  if (!database.includes('test')) {
    throw new Error(`Invalid database name "${database}", must contain "test"`);
  }
  await context.transactional(async (transaction) => {
    for (const model of Object.values(context.sequelize.models)) {
      await model.truncate({ transaction });
    }
  });
}

export async function resetSequelize() {
  const { database } = context.config.providers.sequelize;
  if (!database.includes('test')) {
    throw new Error(`Invalid database name "${database}", must contain "test"`);
  }
  for (const model of Object.values(context.sequelize.models)) {
    await model.drop();
  }
  const initCommand = new commands.MigrationInitCommand();
  await initCommand.run();
  const upCommand = new commands.MigrationUpCommand();
  await upCommand.run();
}

export function initContext(test: TestInterface, ...providerFactories: VertexFactory<any>[]) {
  test.before(async () => {
    await context.initialize({ providerFactories: providerFactories });
  });
  test.after(async () => {
    await context.finalize();
  });
}

export function initBasicContext(test: TestInterface) {
  initContext(test, providers.ConfigProvider, providers.RedisProvider, providers.SequelizeProvider);
}

type RoutePlugin = (fastify: fastify.FastifyInstance) => Promise<void>;

export async function buildFastifyServer(
  t: ExecutionContext<unknown>,
  ...routePlugins: RoutePlugin[]
) {
  const server = fastify();
  for (const plugin of routePlugins) {
    server.register(plugin);
  }
  await server.ready();
  t.teardown(() => server.close());
  return server;
}
