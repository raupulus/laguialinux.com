import { expect } from '../harness/assert.mjs';
import { KernelWatcherEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F27: Kernel Watcher Widget & LocalStorage Cache (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F27.B1: Recovers from corrupted non-JSON string in localStorage by returning invalid cache',
      async run() {
        const corrupted = 'not a json {{{';
        const now = Date.now();
        const cache = KernelWatcherEngine.evaluateCache(corrupted, String(now - 1000), now);

        expect(cache.isValid).toBe(false);
        expect(cache.data).toBeNull();
      }
    },
    {
      name: 'F27.B2: Handles non-numeric timestamp in localStorage by invalidating cache',
      async run() {
        const validJson = JSON.stringify({ stable: { version: '6.13.2' } });
        const cache = KernelWatcherEngine.evaluateCache(validJson, 'invalid_timestamp');

        expect(cache.isValid).toBe(false);
      }
    },
    {
      name: 'F27.B3: Handles exactly 24h boundary (now - ts === ttlMs) by invalidating cache',
      async run() {
        const now = Date.now();
        const exactly24hAgo = now - 86400000;
        const validJson = JSON.stringify({ stable: { version: '6.13.2' } });

        const cache = KernelWatcherEngine.evaluateCache(validJson, String(exactly24hAgo), now, 86400000);
        expect(cache.isValid).toBe(false);
      }
    },
    {
      name: 'F27.B4: Handles releases array where all LTS branches are iseol: true (returns empty LTS list)',
      async run() {
        const allEol = {
          releases: [
            { version: '6.14-rc1', moniker: 'mainline' },
            { version: '6.13.2', moniker: 'stable' },
            { version: '5.10.220', moniker: 'longterm', iseol: true },
            { version: '5.4.280', moniker: 'longterm', iseol: true }
          ]
        };

        const state = KernelWatcherEngine.parseKernelReleases(allEol);
        expect(state.lts.length).toBe(0);
      }
    },
    {
      name: 'F27.B5: Preserves isStale: false on fresh network fetch',
      async run({ client }) {
        const data = await client.request('/kernel-releases');
        const state = KernelWatcherEngine.parseKernelReleases(data);

        expect(state.isStale).toBe(false);
      }
    }
  ]
};
