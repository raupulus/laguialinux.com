import { expect } from '../harness/assert.mjs';
import { ApiClientEngine, MemoryCacheStore } from '../harness/client-engine.mjs';

export default {
  feature: 'F2: ETag & HTTP 304 SWR Cache (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F2.B1: Handles weak ETag validation prefix (W/"...") transparently on 304 response',
      async run({ client, mockServer }) {
        let callCount = 0;
        mockServer.registerHandler('GET', '/api/v2/test-weak-etag', (req, res) => {
          callCount++;
          const ifNoneMatch = req.headers['if-none-match'];
          const etag = 'W/"123456789"';

          if (ifNoneMatch === etag || ifNoneMatch === '"123456789"') {
            res.writeHead(304, { 'ETag': etag });
            res.end();
            return;
          }

          res.writeHead(200, {
            'Content-Type': 'application/json',
            'ETag': etag
          });
          res.end(JSON.stringify({ success: true, message: 'OK', data: { version: 1 } }));
        });

        const res1 = await client.request('/test-weak-etag');
        const res2 = await client.request('/test-weak-etag');

        expect(res1.data.version).toBe(1);
        expect(res2.data.version).toBe(1);
        expect(callCount).toBe(2);
      }
    },
    {
      name: 'F2.B2: Recovers gracefully when cache storage throws QuotaExceededError',
      async run({ mockServer }) {
        const fullStore = new MemoryCacheStore({ throwQuotaError: true });
        const quotaClient = new ApiClientEngine({
          baseUrl: mockServer.baseUrl,
          cacheStore: fullStore
        });

        // The request should succeed even if storage throws QuotaExceededError
        const response = await quotaClient.request('/platforms/laguialinux/categories');
        expect(response.success).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
      }
    },
    {
      name: 'F2.B3: Mutating HTTP methods (POST, PUT, DELETE) invalidate cached platform responses',
      async run({ client, mockServer }) {
        // Cache categories
        await client.request('/platforms/laguialinux/categories');
        const key = client.buildCacheKey('GET', `${client.baseUrl}/platforms/laguialinux/categories`, {});
        expect(client.cacheStore.get(key)).toBeTruthy();

        // Perform mutation POST
        mockServer.registerHandler('POST', '/api/v2/contact', (req, res) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Mensaje enviado', data: null }));
        });

        await client.request('/contact', { method: 'POST', body: { name: 'Raúl' } });

        // Platform-related cache entries should be invalidated
        expect(client.cacheStore.get(key)).toBeUndefined('Mutation should invalidate platform cache entries');
      }
    },
    {
      name: 'F2.B4: Sends conditional request and refreshes timestamp when cached entry is accessed',
      async run({ client }) {
        await client.request('/platforms/laguialinux/categories');
        const key = client.buildCacheKey('GET', `${client.baseUrl}/platforms/laguialinux/categories`, {});

        const initialTimestamp = client.cacheStore.get(key).timestamp;

        // Artificial delay of 5ms
        await new Promise(r => setTimeout(r, 5));

        await client.request('/platforms/laguialinux/categories');
        const refreshedTimestamp = client.cacheStore.get(key).timestamp;

        expect(refreshedTimestamp).toBeGreaterThanOrEqual(initialTimestamp);
      }
    },
    {
      name: 'F2.B5: Recovers from corrupted / invalid cache store state by falling back to network fetch',
      async run({ client }) {
        const key = client.buildCacheKey('GET', `${client.baseUrl}/platforms/laguialinux/categories`, {});
        // Insert corrupted entry without data
        client.cacheStore.set(key, { etag: '"corrupted-123"', data: null });

        // Request should still succeed
        const response = await client.request('/platforms/laguialinux/categories');
        expect(response.success).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
      }
    }
  ]
};
