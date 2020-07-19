import test from 'ava';
import { bootstrap, context, Application } from '../../src/core';
import { mockConsole, mockProcessExit } from '../utils';

test.afterEach(async () => {
  try {
    await context.finalize();
  } catch {}
});

test('bootstrap should return an instance of application', async (t) => {
  mockConsole(t);
  mockProcessExit(t, 0);
  class TestApplication extends Application {}
  const application = await bootstrap(TestApplication);
  t.assert(application instanceof TestApplication);
});

test('bootstrap should trigger application start', async (t) => {
  t.plan(1);
  t.teardown(async () => {});
  class TestApplication extends Application {
    async start() {
      t.pass('on start');
    }
  }
  await bootstrap(TestApplication);
});

test('bootstrap should parse application options', async (t) => {
  t.plan(3);

  const actual = {
    string: 'string',
    boolean: true,
    number: 123,
  };

  class TestApplication extends Application {
    static get options() {
      return {
        string: ['string'],
        boolean: ['boolean'],
        number: ['number'],
      };
    }
    async start(options: { string: string; boolean: boolean; number: number }) {
      t.deepEqual(options.string, actual.string);
      t.deepEqual(options.boolean, actual.boolean);
      t.deepEqual(options.number, actual.number);
    }
  }

  const processArgv = process.argv;
  t.teardown(() => {
    process.argv = processArgv;
  });
  const [node, script] = process.argv;
  process.argv = [
    node,
    script,
    `--string=${actual.string}`,
    `--boolean=${actual.boolean}`,
    `--number=${actual.number}`,
  ];

  await bootstrap(TestApplication);
});
