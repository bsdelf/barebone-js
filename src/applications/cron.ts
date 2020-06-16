import { Cron } from 'recron';
import * as providers from '../providers';
import { bootstrap, context, Application } from '../context';

class CronApplication extends Application {
  private cron?: Cron;

  async start() {
    const cron = new Cron();
    await cron.start();

    // use interval syntax
    cron.schedule('@every 1s', async () => {
      context.logger.info('every second');
    });

    // use crontab syntax
    cron.schedule('*/5 * * * * *', async () => {
      context.logger.info('at 5th second');
    });

    this.cron = cron;
  }

  async stop() {
    if (this.cron) {
      await this.cron.stop();
      this.cron = undefined;
    }
  }
}

bootstrap(CronApplication, providers.EnvProvider, providers.LoggerProvider);
