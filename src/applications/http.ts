import { ServerResponse } from 'http';
import fastify, { FastifyInstance } from 'fastify';
import fastifySwagger from 'fastify-swagger';
import yargsParser from 'yargs-parser';
import { bootstrap, context } from '../context';
import * as providers from '../providers';
import * as routes from '../routes';
import * as errors from '../libraries/errors';

interface Options {
  swagger?: boolean;
}

const parserOptions = {
  boolean: ['swagger'],
};

const enableSwagger = (server: FastifyInstance) => {
  server.register(fastifySwagger, {
    routePrefix: '/swagger',
    swagger: {
      info: {
        title: 'Swagger documentation',
        description: '',
        version: '0.1.0',
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here',
      },
      host: 'localhost',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
    },
    exposeRoute: true,
  });
};

const main = async () => {
  const config = context.config.applications.http;
  const options = yargsParser(process.argv.slice(2), parserOptions) as Options;

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

  // setup error handlers
  const errorHandler = (
    error: fastify.FastifyError,
    _request: fastify.FastifyRequest,
    reply: fastify.FastifyReply<ServerResponse>
  ) => {
    let errorName = error.name;
    let statusCode: number;
    if (error.statusCode) {
      statusCode = error.statusCode;
    } else if (error.validation) {
      errorName = 'ValidationError';
      statusCode = 400;
    } else {
      statusCode = 500;
    }
    reply.code(statusCode).send({
      error: errorName,
      message: error.message,
      statusCode,
    });
  };
  server.setNotFoundHandler((request, reply) => {
    const message = `Resource not found: ${request.req.url}, method: ${request.req.method}`;
    const error = new errors.NotFound(message);
    errorHandler(error, request, reply);
  });
  server.setErrorHandler(errorHandler);

  // setup plugins
  if (options.swagger) {
    enableSwagger(server);
  }
  server.register(routes.healthRoute);
  await server.ready();

  // start server
  const rouetList = server.printRoutes();
  context.logger.info(`Server routes:\n${rouetList}`);
  await server.listen(config.port, config.address);

  context.cleaner.push(async () => {
    context.logger.info(`Server shutdown...`);
    try {
      await server.close();
    } catch (err) {
      context.logger.error(err);
    }
  });
};

bootstrap(
  main,
  providers.EnvProvider,
  providers.CleanerProvider,
  providers.ConfigProvider,
  providers.LoggerProvider,
  providers.RedisProvider,
  providers.SequelizeProvider
);
