import { Options } from 'yargs-parser';

export interface Command {
  run(options?: unknown): Promise<void>;
}

export interface CommandConstructor {
  /**
   * Command ID, i.e. name.
   */
  readonly id: string;

  /**
   * Command options. Usage: https://www.npmjs.com/package/yargs-parser#api.
   */
  readonly options?: Options;

  new (): Command;
}
