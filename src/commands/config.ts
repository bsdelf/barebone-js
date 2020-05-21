import { Command } from './command';
import { context } from '../context';

export class ConfigDumpCommand implements Command {
  get name() {
    return 'config:dump';
  }

  get options() {
    return {};
  }

  async run() {
    const text = JSON.stringify(context.config, undefined, 2);
    context.logger.info(`The merged config is:\n${text}`);
    // const response = await context.axios.get('https://bing.com');
    // context.logger.info(response.data);
    // const results = await context.transactional(async (transaction) => {
    //   return await context.sequelize.query('select * from data limit 10', { transaction });
    // });
    // context.logger.info({ results });
  }
}
