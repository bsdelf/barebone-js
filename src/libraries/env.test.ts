import it from 'ava';
import { parseEnv, AppEnv } from './env';

it('parseEnv should parse APP_ENV', async (t) => {
  const cases = [AppEnv.Production, AppEnv.Development, AppEnv.Staging, AppEnv.Test, AppEnv.CI];
  for (const expected of cases) {
    const output = parseEnv({ APP_ENV: expected });
    t.deepEqual(output.appEnv, expected);
  }
});

it('parseEnv should throw for invalid APP_ENV', async (t) => {
  const cases = ['a', 'b', 'c', '', 'null', 'undefined'];
  for (const item of cases) {
    t.throws(
      () => {
        parseEnv({ APP_ENV: item });
      },
      undefined,
      `should throw for "${item}"`
    );
  }
});
