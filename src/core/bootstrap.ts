import sourceMapSupport from 'source-map-support';
import yargsParser from 'yargs-parser';
import { VertexFactory } from 'dag-maker';
import { context } from './context';
import { ApplicationConstructor, Application } from './application';

const installSourceMap = () => {
  sourceMapSupport.install({
    environment: 'node',
    hookRequire: true,
  });
};

const installTraps = (application: Application) => {
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGUSR2'];
  const signalHandler = async (name: NodeJS.Signals) => {
    console.warn(`Got signal %s`, name);
    await application.exit();
  };
  for (const signal of signals) {
    process.on(signal, signalHandler);
  }
  process.on('unhandledRejection', (reason, promise) => {
    console.error(reason, promise);
  });
};

class ProcessArgv {
  static get applicationArgs() {
    return process.argv.slice(2);
  }
}

/**
 * Bootstrap an application.
 * @param constructor Application constructor.
 * @param providerFactories Provider factories for making up application context.
 */
export const bootstrap = async (
  constructor: ApplicationConstructor,
  ...providerFactories: VertexFactory<any>[]
) => {
  installSourceMap();

  // initialize context
  try {
    await context.initialize({ providerFactories });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

  // create application
  let application: Application;
  try {
    application = new constructor();
    installTraps(application);
  } catch (err) {
    console.error(err);
    try {
      await context.finalize();
    } catch (err) {
      console.error(err);
    }
    process.exit(1);
  }

  // start application
  if (application.start) {
    try {
      let options: any;
      if (constructor.options) {
        options = yargsParser(ProcessArgv.applicationArgs, constructor.options);
      }
      await application.start(options);
    } catch (err) {
      console.error(err);
      await application.exit(1);
    }
  }

  return application;
};
