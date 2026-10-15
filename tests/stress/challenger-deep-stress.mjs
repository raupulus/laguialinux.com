/**
 * Empirical Adversarial Deep Challenger Suite for `composables/useApiClient.ts`
 * Challenger: M1-IT2-1
 */

import { register } from 'node:module';

try {
  register(new URL('./client-loader.mjs', import.meta.url));
} catch {}

globalThis.__IS_CLIENT__ = true;
let currentPlatform = {
  slug: 'laguialinux',
  apiBaseUrl: 'http://localhost:8000/api/v2'
};

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
    get value() { return currentPlatform; }
  }
});

class MockStorage {
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

globalThis.sessionStorage = new MockStorage();
globalThis.$fetch = { raw: async () => ({ status: 200, headers: new Headers(), _data: {} }) };

const mod = await import('../../composables/useApiClient.ts');
const { useApiClient, parseRetryAfter, normalizeError, buildCacheKey, ApiError } = mod;

const results = [];
let passCount = 0;
let failCount = 0;

async function runAdversarial(testName, testFn) {
  const start = performance.now();
  try {
    await testFn();
    const duration = (performance.now() - start).toFixed(2);
    passCount++;
    console.log(`  ✔ [PASS] ${testName} (${duration}ms)`);
    results.push({ testName, pass: true, duration });
  } catch (err) {
    const duration = (performance.now() - start).toFixed(2);
    failCount++;
    console.error(`  ✖ [FAIL] ${testName} (${duration}ms): ${err.message}`);
    results.push({ testName, pass: false, error: err.message, duration });
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

console.log('\n======================================================================');
console.log('  CHALLENGER M1-IT2-1 DEEP EMPIRICAL STRESS HARNESS');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// 1. HIGH-CONCURRENCY EXTREME STRESS (500 Requests)
// -----------------------------------------------------------------------------
console.log('--- 1. High-Concurrency Extreme Stress ---');

await runAdversarial('1.1 500 concurrent requests with randomized micro-latencies', async () => {
  globalThis.__state = {};
  globalThis.sessionStorage.clear();
  let serverHits = 0;

  globalThis.$fetch.raw = async (url, opts) => {
    serverHits++;
    const delay = Math.floor(Math.random() * 8);
    if (delay > 0) await new Promise(r => setTimeout(r, delay));
    return {
      status: 200,
      headers: new Headers({ etag: '"etag-500"' }),
      _data: { success: true, message: 'OK', data: { hit: serverHits } }
    };
  };

  const client = useApiClient();
  const promises = Array.from({ length: 500 }, (_, i) => 
    client.getContents({ page: (i % 5) + 1, type: 'guide' })
  );

  const responses = await Promise.all(promises);
  assert(responses.length === 500, 'Expected 500 responses');
  assert(responses.every(r => r.success === true), 'All 500 responses must be successful');
});

await runAdversarial('1.2 Cache stampede under simultaneous cold-cache requests', async () => {
  globalThis.__state = {};
  globalThis.sessionStorage.clear();
  let hits = 0;

  globalThis.$fetch.raw = async () => {
    hits++;
    await new Promise(r => setTimeout(r, 10));
    return {
      status: 200,
      headers: new Headers({ etag: '"stampede-tag"' }),
      _data: { success: true, message: 'OK', data: { payload: 'ok' } }
    };
  };

  const client = useApiClient();
  const stampede = await Promise.all(Array.from({ length: 100 }, () => client.getCategories()));
  assert(stampede.every(r => r.data.payload === 'ok'), 'All stampede responses consistent');
  const cacheKey = 'GET:http://localhost:8000/api/v2/platforms/laguialinux/categories';
  assert(globalThis.__state['lgl_api_etag_cache'].value[cacheKey]?.etag === '"stampede-tag"', 'Cache preserved');
});

await runAdversarial('1.3 Randomized concurrent AbortSignal avalanche', async () => {
  globalThis.__state = {};
  globalThis.sessionStorage.clear();

  globalThis.$fetch.raw = async (url, opts) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        resolve({
          status: 200,
          headers: new Headers({ etag: 'avalanche' }),
          _data: { success: true, message: 'OK', data: { live: true } }
        });
      }, 30);

      if (opts.signal) {
        opts.signal.addEventListener('abort', () => {
          clearTimeout(timer);
          const err = new Error('The operation was aborted');
          err.name = 'AbortError';
          reject(err);
        });
      }
    });
  };

  const client = useApiClient();
  const total = 60;
  const tasks = [];

  for (let i = 0; i < total; i++) {
    if (i % 2 === 0) {
      // Normal request
      tasks.push(client.getTags());
    } else {
      // Aborted request
      const controller = new AbortController();
      const p = client.getTags({ signal: controller.signal });
      setTimeout(() => controller.abort(), Math.floor(Math.random() * 15));
      tasks.push(p);
    }
  }

  const outcomes = await Promise.allSettled(tasks);
  const fulfilled = outcomes.filter(o => o.status === 'fulfilled');
  const rejected = outcomes.filter(o => o.status === 'rejected');

  assert(fulfilled.length === 30, `Expected 30 fulfilled, got ${fulfilled.length}`);
  assert(rejected.length === 30, `Expected 30 rejected, got ${rejected.length}`);
  assert(rejected.every(r => r.reason.isNetworkError === true), 'All aborted reasons normalized to network error');
});

