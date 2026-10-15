import { expect } from '../harness/assert.mjs';
import { SearchEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F33: Reactive Search Debounce (300ms) (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F33.B1: Handles 0ms delay as immediate asynchronous dispatch',
      async run() {
        let done = false;
        const debounced = SearchEngine.debounce(() => { done = true; }, 0);
        debounced();
        await new Promise(r => setTimeout(r, 20));
        expect(done).toBe(true);
      }
    },
    {
      name: 'F33.B2: Calling cancel on idle debouncer is a safe no-op',
      async run() {
        const debounced = SearchEngine.debounce(() => {}, 50);
        expect(() => debounced.cancel()).not.toThrow();
      }
    },
    {
      name: 'F33.B3: Calling flush on idle debouncer is a safe no-op without error',
      async run() {
        const debounced = SearchEngine.debounce(() => {}, 50);
        expect(() => debounced.flush()).not.toThrow();
      }
    },
    {
      name: 'F33.B4: Preserves "this" context if bound to custom search state object',
      async run() {
        const state = {
          tenant: 'laguialinux',
          result: null
        };
        const fn = function(term) {
          this.result = `${this.tenant}:${term}`;
        };
        const debounced = SearchEngine.debounce(fn.bind(state), 30);
        debounced('apt');
        await new Promise(r => setTimeout(r, 50));
        expect(state.result).toBe('laguialinux:apt');
      }
    },
    {
      name: 'F33.B5: Handles multiple distinct arguments passed to debounced function',
      async run() {
        let capturedArgs = [];
        const debounced = SearchEngine.debounce((...args) => {
          capturedArgs = args;
        }, 30);

        debounced('term', 'category', 1, { filter: true });
        await new Promise(r => setTimeout(r, 50));

        expect(capturedArgs.length).toBe(4);
        expect(capturedArgs[0]).toBe('term');
        expect(capturedArgs[1]).toBe('category');
        expect(capturedArgs[3].filter).toBe(true);
      }
    }
  ]
};
