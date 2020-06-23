import yargsParser from 'yargs-parser';
import * as commands from '../commands';
import * as providers from '../providers';
import { bootstrap, context, Application } from '../core';
import { CommandConstructor } from '../commands';

const buildHeader = (text: string, options: { width?: number; symbol?: string } = {}) => {
  const { width, symbol } = { width: 25, symbol: '-', ...options };
  if (text.length >= width) {
    return text;
  }
  const symbolWidth = width - text.length - 2;
  const leftWidth = Math.floor(symbolWidth / 2);
  const rightWidth = symbolWidth - leftWidth;
  const left = Array(leftWidth).fill(symbol).join('');
  const right = Array(rightWidth).fill(symbol).join('');
  return `${left} ${text} ${right}`;
};

class ProcessArgv {
  static get node() {
    return process.argv[0];
  }

  static get script() {
    return process.argv[1];
  }

  static get commandName() {
    return process.argv[2];
  }

  static get commandArgs() {
    return process.argv.slice(3);
  }
}

class CliApplication extends Application {
  async start() {
    // index commands
    const commandConstructors = new Map<string, CommandConstructor>(
      Object.values(commands).map((item) => [item.id, item])
    );

    // find & execute command
    let isCommandOk = true;
    const commandConstructor = commandConstructors.get(ProcessArgv.commandName);
    if (commandConstructor) {
      try {
        let options: any;
        if (commandConstructor.options) {
          options = yargsParser(ProcessArgv.commandArgs, commandConstructor.options);
        }
        const command = new commandConstructor();
        context.logger.info(buildHeader('BEGIN COMMAND'));
        await command.run(options);
        context.logger.info(buildHeader('END COMMAND'));
      } catch (err) {
        context.logger.error(err);
        isCommandOk = false;
      }
    } else {
      context.logger.info(
        'Available commands:\n%s',
        JSON.stringify(Array.from(commandConstructors.keys()), undefined, 2)
      );
    }

    await this.exit(isCommandOk);
  }
}

providers.LoggerProvider.pretty = true;

bootstrap(
  CliApplication,
  providers.EnvProvider,
  providers.ConfigProvider,
  providers.LoggerProvider,
  providers.AxiosProvider,
  providers.SequelizeProvider
);