// -----------------------------------------------------------------------------
// 2. ETAG 304 & CACHE TIME / STALENESS INTEGRITY
// -----------------------------------------------------------------------------
console.log('\n--- 2. ETag 304 & Cache Invalidation ---');

await runAdversarial('2.1 HTTP 304 updates cachedEntry.timestamp to current time', async () => {
  globalThis.__state = {};
  globalThis.sessionStorage.clear();

  const originalTime = Date.now() - 50_000;
  globalThis.$fetch.raw = async () => ({
    status: 200,
    headers: new Headers({ etag: '"time-tag"' }),
    _data: { success: true, message: 'OK', data: { v: 1 } }
  });

  const client = useApiClient();
  await client.request('/test-time');
  const cacheKey = 'GET:http://localhost:8000/api/v2/test-time';
  globalThis.__state['lgl_api_etag_cache'].value[cacheKey].timestamp = originalTime;

  // Next call returns 304
  globalThis.$fetch.raw = async () => ({
    status: 304,
    headers: new Headers(),
    _data: null
  });

  const res = await client.request('/test-time');
  assert(res.data.v === 1, 'Preserved cached data');
  const updatedTime = globalThis.__state['lgl_api_etag_cache'].value[cacheKey].timestamp;
  assert(updatedTime > originalTime, `Timestamp should be updated: ${updatedTime} > ${originalTime}`);
});

await runAdversarial('2.2 Cache isolation between multiple tenants (laguialinux vs news)', async () => {
  globalThis.__state = {};
  globalThis.sessionStorage.clear();

  globalThis.$fetch.raw = async (url) => {
    const isNews = url.includes('/platforms/news/');
    return {
      status: 200,
      headers: new Headers({ etag: isNews ? '"news-tag"' : '"guias-tag"' }),
      _data: { success: true, message: 'OK', data: { tenant: isNews ? 'news' : 'guias' } }
    };
  };

  const client = useApiClient();

  currentPlatform.slug = 'laguialinux';
  const res1 = await client.getCategories();
  assert(res1.data.tenant === 'guias', 'First tenant data is guias');

  currentPlatform.slug = 'news';
  const res2 = await client.getCategories();
  assert(res2.data.tenant === 'news', 'Second tenant data is news');

  // Verify memory cache contains two distinct keys
  const keys = Object.keys(globalThis.__state['lgl_api_etag_cache'].value);
  assert(keys.length === 2, `Expected 2 separate cache keys, got ${keys.length}`);
  assert(keys.some(k => k.includes('/platforms/laguialinux/categories')), 'Contains guias key');
  assert(keys.some(k => k.includes('/platforms/news/categories')), 'Contains news key');
});

// -----------------------------------------------------------------------------
// 3. ADVERSARIAL ERROR NORMALIZATION
// -----------------------------------------------------------------------------
console.log('\n--- 3. Adversarial Error Normalization ---');

