import fastify, { FastifyInstance } from 'fastify';
import { bootstrap, context, Application } from '../core';
import * as providers from '../providers';
import * as routes from '../routes';

class HttpApplication extends Application {
  static get options() {
    return {
      boolean: ['swagger'],
    };
  }

  private server?: FastifyInstance;

  async start(options: { swagger: boolean }) {
    const config = context.config.applications.http;

    // create server
    const server = fastify({
      ajv: {
        customOptions: {
          coerceTypes: true,
          allErrors: true,
        },
      },
      logger: context.logger,
    });

    // setup plugins
    if (options.swagger) {
      server.register(routes.swaggerRoute);
    }
    server.register(routes.errorHandler);
    server.register(routes.healthRoute);

    // start server
    await server.ready();
    const rouetList = server.printRoutes();
    context.logger.info(`Server routes:\n${rouetList}`);
    await server.listen(config.port, config.address);

    this.server = server;
  }

  async stop() {
    if (this.server) {
      context.logger.info(`Server shutdown...`);
      await this.server.close();
      this.server = undefined;
    }
  }
}

bootstrap(
  HttpApplication,
  providers.EnvProvider,
  providers.ConfigProvider,
  providers.LoggerProvider,
  providers.RedisProvider,
  providers.SequelizeProvider
);
