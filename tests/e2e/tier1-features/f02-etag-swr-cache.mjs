import { expect } from '../harness/assert.mjs';

export default {
  feature: 'F2: ETag & HTTP 304 SWR Cache',
  tier: 1,
  tests: [
    {
      name: 'F2.1: Stores ETag and payload on initial 200 GET request',
      async run({ client }) {
        const response = await client.request('/platforms/laguialinux/categories');
        expect(response.success).toBe(true, 'First request must succeed');

        const cacheKey = client.buildCacheKey('GET', `${client.baseUrl}/platforms/laguialinux/categories`, {});
        const cached = client.cacheStore.get(cacheKey);

        expect(cached).toBeTruthy('Cache entry must exist in cacheStore');
        expect(cached.etag).toBeTruthy('Cached entry must contain non-empty etag');
        expect(cached.data.success).toBe(true, 'Cached entry must store unpacked response data');
      }
    },
    {
      name: 'F2.2: Sends If-None-Match header matching cached ETag on second request',
      async run({ client, mockServer }) {
        // First request to populate cache
        await client.request('/platforms/laguialinux/categories');

        const cacheKey = client.buildCacheKey('GET', `${client.baseUrl}/platforms/laguialinux/categories`, {});
        const storedEtag = client.cacheStore.get(cacheKey).etag;

        mockServer.requestHistory = [];

        // Second request
        await client.request('/platforms/laguialinux/categories');

        const lastReq = mockServer.requestHistory[mockServer.requestHistory.length - 1];
        expect(lastReq.headers['if-none-match']).toBe(storedEtag, 'If-None-Match header must match stored ETag');
      }
    },
    {
      name: 'F2.3: Intercepts HTTP 304 Not Modified and transparently returns cached data without error',
      async run({ client, mockServer }) {
        // Ensure cache is populated
        const firstRes = await client.request('/platforms/laguialinux/categories');

        // Verify next request succeeds even though server returns 304
        const secondRes = await client.request('/platforms/laguialinux/categories');

        expect(secondRes).toBeTruthy('Second request must not be null/undefined');
        expect(secondRes.success).toBe(true, 'Must return success: true from cache');
        expect(secondRes.data.length).toBe(firstRes.data.length, 'Cached data length must match original');
        expect(secondRes.data[0].slug).toBe(firstRes.data[0].slug, 'Cached item slug must match original');
      }
    },
    {
      name: 'F2.4: Generates deterministic cache keys invariant to query parameter order',
      async run({ client }) {
        const url = `${client.baseUrl}/platforms/laguialinux/contents`;
        const key1 = client.buildCacheKey('GET', url, { page: 1, sort: 'recientes', per_page: 15 });
        const key2 = client.buildCacheKey('GET', url, { per_page: 15, page: 1, sort: 'recientes' });

        expect(key1).toBe(key2, 'Cache keys with different query param order must be identical');
      }
    },
    {
      name: 'F2.5: skipCache option ignores cached ETag and bypasses conditional header',
      async run({ client, mockServer }) {
        // Populate cache
        await client.request('/platforms/laguialinux/categories');

        mockServer.requestHistory = [];

        // Request with skipCache: true
        await client.request('/platforms/laguialinux/categories', { skipCache: true });

        const lastReq = mockServer.requestHistory[mockServer.requestHistory.length - 1];
        expect(lastReq.headers['if-none-match']).toBeUndefined('If-None-Match header must NOT be sent when skipCache is true');
      }
    }
  ]
};
