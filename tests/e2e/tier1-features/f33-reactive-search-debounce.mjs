import { expect } from '../harness/assert.mjs';
import { SearchEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F33: Reactive Search Debounce (300ms)',
  tier: 1,
  tests: [
    {
      name: 'F33.1: Debounces calls waiting at least 300ms before execution',
      async run() {
        let executedQuery = null;
        const debounced = SearchEngine.debounce((q) => {
          executedQuery = q;
        }, 50); // fast 50ms in test environment

        debounced('linux');
        expect(executedQuery).toBeNull('Should not execute synchronously');

        await new Promise(r => setTimeout(r, 80));
        expect(executedQuery).toBe('linux', 'Executes after wait window');
      }
    },
    {
      name: 'F33.2: Rapid successive keystrokes cancel previous timer and only execute last',
      async run() {
        let executionCount = 0;
        let finalQuery = '';
        const debounced = SearchEngine.debounce((q) => {
          executionCount++;
          finalQuery = q;
        }, 40);

        debounced('l');
        debounced('li');
        debounced('lin');
        debounced('linu');
        debounced('linux');

        await new Promise(r => setTimeout(r, 80));
        expect(executionCount).toBe(1);
        expect(finalQuery).toBe('linux');
      }
    },
    {
      name: 'F33.3: Manual cancellation aborts pending execution',
      async run() {
        let executed = false;
        const debounced = SearchEngine.debounce(() => { executed = true; }, 50);

        debounced('test');
        debounced.cancel();

        await new Promise(r => setTimeout(r, 80));
        expect(executed).toBe(false);
      }
    },
    {
      name: 'F33.4: Manual flush executes pending search immediately without delay',
      async run() {
        let flushedQuery = null;
        const debounced = SearchEngine.debounce((q) => { flushedQuery = q; }, 500);

        debounced('immediate-search');
        expect(flushedQuery).toBeNull();

        debounced.flush();
        expect(flushedQuery).toBe('immediate-search');
      }
    },
    {
      name: 'F33.5: Tracks total invocations made to debounced dispatcher',
      async run() {
        const debounced = SearchEngine.debounce(() => {}, 50);
        debounced('a');
        debounced('b');
        debounced('c');

        expect(debounced.getCallCount()).toBe(3);
        await new Promise(r => setTimeout(r, 70));
      }
    }
  ]
};
