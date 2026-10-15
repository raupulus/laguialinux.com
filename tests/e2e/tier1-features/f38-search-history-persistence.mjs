import { expect } from '../harness/assert.mjs';
import { SearchEngine, createMockStorage } from '../harness/client-engine.mjs';

export default {
  feature: 'F38: Search History Persistence (localStorage lgl_recent_searches)',
  tier: 1,
  tests: [
    {
      name: 'F38.1: Adds search terms to localStorage key lgl_recent_searches',
      async run() {
        const storage = createMockStorage();
        SearchEngine.addRecentSearch(storage, 'fdisk');

        const history = SearchEngine.getRecentSearches(storage);
        expect(history.length).toBe(1);
        expect(history[0]).toBe('fdisk');
      }
    },
    {
      name: 'F38.2: Places newly searched terms at the front of the list (MRU order)',
      async run() {
        const storage = createMockStorage();
        SearchEngine.addRecentSearch(storage, 'fdisk');
        SearchEngine.addRecentSearch(storage, 'mkfs');

        const history = SearchEngine.getRecentSearches(storage);
        expect(history[0]).toBe('mkfs');
        expect(history[1]).toBe('fdisk');
      }
    },
    {
      name: 'F38.3: Deduplicates existing terms moving them to the top without duplicates',
      async run() {
        const storage = createMockStorage();
        SearchEngine.addRecentSearch(storage, 'debian');
        SearchEngine.addRecentSearch(storage, 'ubuntu');
        SearchEngine.addRecentSearch(storage, 'debian');

        const history = SearchEngine.getRecentSearches(storage);
        expect(history.length).toBe(2);
        expect(history[0]).toBe('debian');
        expect(history[1]).toBe('ubuntu');
      }
    },
    {
      name: 'F38.4: Enforces strict maximum capacity of 8 terms (FIFO eviction of oldest)',
      async run() {
        const storage = createMockStorage();
        for (let i = 1; i <= 10; i++) {
          SearchEngine.addRecentSearch(storage, `term-${i}`);
        }

        const history = SearchEngine.getRecentSearches(storage);
        expect(history.length).toBe(8);
        expect(history[0]).toBe('term-10');
        expect(history[7]).toBe('term-3');
        expect(history.includes('term-1')).toBe(false);
      }
    },
    {
      name: 'F38.5: Terms under 2 characters or blank are ignored from history',
      async run() {
        const storage = createMockStorage();
        SearchEngine.addRecentSearch(storage, 'a');
        SearchEngine.addRecentSearch(storage, '');
        SearchEngine.addRecentSearch(storage, '   ');

        const history = SearchEngine.getRecentSearches(storage);
        expect(history.length).toBe(0);
      }
    }
  ]
};
