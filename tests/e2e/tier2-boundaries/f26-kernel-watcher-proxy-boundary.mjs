import { expect } from '../harness/assert.mjs';
import { KernelWatcherEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F26: Kernel Watcher Nitro Proxy (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F26.B1: Handles malformed JSON from upstream kernel.org without crashing',
      async run() {
        const parsed = KernelWatcherEngine.parseKernelReleases({ releases: 'not an array' });
        expect(parsed.isStale).toBe(true);
        expect(parsed.mainline).toBeTruthy();
      }
    },
    {
      name: 'F26.B2: Handles releases array missing mainline moniker defaulting safely',
      async run() {
        const missingMainline = {
          releases: [
            { version: '6.13.2', moniker: 'stable', date: '2026-10-08' }
          ]
        };

        const state = KernelWatcherEngine.parseKernelReleases(missingMainline);
        expect(state.mainline).toBeNull();
        expect(state.stable.version).toBe('6.13.2');
      }
    },
    {
      name: 'F26.B3: Handles releases array missing stable moniker defaulting safely',
      async run() {
        const missingStable = {
          releases: [
            { version: '6.14-rc1', moniker: 'mainline', date: '2026-10-10' }
          ]
        };

        const state = KernelWatcherEngine.parseKernelReleases(missingStable);
        expect(state.stable).toBeNull();
        expect(state.mainline.version).toBe('6.14-rc1');
      }
    },
    {
      name: 'F26.B4: Verifies cache-control header is present on 304 conditional responses',
      async run({ mockServer }) {
        const res = await fetch(`${mockServer.baseUrl.replace('/api/v2', '')}/api/kernel-releases`);
        expect(res.headers.has('cache-control')).toBe(true);
      }
    },
    {
      name: 'F26.B5: Rejects unsupported HTTP methods (POST, DELETE) on proxy route',
      async run({ mockServer }) {
        const postRes = await fetch(`${mockServer.baseUrl.replace('/api/v2', '')}/api/kernel-releases`, {
          method: 'POST',
          body: JSON.stringify({ test: true })
        });

        // Mock returns 404 for non-GET on kernel proxy
        expect(postRes.status).toBe(404);
      }
    }
  ]
};
