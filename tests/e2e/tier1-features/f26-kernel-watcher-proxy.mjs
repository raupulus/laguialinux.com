import { expect } from '../harness/assert.mjs';
import { KernelWatcherEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F26: Kernel Watcher Nitro Proxy (/api/kernel-releases)',
  tier: 1,
  tests: [
    {
      name: 'F26.1: Nitro proxy endpoint returns HTTP 200 with releases array',
      async run({ client }) {
        const response = await client.request('/kernel-releases');
        expect(response.releases).toBeTruthy();
        expect(Array.isArray(response.releases)).toBe(true);
        expect(response.releases.length).toBeGreaterThanOrEqual(3);
      }
    },
    {
      name: 'F26.2: Serves 24-hour cache-control header (max-age=86400, stale-while-revalidate=86400)',
      async run({ mockServer }) {
        const res = await fetch(`${mockServer.baseUrl.replace('/api/v2', '')}/api/kernel-releases`);
        expect(res.status).toBe(200);

        const cacheControl = res.headers.get('cache-control');
        expect(cacheControl).toBeTruthy();
        expect(cacheControl).toContain('max-age=86400');
        expect(cacheControl).toContain('stale-while-revalidate=86400');
      }
    },
    {
      name: 'F26.3: Solves cross-origin blocking by serving from internal same-origin Nitro proxy',
      async run({ mockServer }) {
        // Internal proxy eliminates upstream kernel.org lack of Access-Control-Allow-Origin
        const res = await fetch(`${mockServer.baseUrl.replace('/api/v2', '')}/api/kernel-releases`);
        expect(res.ok).toBe(true);
        const data = await res.json();
        expect(data.releases.length).toBeGreaterThan(0);
      }
    },
    {
      name: 'F26.4: Parses mainline release version and moniker correctly',
      async run({ client }) {
        const data = await client.request('/kernel-releases');
        const state = KernelWatcherEngine.parseKernelReleases(data);

        expect(state.mainline).toBeTruthy();
        expect(state.mainline.moniker).toBe('mainline');
        expect(state.mainline.version).toBe('6.14-rc1');
      }
    },
    {
      name: 'F26.5: Parses current stable production release version and tarball link',
      async run({ client }) {
        const data = await client.request('/kernel-releases');
        const state = KernelWatcherEngine.parseKernelReleases(data);

        expect(state.stable).toBeTruthy();
        expect(state.stable.moniker).toBe('stable');
        expect(state.stable.version).toBe('6.13.2');
        expect(state.stable.giturl).toContain('kernel.org');
      }
    }
  ]
};
