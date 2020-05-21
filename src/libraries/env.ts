interface Parser {
  readonly index: string;
  parse(data: NodeJS.ProcessEnv): any;
}

export interface Env {
  appEnv: AppEnv;
}

export enum AppEnv {
  Production = 'production',
  Development = 'development',
  Staging = 'staging',
  Test = 'test',
  CI = 'ci',
}

class AppEnvParser {
  static index = 'appEnv';

  static parse(data: NodeJS.ProcessEnv) {
    const key = 'APP_ENV';
    const value = data[key];
    if (!value) {
      throw new Error(`Environment variable ${key} is required`);
    }
    const validValues = Object.values<string>(AppEnv);
    if (!validValues.includes(value)) {
      throw new Error(`Environment variable ${key} must be one of ${validValues}`);
    }
    return value;
  }
}

export const parseEnv = (data: NodeJS.ProcessEnv): Env => {
  const parsers: Parser[] = [AppEnvParser];
  const result: any = {};
  for (const parser of parsers) {
    const output = parser.parse(data);
    Object.assign(result, {
      [parser.index]: output,
    });
  }
  return result;
};
