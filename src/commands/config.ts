import { Command } from './command';
import { context } from '../core';

export class ConfigDumpCommand implements Command {
  static get id() {
    return 'config:dump';
  }

  async run() {
    const text = JSON.stringify(context.config, undefined, 2);
    context.logger.info(`The merged config object is:\n${text}`);
  }
}