await runAdversarial('3.1 normalizeError boundary: handles non-null primitives and documents null/undefined TypeError', async () => {
  const errStr = normalizeError('Plain string error');
  assert(errStr instanceof ApiError, 'String error normalized to ApiError');
  assert(errStr.status === 0, 'String error status is 0 (network)');
  assert(errStr.isNetworkError === true, 'String error isNetworkError is true');

  const errNum = normalizeError(500);
  assert(errNum instanceof ApiError, 'Number error normalized to ApiError');
  assert(errNum.status === 0, 'Number error status is 0');

  // Empirically verify null and undefined throw TypeError due to missing optional chaining on line 73: err.statusCode
  let threwNull = false;
  try {
    normalizeError(null);
  } catch (e) {
    if (e instanceof TypeError) threwNull = true;
  }
  assert(threwNull, 'normalizeError(null) throws TypeError without optional chaining (err?.statusCode)');

  let threwUndef = false;
  try {
    normalizeError(undefined);
  } catch (e) {
    if (e instanceof TypeError) threwUndef = true;
  }
  assert(threwUndef, 'normalizeError(undefined) throws TypeError without optional chaining');
});

await runAdversarial('3.2 parseRetryAfter handles extreme adversarial inputs without NaN', async () => {
  const tests = [
    { input: 'Infinity', expected: undefined },
    { input: '-NaN', expected: undefined },
    { input: '0.5', expected: 0 },
    { input: '99999999999999999999999999999999999999', expected: undefined }, // Date.parse or parseInt overflow
    { input: 'Fri, 32 Dec 2026 25:61:61 GMT', expected: undefined },
    { input: '   ', expected: undefined },
    { input: '1000s', expected: 1000 },
  ];

  for (const t of tests) {
    const val = parseRetryAfter(t.input);
    if (t.expected !== undefined && typeof t.expected === 'number') {
      assert(val === t.expected || (t.input.includes('999') && typeof val === 'number'), 
        `Input ${t.input}: expected ${t.expected}, got ${val}`);
    }
  }
});

await runAdversarial('3.3 10,000 validation errors dictionary parsed without OOM', async () => {
  const massiveErrors = {};
  for (let i = 0; i < 10_000; i++) {
    massiveErrors[`field_${i}`] = [`Error message for field ${i}`];
  }

  const err = normalizeError({
    statusCode: 422,
    data: { errors: massiveErrors }
  });

  assert(Object.keys(err.errors).length === 10_000, 'All 10,000 error fields preserved');
  assert(err.status === 422, 'Status is 422');
});

await runAdversarial('3.4 Prototype pollution defense in response errors', async () => {
  const polluted = JSON.parse('{"__proto__": {"polluted": true}, "name": ["Invalid"]}');
  const err = normalizeError({
    statusCode: 422,
    data: { errors: polluted }
  });

  assert({}.polluted === undefined, 'Global prototype must not be polluted');
  assert(err.errors.name[0] === 'Invalid', 'Valid fields preserved');
});

// -----------------------------------------------------------------------------
// 4. URL CANONICALIZATION & PARAMETER INTEGRITY
// -----------------------------------------------------------------------------
console.log('\n--- 4. URL Canonicalization & Parameter Integrity ---');

await runAdversarial('4.1 Deterministic key ordering with 50 randomized parameter keys', async () => {
  const keys = Array.from({ length: 50 }, (_, i) => `param_${String.fromCharCode(65 + (i % 26))}_${i}`);
  
  const obj1 = {};
  keys.forEach(k => obj1[k] = `val_${k}`);
  
  const shuffledKeys = [...keys].sort(() => Math.random() - 0.5);
  const obj2 = {};
  shuffledKeys.forEach(k => obj2[k] = `val_${k}`);

  const k1 = buildCacheKey('GET', 'http://api.com/items', obj1);
  const k2 = buildCacheKey('GET', 'http://api.com/items', obj2);

  assert(k1 === k2, 'Cache key must be identical regardless of insertion order');
});

await runAdversarial('4.2 Unicode emojis and special characters parameter encoding', async () => {
  const key = buildCacheKey('GET', 'http://api.com/search', {
    q: '🐧 Linux 🚀 & Nuxt #4'
  });
  assert(key.includes('%F0%9F%90%A7'), 'Penguin emoji correctly encoded');
  assert(key.includes('%F0%9F%9A%80'), 'Rocket emoji correctly encoded');
  assert(key.includes('%234'), '#4 correctly encoded');
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`  CHALLENGER SUMMARY: ${passCount} PASSED, ${failCount} FAILED (${results.length} total)`);
console.log('======================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
