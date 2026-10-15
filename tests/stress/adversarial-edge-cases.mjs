/**
 * Advanced Adversarial Edge Cases & Failure Mode Stress Test for `composables/useApiClient.ts`
 */

import { pathToFileURL } from 'node:url';

globalThis.__IS_CLIENT__ = true;
let mockPlatformSlug = 'laguialinux';
let mockApiBaseUrl = 'http://localhost:8000/api/v2';

globalThis.computed = fn => ({ get value() { return fn(); } });
globalThis.__state = {};
globalThis.useState = (key, init) => {
  if (!globalThis.__state[key]) {
    globalThis.__state[key] = { value: init ? init() : {} };
  }
  return globalThis.__state[key];
};
globalThis.usePlatform = () => ({
  platform: {
    get value() {
      return {
        slug: mockPlatformSlug,
        apiBaseUrl: mockApiBaseUrl
      };
    }
  }
});

class AdvancedMockStorage {
  constructor() {
    this.map = new Map();
  }
  get length() { return this.map.size; }
  key(i) { return Array.from(this.map.keys())[i] || null; }
  getItem(k) { return this.map.get(k) || null; }
  setItem(k, v) { this.map.set(k, String(v)); }
  removeItem(k) { this.map.delete(k); }
  clear() { this.map.clear(); }
}

globalThis.sessionStorage = new AdvancedMockStorage();
globalThis.$fetch = { raw: async () => ({ status: 200, headers: new Headers(), _data: {} }) };

const mod = await import('../../composables/useApiClient.ts');
const { useApiClient, parseRetryAfter, normalizeError, buildCacheKey, ApiError } = mod;

const results = [];
async function runTest(name, fn) {
  try {
    await fn();
    results.push({ name, pass: true });
    console.log(`  ✔ PASS: ${name}`);
  } catch (err) {
    results.push({ name, pass: false, error: err.message });
    console.log(`  ✖ FAIL: ${name} -> ${err.message}`);
  }
}

console.log('\n--- ADVANCED ADVERSARIAL STRESS SUITE ---');

await runTest('A.1 Burst concurrency: 200 concurrent requests without OOM or crash', async () => {
  globalThis.__state = {};
  globalThis.sessionStorage.clear();
  let serverHits = 0;
  globalThis.$fetch.raw = async () => {
    serverHits++;
    return {
      status: 200,
      headers: new Headers({ etag: '"burst-tag"' }),
      _data: { success: true, message: 'OK', data: { burst: true } }
    };
  };

  const client = useApiClient();
  const promises = Array.from({ length: 200 }, () => client.getContents({ page: 1 }));
  const res = await Promise.all(promises);
  if (res.length !== 200 || !res.every(r => r.success)) throw new Error('Burst failed');
});

await runTest('A.2 Multi-tenant dynamic switching updates endpoints immediately', async () => {
  globalThis.__state = {};
  globalThis.sessionStorage.clear();

  let requestedUrls = [];
  globalThis.$fetch.raw = async (url) => {
    requestedUrls.push(url);
    return { status: 200, headers: new Headers(), _data: { success: true, message: 'OK', data: {} } };
  };

  const client = useApiClient();

  mockPlatformSlug = 'laguialinux';
  await client.getCategories();

  mockPlatformSlug = 'news';
  await client.getCategories();

  if (!requestedUrls[0].includes('/platforms/laguialinux/categories')) {
    throw new Error(`Expected laguialinux in first URL, got: ${requestedUrls[0]}`);
  }
  if (!requestedUrls[1].includes('/platforms/news/categories')) {
    throw new Error(`Expected news in second URL, got: ${requestedUrls[1]}`);
  }
});

await runTest('A.3 Complex query parameters: bracket notation (filter[cat]=linux)', async () => {
  const k1 = buildCacheKey('GET', 'http://api.com', { 'filter[cat]': 'linux', 'filter[tag]': 'bash' });
  const k2 = buildCacheKey('GET', 'http://api.com', { 'filter[tag]': 'bash', 'filter[cat]': 'linux' });
  if (k1 !== k2) throw new Error('Bracket params sort mismatch');
  if (!k1.includes('filter%5Bcat%5D=linux')) throw new Error('Bracket params encoding mismatch');
});

await runTest('A.4 Massive response payload handling (2MB JSON)', async () => {
  globalThis.__state = {};
  globalThis.sessionStorage.clear();

  const largeArray = Array.from({ length: 5000 }, (_, i) => ({ id: i, text: `Item payload ${i}` }));
  globalThis.$fetch.raw = async () => ({
    status: 200,
    headers: new Headers({ etag: '"large-tag"' }),
    _data: { success: true, message: 'OK', data: largeArray }
  });

  const client = useApiClient();
  const res = await client.request('/large-data');
  if (res.data.length !== 5000) throw new Error('Large payload truncated');
});

await runTest('A.5 Circular reference in raw error does not break ApiError or normalization', async () => {
  const cyclicErr = { statusCode: 500, message: 'Boom' };
  cyclicErr.self = cyclicErr;

  const normalized = normalizeError(cyclicErr);
  if (normalized.status !== 500) throw new Error('Status mismatch');
  if (normalized.raw !== cyclicErr) throw new Error('Raw reference not preserved');
  if (!(normalized instanceof ApiError)) throw new Error('Not an ApiError instance');
});

await runTest('A.6 Numeric pageOrderOrSlug in getContentPage routes to numeric endpoint', async () => {
  let calledUrl = '';
  globalThis.$fetch.raw = async (url) => {
    calledUrl = url;
    return { status: 200, headers: new Headers(), _data: { success: true, message: 'OK', data: {} } };
  };

  const client = useApiClient();
  await client.getContentPage('guia-slug', 2);
  if (!calledUrl.endsWith('/pages/2')) throw new Error(`Expected /pages/2, got: ${calledUrl}`);

  await client.getContentPage('guia-slug', '2');
  if (!calledUrl.endsWith('/pages/2')) throw new Error(`Expected string '2' to route to /pages/2, got: ${calledUrl}`);

  await client.getContentPage('guia-slug', 'introduccion');
  if (!calledUrl.endsWith('/pages/slug/introduccion')) throw new Error(`Expected slug route, got: ${calledUrl}`);
});

await runTest('A.7 HTTP 204 No Content handling', async () => {
  globalThis.$fetch.raw = async () => ({
    status: 204,
    headers: new Headers(),
    _data: null
  });

  const client = useApiClient();
  const res = await client.request('/no-content');
  if (res.success !== true || res.data !== null || res.message !== 'Operación completada') {
    throw new Error('204 response mismatch');
  }
});

console.log(`\nAdvanced suite completed: ${results.filter(r => r.pass).length}/${results.length} passed.`);
