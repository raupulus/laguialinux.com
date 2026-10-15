import { expect } from '../harness/assert.mjs';
import { SearchEngine, createMockStorage } from '../harness/client-engine.mjs';

export default {
  feature: 'F39: History Term Deletion (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F39.B1: Deleting with null or empty term returns unchanged list',
      async run() {
        const storage = createMockStorage({ lgl_recent_searches: JSON.stringify(['term1', 'term2']) });
        const res1 = SearchEngine.removeRecentSearch(storage, null);
        expect(res1.length).toBe(2);

        const res2 = SearchEngine.removeRecentSearch(storage, '');
        expect(res2.length).toBe(2);
      }
    },
    {
      name: 'F39.B2: Case-insensitive deletion removes term regardless of casing',
      async run() {
        const storage = createMockStorage();
        SearchEngine.addRecentSearch(storage, 'Chmod');

        const updated = SearchEngine.removeRecentSearch(storage, 'chmod');
        expect(updated.length).toBe(0);
      }
    },
    {
      name: 'F39.B3: Deleting from already empty history returns empty array safely',
      async run() {
        const storage = createMockStorage();
        const res = SearchEngine.removeRecentSearch(storage, 'anything');
        expect(res.length).toBe(0);
      }
    },
    {
      name: 'F39.B4: Clearing already empty history is safe idempotent operation',
      async run() {
        const storage = createMockStorage();
        const res = SearchEngine.clearRecentSearches(storage);
        expect(res.length).toBe(0);
      }
    },
    {
      name: 'F39.B5: Deleting term containing regex or special chars operates safely',
      async run() {
        const storage = createMockStorage();
        SearchEngine.addRecentSearch(storage, 'c++');
        SearchEngine.addRecentSearch(storage, 'grep -E');

        const updated = SearchEngine.removeRecentSearch(storage, 'c++');
        expect(updated.length).toBe(1);
        expect(updated[0]).toBe('grep -E');
      }
    }
  ]
};
