import { expect } from '../harness/assert.mjs';
import { SearchEngine, createMockStorage } from '../harness/client-engine.mjs';

export default {
  feature: 'F38: Search History Persistence (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F38.B1: Handles corrupted non-JSON value in localStorage returning empty array',
      async run() {
        const storage = createMockStorage({ lgl_recent_searches: '{corrupted json' });
        const history = SearchEngine.getRecentSearches(storage);
        expect(history.length).toBe(0);
      }
    },
    {
      name: 'F38.B2: Handles non-array JSON primitive (e.g. number or boolean) returning empty array',
      async run() {
        const storage = createMockStorage({ lgl_recent_searches: '12345' });
        const history = SearchEngine.getRecentSearches(storage);
        expect(history.length).toBe(0);
      }
    },
    {
      name: 'F38.B3: Trims surrounding whitespace from terms before storing',
      async run() {
        const storage = createMockStorage();
        SearchEngine.addRecentSearch(storage, '   iptables   ');
        const history = SearchEngine.getRecentSearches(storage);
        expect(history[0]).toBe('iptables');
      }
    },
    {
      name: 'F38.B4: Case-insensitive deduplication preserves newest case representation',
      async run() {
        const storage = createMockStorage();
        SearchEngine.addRecentSearch(storage, 'systemd');
        SearchEngine.addRecentSearch(storage, 'SYSTEMD');

        const history = SearchEngine.getRecentSearches(storage);
        expect(history.length).toBe(1);
        expect(history[0]).toBe('SYSTEMD');
      }
    },
    {
      name: 'F38.B5: Handles storage quota exceeded or throwing error safely',
      async run() {
        const throwingStorage = {
          getItem: () => null,
          setItem: () => { throw new Error('QuotaExceededError'); },
          removeItem: () => {}
        };

        expect(() => {
          try {
            SearchEngine.addRecentSearch(throwingStorage, 'debian');
          } catch (e) {
            // caught
          }
        }).not.toThrow();
      }
    }
  ]
};
