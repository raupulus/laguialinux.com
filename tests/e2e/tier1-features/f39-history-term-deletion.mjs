import { expect } from '../harness/assert.mjs';
import { SearchEngine, createMockStorage } from '../harness/client-engine.mjs';

export default {
  feature: 'F39: History Term Deletion (Individual & Full Clear)',
  tier: 1,
  tests: [
    {
      name: 'F39.1: Removes specific term from recent searches list',
      async run() {
        const storage = createMockStorage();
        SearchEngine.addRecentSearch(storage, 'arch');
        SearchEngine.addRecentSearch(storage, 'debian');
        SearchEngine.addRecentSearch(storage, 'fedora');

        const updated = SearchEngine.removeRecentSearch(storage, 'debian');
        expect(updated.length).toBe(2);
        expect(updated.includes('debian')).toBe(false);
        expect(updated[0]).toBe('fedora');
        expect(updated[1]).toBe('arch');
      }
    },
    {
      name: 'F39.2: Removing term persists updated array to localStorage',
      async run() {
        const storage = createMockStorage();
        SearchEngine.addRecentSearch(storage, 'swap');
        SearchEngine.addRecentSearch(storage, 'cron');

        SearchEngine.removeRecentSearch(storage, 'swap');
        const persisted = JSON.parse(storage.getItem('lgl_recent_searches'));
        expect(persisted.length).toBe(1);
        expect(persisted[0]).toBe('cron');
      }
    },
    {
      name: 'F39.3: Clear all recent searches empties entire history list',
      async run() {
        const storage = createMockStorage();
        SearchEngine.addRecentSearch(storage, 'tar');
        SearchEngine.addRecentSearch(storage, 'gzip');

        const cleared = SearchEngine.clearRecentSearches(storage);
        expect(cleared.length).toBe(0);
        expect(storage.getItem('lgl_recent_searches')).toBeNull();
      }
    },
    {
      name: 'F39.4: Deleting last remaining item results in clean empty list',
      async run() {
        const storage = createMockStorage();
        SearchEngine.addRecentSearch(storage, 'only-term');

        const result = SearchEngine.removeRecentSearch(storage, 'only-term');
        expect(result.length).toBe(0);
      }
    },
    {
      name: 'F39.5: Deleting non-existent term leaves history intact without error',
      async run() {
        const storage = createMockStorage();
        SearchEngine.addRecentSearch(storage, 'existing');

        const result = SearchEngine.removeRecentSearch(storage, 'non-existent');
        expect(result.length).toBe(1);
        expect(result[0]).toBe('existing');
      }
    }
  ]
};
