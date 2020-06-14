import { Dialect } from 'sequelize';

export interface LoggerProviderConfig {
  enabled: boolean;
  pretty: boolean;
  file: string | null;
}

export interface AxiosProviderConfig {
  timeout: number;
}

export interface RedisProviderConfig {
  host: string;
  port: number;
  keyPrefix: string;
}

export interface SequelizeProviderConfig {
  dialect: Dialect;
  host: string;
  username: string;
  password?: string;
  database: string;
  logging: boolean;
}

export interface HttpApplicationConfig {
  address: string;
  port: number;
}

export interface Config {
  providers: {
    logger: LoggerProviderConfig;
    axios: AxiosProviderConfig;
    redis: RedisProviderConfig;
    sequelize: SequelizeProviderConfig;
  };
  applications: {
    http: HttpApplicationConfig;
  };
}
