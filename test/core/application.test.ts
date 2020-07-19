import test from 'ava';
import { bootstrap, context, Application } from '../../src/core';
import { mockConsole, mockProcessExit } from '../utils';

test.afterEach(async () => {
  try {
    await context.finalize();
  } catch {}
});

test('Application exit should set status code to 0', async (t) => {
  t.plan(1);
  mockProcessExit(t, 0);
  class TestApplication extends Application {}
  const testApplication = new TestApplication();
  await testApplication.exit();
});

test('Application exit should set status code to 1', async (t) => {
  t.plan(1);
  mockProcessExit(t, 1);
  class TestApplication extends Application {}
  const testApplication = new TestApplication();
  await testApplication.exit(1);
});

test('Application exit should call stop method only once', async (t) => {
  t.plan(2);
  mockProcessExit(t, 0);
  class TestApplication extends Application {
    async stop() {
      t.pass();
    }
  }
  const testApplication = new TestApplication();
  await testApplication.exit();
  await testApplication.exit();
});

test('Application exit should swallow exceptions in stop method', async (t) => {
  t.plan(1);
  mockConsole(t);
  mockProcessExit(t, 1);
  class TestApplication extends Application {
    async stop() {
      throw new Error('oops');
    }
  }
  const testApplication = new TestApplication();
  await testApplication.exit();
});

test('Application exit should swallow exceptions in context finalizer', async (t) => {
  t.plan(1);
  mockConsole(t);
  mockProcessExit(t, 1);
  class TestApplication extends Application {}
  class TestProvider {
    static async create() {
      return {};
    }
    static async destroy() {
      throw new Error('oops');
    }
  }
  const testApplication = await bootstrap(TestApplication, TestProvider);
  await testApplication.exit();
});
