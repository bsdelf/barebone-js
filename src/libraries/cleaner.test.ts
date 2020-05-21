import it from 'ava';
import pino from 'pino';
import { Cleaner } from './cleaner';

it('Cleaner should push and drain', async (t) => {
  const cleaner = new Cleaner(pino());
  const expectedOrder = [] as number[];
  const actualOrder = [] as number[];
  for (let i = 0; i < 3; ++i) {
    expectedOrder.unshift(i);
    cleaner.push(async () => {
      actualOrder.push(i);
    });
  }
  await cleaner.drain();
  t.deepEqual(actualOrder, expectedOrder);
});
