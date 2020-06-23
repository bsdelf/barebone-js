import * as providers from '../src/providers';
import { bootstrap, Application } from '../src/core';
import { RedisHelper, SequelizeHelper } from './utils';

class InitTestApplication extends Application {
  async start() {
    console.log('Init test...');

    // clear redis
    const redisHelper = new RedisHelper();
    await redisHelper.clear();

    // reset sequelize
    const sequelizeHelper = new SequelizeHelper();
    await sequelizeHelper.reset();

    await this.exit();
  }
}

bootstrap(
  InitTestApplication,
  providers.EnvProvider,
  providers.ConfigProvider,
  providers.LoggerProvider,
  providers.RedisProvider,
  providers.SequelizeProvider
);
