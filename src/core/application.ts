import { context } from './context';

export abstract class Application {
  protected isExitLocked = false;

  /**
   * Application on start callback.
   */
  start?(options?: any): Promise<void>;

  /**
   * Application on stop callback.
   */
  stop?(): Promise<void>;

  /**
   * Exit application.
   * Trigger on stop callback and context finalizer.
   * This method never return, subsequent codes are unreachable.
   * @param statusCode Exit status code.
   */
  async exit(statusCode = 0) {
    // lockup
    if (this.isExitLocked) {
      return;
    }
    this.isExitLocked = true;

    // stop application
    if (this.stop) {
      try {
        await this.stop();
      } catch (err) {
        console.error(err);
        statusCode = 1;
      }
    }

    // finalize context
    try {
      await context.finalize();
    } catch (err) {
      console.error(err);
      statusCode = 1;
    }

    process.exit(statusCode);
  }
}

export interface ApplicationConstructor {
  new (): Application;
  options?: any;
}
