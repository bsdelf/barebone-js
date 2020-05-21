import sourceMapSupport from 'source-map-support';
import { VertexFactory } from 'dag-maker';
import { context } from './context';

let isShuttingDown = false;

/**
 * Shutdown application.
 */
export const shutdown = async () => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;
  let exitCode = 0;
  try {
    await context.finalize();
  } catch (err) {
    console.error(err);
    exitCode = 1;
  }
  process.exit(exitCode);
};

const installTraps = () => {
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGUSR2'];
  const signalHandler = (name: NodeJS.Signals) => {
    context.logger.warn(`Got signal %s`, name);
    shutdown();
  };
  for (const signal of signals) {
    process.on(signal, signalHandler);
  }
  process.on('unhandledRejection', (reason, promise) => {
    console.error(reason, promise);
  });
};

const installSourceMap = () => {
  sourceMapSupport.install({
    environment: 'node',
    hookRequire: true,
  });
};

/**
 * Bootstrap application.
 * @param main Entrance function. It will be called when application context is ready.
 * @param providerFactories Provider factories for making up application context.
 */
export const bootstrap = async (
  main: () => Promise<void>,
  ...providerFactories: VertexFactory<any>[]
) => {
  try {
    installSourceMap();
    installTraps();
    await context.initialize({ providerFactories: providerFactories });
    await main();
  } catch (err) {
    console.error(err);
  }
};
