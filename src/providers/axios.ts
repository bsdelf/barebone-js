import { dependencies } from 'dag-maker';
import { forward } from 'forwardit';
import Axios, { AxiosInstance } from 'axios';
import { ConfigProvider } from './config';
import { Logger } from '../libraries';
import { LoggerProvider } from './logger';

declare module './utils' {
  interface Forwards extends Pick<AxiosProvider, 'axios'> {}
}

@dependencies({
  configProvider: ConfigProvider,
  loggerProvider: LoggerProvider,
})
export class AxiosProvider {
  @forward
  readonly axios: AxiosInstance;

  readonly logger: Logger;

  constructor(logger: Logger, axios: AxiosInstance) {
    this.logger = logger;
    this.axios = axios;
  }

  static async create(options: { configProvider: ConfigProvider; loggerProvider: LoggerProvider }) {
    const config = options.configProvider.config.providers.axios;
    const logger = options.loggerProvider.logger;
    logger.info('Create AxiosProvider');
    const axios = Axios.create({
      timeout: config.timeout,
    });
    return new AxiosProvider(logger, axios);
  }

  static async destroy(axiosProvider: AxiosProvider) {
    axiosProvider.logger.info('Destroy AxiosProvider');
  }
}
