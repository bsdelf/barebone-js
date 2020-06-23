import { ExecutionContext, TestInterface } from 'ava';
import fastify from 'fastify';
import { VertexFactory } from 'dag-maker';
import { context } from '../src/core';
import { RedisProviderConfig } from '../src/libraries';
import * as providers from '../src/providers';
import * as commands from '../src/commands/migration';

export class RedisHelper {
  private config: RedisProviderConfig;

  constructor() {
    const config = context.config.providers.redis;
    if (!config.keyPrefix.startsWith) {
      throw new Error(`Invalid key prefix ${config.keyPrefix}, must start with "test"`);
    }
    this.config = config;
  }

  /**
   * Clear Redis.
   */
  async clear() {
    const prefixedKeys = await context.redis.keys(`${this.config.keyPrefix}*`);
    if (prefixedKeys.length > 0) {
      const keys = prefixedKeys.map((item) => item.slice(this.config.keyPrefix.length));
      await context.redis.del(keys);
    }
  }
}

export class SequelizeHelper {
  constructor() {
    const { database } = context.config.providers.sequelize;
    if (!database.endsWith('test')) {
      throw new Error(`Invalid database name "${database}", must end with "test"`);
    }
  }

  /**
   * Clear all tables.
   */
  async clear() {
    await context.transactional(async (transaction) => {
      for (const model of Object.values(context.sequelize.models)) {
        await model.truncate({ transaction });
      }
    });
  }

  /**
   * Recreate all tables.
   */
  async reset() {
    for (const model of Object.values(context.sequelize.models)) {
      await model.drop();
    }
    const initCommand = new commands.MigrationInitCommand();
    await initCommand.run();
    const upCommand = new commands.MigrationUpCommand();
    await upCommand.run();
  }
}

/**
 * Use context in test.
 * @param test ava test interface.
 * @param providerFactories provider factories.
 */
export function useContext(test: TestInterface, ...providerFactories: VertexFactory<any>[]) {
  // initialize context before test
  test.before(async () => {
    await context.initialize({ providerFactories: providerFactories });
  });

  // reset redis and sequelize for each test
  test.beforeEach(async () => {
    const redisHelper = new RedisHelper();
    const sequelizeHelper = new SequelizeHelper();
    await Promise.all([redisHelper.clear(), sequelizeHelper.clear()]);
  });

  // finalize context after test
  test.after(async () => {
    await context.finalize();
  });
}

/**
 * Use predefined context in test.
 * @param test ava test interface.
 */
export function useBasicContext(test: TestInterface) {
  useContext(test, providers.ConfigProvider, providers.RedisProvider, providers.SequelizeProvider);
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
