import { expect } from '../harness/assert.mjs';
import { KernelWatcherEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F27: Kernel Watcher Widget & LocalStorage Cache',
  tier: 1,
  tests: [
    {
      name: 'F27.1: Extracts up to 2 active Longterm (LTS) kernel releases',
      async run({ client }) {
        const data = await client.request('/kernel-releases');
        const state = KernelWatcherEngine.parseKernelReleases(data);

        expect(Array.isArray(state.lts)).toBe(true);
        expect(state.lts.length).toBeLessThanOrEqual(2);
        expect(state.lts[0].moniker).toBe('longterm');
      }
    },
    {
      name: 'F27.2: Filters out End-of-Life (iseol: true) kernel branches from active LTS display',
      async run({ client }) {
        const data = await client.request('/kernel-releases');
        const state = KernelWatcherEngine.parseKernelReleases(data);

        // Branch 5.15.178 has iseol: true in mock data and must be filtered out
        const hasEol = state.lts.some(k => k.iseol === true);
        expect(hasEol).toBe(false);
      }
    },
    {
      name: 'F27.3: Returns valid cached state when localStorage data is within 24h TTL',
      async run() {
        const now = Date.now();
        const storedTs = String(now - 3600000); // 1 hour ago
        const storedData = JSON.stringify({
          mainline: { version: '6.14-rc1' },
          stable: { version: '6.13.2' },
          lts: []
        });

        const cache = KernelWatcherEngine.evaluateCache(storedData, storedTs, now);
        expect(cache.isValid).toBe(true);
        expect(cache.data.stable.version).toBe('6.13.2');
      }
    },
    {
      name: 'F27.4: Invalidates expired cache entries (> 24h) triggering fresh fetch',
      async run() {
        const now = Date.now();
        const storedTs = String(now - 90000000); // 25 hours ago (> 24h TTL)
        const storedData = JSON.stringify({ stable: { version: '6.10.0' } });

        const cache = KernelWatcherEngine.evaluateCache(storedData, storedTs, now);
        expect(cache.isValid).toBe(false);
        expect(cache.data).toBeNull();
      }
    },
    {
      name: 'F27.5: Falls back to embedded static snapshot with isStale: true upon network failure',
      async run() {
        // When upstream returns invalid or empty object
        const fallback = KernelWatcherEngine.parseKernelReleases(null);

        expect(fallback.isStale).toBe(true);
        expect(fallback.mainline).toBeTruthy();
        expect(fallback.stable).toBeTruthy();
        expect(fallback.lts.length).toBeGreaterThan(0);
      }
    }
  ]
};
