/**
 * Empirical Adversarial Stress Test Suite for `composables/useApiClient.ts`
 * 
 * Tests:
 * 1. Weak ETags, corrupted ETags, missing ETag headers, HTTP 304 payload retrieval.
 * 2. Storage exhaustion: QuotaExceededError in sessionStorage, LRU eviction and fallback.
 * 3. Concurrent identical requests: race conditions, in-flight state isolation, abort handling.
 * 4. Error cases: HTTP 429 with RFC 1123 HTTP-Date and numeric Retry-After, HTTP 422, HTTP 502/NetworkError.
 * 5. URL canonicalization and parameter encoding.
 */

import { register } from 'node:module';

// Register ESM loader hook to handle Nuxt's import.meta.client in Node.js
try {
  register(new URL('./client-loader.mjs', import.meta.url));
} catch {}

// Setup environment globals required by useApiClient
globalThis.__IS_CLIENT__ = true;
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
    value: {
      slug: 'laguialinux',
      apiBaseUrl: 'http://localhost:8000/api/v2'
    }
  }
});

// Mock Storage implementation with quota and corruption control
export class MockStorage {
  constructor(options = {}) {
    this.map = new Map(options.initialEntries || []);
    this.quotaLimit = options.quotaLimit ?? Infinity;
    this.throwOnSet = options.throwOnSet ?? null;
    this.getItemHooks = options.getItemHooks || {};
  }

  get length() {
    return this.map.size;
  }

  key(index) {
    return Array.from(this.map.keys())[index] || null;
  }

  getItem(key) {
    if (this.getItemHooks[key]) {
      return this.getItemHooks[key]();
    }
    return this.map.has(key) ? this.map.get(key) : null;
  }

  setItem(key, value) {
    if (this.throwOnSet) {
      throw this.throwOnSet;
    }
    if (!this.map.has(key) && this.map.size >= this.quotaLimit) {
      const err = new Error('The quota has been exceeded.');
      err.name = 'QuotaExceededError';
      err.code = 22;
      throw err;
    }
    this.map.set(key, String(value));
  }

  removeItem(key) {
    this.map.delete(key);
  }

  clear() {
    this.map.clear();
  }
}

// Color formatting
const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m'
};

// Test Runner Engine
const testResults = [];
let currentSuite = '';

function suite(name) {
  currentSuite = name;
  console.log(`\n${ANSI.bold}${ANSI.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${ANSI.reset}`);
  console.log(`${ANSI.bold}${ANSI.cyan}  SUITE: ${name}${ANSI.reset}`);
  console.log(`${ANSI.bold}${ANSI.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${ANSI.reset}`);
}

async function test(name, fn) {
  const start = performance.now();
  try {
    await fn();
    const duration = (performance.now() - start).toFixed(2);
    testResults.push({ suite: currentSuite, name, status: 'PASS', duration });
    console.log(`  ${ANSI.green}✔ PASS${ANSI.reset} ${name} ${ANSI.gray}(${duration}ms)${ANSI.reset}`);
  } catch (err) {
    const duration = (performance.now() - start).toFixed(2);
    testResults.push({ suite: currentSuite, name, status: 'FAIL', duration, error: err.message, stack: err.stack });
    console.log(`  ${ANSI.red}✖ FAIL${ANSI.reset} ${name} ${ANSI.gray}(${duration}ms)${ANSI.reset}`);
    console.log(`    ${ANSI.red}Error: ${err.message}${ANSI.reset}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

assert.equal = function(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'Assertion failed'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
};

assert.deepEqual = function(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(`${message || 'Assertion failed'}: expected ${expectedStr}, got ${actualStr}`);
  }
};

// Load the useApiClient module
const mod = await import('../../composables/useApiClient.ts');
const { useApiClient, parseRetryAfter, normalizeError, buildCacheKey, ApiError } = mod;

// Helper to reset mocks
function resetMocks(storageOptions = {}) {
  globalThis.__state = {};
  globalThis.sessionStorage = new MockStorage(storageOptions);
  globalThis.$fetch = {
    raw: async () => ({ status: 200, headers: new Headers(), _data: {} })
  };
}

// =========================================================================
// RUN TESTS
// =========================================================================

console.log(`${ANSI.bold}${ANSI.magenta}======================================================================${ANSI.reset}`);
console.log(`${ANSI.bold}${ANSI.magenta}  ADVERSARIAL STRESS TEST: composables/useApiClient.ts               ${ANSI.reset}`);
console.log(`${ANSI.bold}${ANSI.magenta}======================================================================${ANSI.reset}`);

// -------------------------------------------------------------------------
// SUITE 1: ETags & HTTP 304 Handling
// -------------------------------------------------------------------------
suite('1. ETags & HTTP 304 Conditional Request Engine');

await test('1.1 Strong ETag caching and subsequent If-None-Match header injection', async () => {
  resetMocks();
  let receivedHeaders = null;
  globalThis.$fetch.raw = async (url, opts) => {
    receivedHeaders = opts.headers;
    return {
      status: 200,
      headers: new Headers({ etag: '"strong-etag-100"' }),
      _data: { success: true, message: 'OK', data: { id: 1 } }
    };
  };

  const client = useApiClient();
  const res1 = await client.getContents();
  assert.equal(res1.data.id, 1, 'First request returns data');
  assert.equal(receivedHeaders['If-None-Match'], undefined, 'First request has no If-None-Match');

  // Second request: mock returns 304 Not Modified
  globalThis.$fetch.raw = async (url, opts) => {
    receivedHeaders = opts.headers;
    return {
      status: 304,
      headers: new Headers(),
      _data: null
    };
  };

  const res2 = await client.getContents();
  assert.equal(receivedHeaders['If-None-Match'], '"strong-etag-100"', 'Second request sends strong ETag');
  assert.equal(res2.data.id, 1, 'Second request returns cached payload on 304');
});

await test('1.2 Weak ETag (W/"...") caching and preservation', async () => {
  resetMocks();
  let receivedHeaders = null;
  globalThis.$fetch.raw = async (url, opts) => {
    receivedHeaders = opts.headers;
    return {
      status: 200,
      headers: new Headers({ etag: 'W/"weak-hash-456"' }),
      _data: { success: true, message: 'OK', data: { title: 'Weak Guide' } }
    };
  };

  const client = useApiClient();
  await client.getContentBySlug('guia-weak');

  globalThis.$fetch.raw = async (url, opts) => {
    receivedHeaders = opts.headers;
    return {
      status: 304,
      headers: new Headers(),
      _data: null
    };
  };

  const res2 = await client.getContentBySlug('guia-weak');
  assert.equal(receivedHeaders['If-None-Match'], 'W/"weak-hash-456"', 'Sends exact weak ETag in If-None-Match');
  assert.equal(res2.data.title, 'Weak Guide', 'Returns cached data on weak ETag 304');
});

await test('1.3 Case-insensitive ETag header lookup (etag vs ETag)', async () => {
  resetMocks();
  globalThis.$fetch.raw = async () => ({
    status: 200,
    headers: { get: (name) => name.toLowerCase() === 'etag' ? '"case-etag-789"' : null },
    _data: { success: true, message: 'OK', data: { ok: true } }
  });

  const client = useApiClient();
  await client.request('/test-case');

  let ifNoneMatch = null;
  globalThis.$fetch.raw = async (url, opts) => {
    ifNoneMatch = opts.headers['If-None-Match'];
    return { status: 304, headers: new Headers(), _data: null };
  };

  await client.request('/test-case');
  assert.equal(ifNoneMatch, '"case-etag-789"', 'Cached ETag regardless of header casing');
});

await test('1.4 HTTP 304 fallback when no local cached entry exists', async () => {
  resetMocks();
  globalThis.$fetch.raw = async () => ({
    status: 304,
    headers: new Headers(),
    _data: null
  });

  const client = useApiClient();
  const res = await client.request('/no-prior-cache');
  assert.equal(res.success, true, 'Returns success: true on un-cached 304');
  assert.equal(res.message, 'Sin modificaciones', 'Returns standard message');
  assert.equal(res.data, null, 'Returns data: null');
});

await test('1.5 Exception with status 304 thrown by underlying fetch recovers gracefully', async () => {
  resetMocks();
  // First seed cache
  globalThis.$fetch.raw = async () => ({
    status: 200,
    headers: new Headers({ etag: '"seed-tag"' }),
    _data: { success: true, message: 'OK', data: { seeded: true } }
  });

  const client = useApiClient();
  await client.request('/seed-item');

  // Next fetch throws an error with status 304
  globalThis.$fetch.raw = async () => {
    const err = new Error('304 Not Modified');
    err.status = 304;
    throw err;
  };

  const res = await client.request('/seed-item');
  assert.equal(res.data.seeded, true, 'Catches 304 exception and recovers cached data');
});

await test('1.6 Missing ETag in 200 response does not create cache entry', async () => {
  resetMocks();
  globalThis.$fetch.raw = async () => ({
    status: 200,
    headers: new Headers(), // No ETag
    _data: { success: true, message: 'OK', data: { dynamic: true } }
  });

  const client = useApiClient();
  await client.request('/dynamic-item');

  let sentIfNoneMatch = 'NOT_SET';
  globalThis.$fetch.raw = async (url, opts) => {
    sentIfNoneMatch = opts.headers['If-None-Match'];
    return { status: 200, headers: new Headers(), _data: { success: true, message: 'OK', data: {} } };
  };

  await client.request('/dynamic-item');
  assert.equal(sentIfNoneMatch, undefined, 'No If-None-Match sent when initial 200 omitted ETag');
});

await test('1.7 Corrupted JSON in sessionStorage does not crash readSessionStorage', async () => {
  resetMocks({
    initialEntries: [
      ['lgl_etag_GET:http://localhost:8000/api/v2/corrupt-json', '<<<not valid json>>>']
    ]
  });

  globalThis.$fetch.raw = async () => ({
    status: 200,
    headers: new Headers(),
    _data: { success: true, message: 'OK', data: { clean: true } }
  });

  const client = useApiClient();
  const res = await client.request('/corrupt-json');
  assert.equal(res.data.clean, true, 'Successfully bypassed corrupted JSON in storage without throwing');
});

await test('1.8 Corrupted entry structure (missing etag) is auto-purged from sessionStorage', async () => {
  const key = 'lgl_etag_GET:http://localhost:8000/api/v2/missing-etag-prop';
  const storage = new MockStorage({
    initialEntries: [
      [key, JSON.stringify({ data: { hello: 1 } })] // no etag
    ]
  });
  resetMocks();
  globalThis.sessionStorage = storage;

  let purgedDuringFetch = false;
  globalThis.$fetch.raw = async () => {
    purgedDuringFetch = !storage.map.has(key);
    return {
      status: 200,
      headers: new Headers(),
      _data: { success: true, message: 'OK', data: {} }
    };
  };

  const client = useApiClient();
  await client.request('/missing-etag-prop');
  assert.equal(purgedDuringFetch, true, 'Entry lacking etag was deleted from storage');
});

await test('1.9 skipCache: true bypasses cache inspection and updates', async () => {
  resetMocks();
  globalThis.$fetch.raw = async () => ({
    status: 200,
    headers: new Headers({ etag: '"cached-tag"' }),
    _data: { success: true, message: 'OK', data: { v: 1 } }
  });

  const client = useApiClient();
  await client.request('/skip-test');

  let sentIfNoneMatch = 'NOT_SET';
  globalThis.$fetch.raw = async (url, opts) => {
    sentIfNoneMatch = opts.headers['If-None-Match'];
    return {
      status: 200,
      headers: new Headers({ etag: '"new-tag"' }),
      _data: { success: true, message: 'OK', data: { v: 2 } }
    };
  };

  const res = await client.request('/skip-test', { skipCache: true });
  assert.equal(sentIfNoneMatch, undefined, 'skipCache omitted If-None-Match header');
  assert.equal(res.data.v, 2, 'skipCache returned fresh response');
});

await test('1.10 clearCache wipes both memoryCache and sessionStorage', async () => {
  resetMocks();
  globalThis.$fetch.raw = async () => ({
    status: 200,
    headers: new Headers({ etag: '"clean-me"' }),
    _data: { success: true, message: 'OK', data: { v: 1 } }
  });

  const client = useApiClient();
  await client.request('/clear-me');

  const cacheKey = 'GET:http://localhost:8000/api/v2/clear-me';
  assert.equal(!!globalThis.__state['lgl_api_etag_cache']?.value[cacheKey], true, 'Present in memory cache before clear');
  assert.equal(globalThis.sessionStorage.map.has('lgl_etag_' + cacheKey), true, 'Present in storage before clear');

  client.clearCache();
  assert.deepEqual(globalThis.__state['lgl_api_etag_cache']?.value, {}, 'Memory cache empty after clear');
  assert.equal(globalThis.sessionStorage.map.size, 0, 'Storage empty after clear');
});

await test('1.11 clearCache(prefix) selectively clears only matching keys', async () => {
  resetMocks();
  globalThis.$fetch.raw = async (url) => ({
    status: 200,
    headers: new Headers({ etag: '"tag"' }),
    _data: { success: true, message: 'OK', data: {} }
  });

  const client = useApiClient();
  await client.request('/prefix-a/item');
  await client.request('/prefix-b/item');

  client.clearCache('/prefix-a');

  const keyA = 'GET:http://localhost:8000/api/v2/prefix-a/item';
  const keyB = 'GET:http://localhost:8000/api/v2/prefix-b/item';

  assert.equal(globalThis.__state['lgl_api_etag_cache'].value[keyA], undefined, 'Prefix A purged from memory');
  assert.equal(!!globalThis.__state['lgl_api_etag_cache'].value[keyB], true, 'Prefix B kept in memory');
  assert.equal(globalThis.sessionStorage.map.has('lgl_etag_' + keyA), false, 'Prefix A purged from storage');
  assert.equal(globalThis.sessionStorage.map.has('lgl_etag_' + keyB), true, 'Prefix B kept in storage');
});

// -------------------------------------------------------------------------
// SUITE 2: Storage Exhaustion & QuotaExceededError Resilience
// -------------------------------------------------------------------------
suite('2. Storage Exhaustion & QuotaExceededError Resilience');

await test('2.1 QuotaExceededError triggers graceful LRU 50% eviction and retries', async () => {
  resetMocks({ quotaLimit: 4 });
  const storage = globalThis.sessionStorage;

  const responses = {
    '/e1': { etag: 'e1', data: { id: 1 } },
    '/e2': { etag: 'e2', data: { id: 2 } },
    '/e3': { etag: 'e3', data: { id: 3 } },
    '/e4': { etag: 'e4', data: { id: 4 } },
    '/e5': { etag: 'e5', data: { id: 5 } }
  };

  globalThis.$fetch.raw = async (url) => {
    const ep = url.replace('http://localhost:8000/api/v2', '');
    return {
      status: 200,
      headers: new Headers({ etag: responses[ep].etag }),
      _data: { success: true, message: 'OK', data: responses[ep].data }
    };
  };

  const client = useApiClient();
  await client.request('/e1');
  await new Promise(r => setTimeout(r, 5));
  await client.request('/e2');
  await new Promise(r => setTimeout(r, 5));
  await client.request('/e3');
  await new Promise(r => setTimeout(r, 5));
  await client.request('/e4');

  assert.equal(storage.length, 4, 'Storage full with 4 items');

  // 5th item overflows quota
  await new Promise(r => setTimeout(r, 5));
  await client.request('/e5');

  // Should have evicted oldest 50% (2 items: e1, e2) and inserted e5 -> 3 items
  assert.equal(storage.map.has('lgl_etag_GET:http://localhost:8000/api/v2/e1'), false, 'Oldest e1 evicted');
  assert.equal(storage.map.has('lgl_etag_GET:http://localhost:8000/api/v2/e2'), false, 'Second oldest e2 evicted');
  assert.equal(storage.map.has('lgl_etag_GET:http://localhost:8000/api/v2/e3'), true, 'e3 retained');
  assert.equal(storage.map.has('lgl_etag_GET:http://localhost:8000/api/v2/e4'), true, 'e4 retained');
  assert.equal(storage.map.has('lgl_etag_GET:http://localhost:8000/api/v2/e5'), true, 'e5 successfully inserted');
});

await test('2.2 Cross-browser quota error name and code matching (code 22, code 1014, NS_ERROR_DOM_QUOTA_REACHED)', async () => {
  // Test code 1014 (Firefox)
  const ffError = new Error('Quota reached');
  ffError.code = 1014;
  ffError.name = 'NS_ERROR_DOM_QUOTA_REACHED';

  let setCalls = 0;
  const storage = new MockStorage();
  storage.setItem = (k, v) => {
    setCalls++;
    if (setCalls === 1) throw ffError;
    storage.map.set(k, v);
  };

  resetMocks();
  globalThis.sessionStorage = storage;
  globalThis.$fetch.raw = async () => ({
    status: 200,
    headers: new Headers({ etag: 'ff-tag' }),
    _data: { success: true, message: 'OK', data: { ff: true } }
  });

  const client = useApiClient();
  const res = await client.request('/firefox-quota');
  assert.equal(res.data.ff, true, 'Successfully handled Firefox code 1014 quota error');
  assert.equal(setCalls, 2, 'Retried after catching Firefox quota error');
});

await test('2.3 Persistent storage exhaustion falls back to memory cache without throwing', async () => {
  const permError = new Error('Persistent quota exceeded');
  permError.name = 'QuotaExceededError';
  permError.code = 22;

  const storage = new MockStorage({ throwOnSet: permError });
  resetMocks();
  globalThis.sessionStorage = storage;

  globalThis.$fetch.raw = async () => ({
    status: 200,
    headers: new Headers({ etag: 'perm-tag' }),
    _data: { success: true, message: 'OK', data: { persisted: 'memory-only' } }
  });

  const client = useApiClient();
  let didThrow = false;
  let res = null;
  try {
    res = await client.request('/perm-fail');
  } catch {
    didThrow = true;
  }

  assert.equal(didThrow, false, 'Did not throw to consumer on persistent storage quota failure');
  assert.equal(res.data.persisted, 'memory-only', 'Response resolved successfully');
  const inMemory = globalThis.__state['lgl_api_etag_cache']?.value['GET:http://localhost:8000/api/v2/perm-fail'];
  assert.equal(inMemory?.etag, 'perm-tag', 'Entry preserved in memory cache');
});

await test('2.4 Alien key pollution in storage: safe eviction when no lgl_etag_ keys exist', async () => {
  const alienStorage = new MockStorage({
    initialEntries: [
      ['alien_key_1', 'val1'],
      ['alien_key_2', 'val2']
    ],
    quotaLimit: 2
  });
  resetMocks();
  globalThis.sessionStorage = alienStorage;

  globalThis.$fetch.raw = async () => ({
    status: 200,
    headers: new Headers({ etag: 'tag-new' }),
    _data: { success: true, message: 'OK', data: { ok: true } }
  });

  const client = useApiClient();
  let didThrow = false;
  try {
    await client.request('/new-item');
  } catch {
    didThrow = true;
  }

  assert.equal(didThrow, false, 'Handled exhaustion cleanly when storage full of alien keys');
});

// -------------------------------------------------------------------------
// SUITE 3: Concurrent Identical Requests & State Isolation
// -------------------------------------------------------------------------
suite('3. Concurrent Identical Requests & State Isolation');

await test('3.1 50 concurrent identical requests resolve without state corruption', async () => {
  resetMocks();
  let serverHits = 0;
  globalThis.$fetch.raw = async () => {
    serverHits++;
    await new Promise(r => setTimeout(r, Math.floor(Math.random() * 15)));
    return {
      status: 200,
      headers: new Headers({ etag: '"concurrency-etag"' }),
      _data: { success: true, message: 'OK', data: { count: serverHits } }
    };
  };

  const client = useApiClient();
  const promises = Array.from({ length: 50 }, () => client.getContents({ page: 1 }));
  const results = await Promise.all(promises);

  assert.equal(results.length, 50, 'All 50 promises resolved');
  assert.equal(results.every(r => r.success), true, 'All 50 responses indicate success');
  const cacheKey = 'GET:http://localhost:8000/api/v2/platforms/laguialinux/contents?page=1';
  const cached = globalThis.__state['lgl_api_etag_cache'].value[cacheKey];
  assert.equal(cached.etag, '"concurrency-etag"', 'Final cache entry is consistent');
});

await test('3.2 Interleaved concurrent GET and POST mutations maintain isolation', async () => {
  resetMocks();
  let postHeaderIfNoneMatch = 'NOT_SET';
  globalThis.$fetch.raw = async (url, opts) => {
    if (opts.method === 'POST') {
      postHeaderIfNoneMatch = opts.headers['If-None-Match'];
      return { status: 201, headers: new Headers(), _data: { success: true, message: 'Enviado', data: null } };
    }
    return {
      status: 200,
      headers: new Headers({ etag: '"get-tag"' }),
      _data: { success: true, message: 'OK', data: { info: true } }
    };
  };

  const client = useApiClient();
  // First seed GET
  await client.getPlatformInfo();

  // Run concurrent GET and POST
  const [getRes, postRes] = await Promise.all([
    client.getPlatformInfo(),
    client.postContact({ name: 'Test', email: 'test@example.com', subject: 'Sub', message: 'Msg' })
  ]);

  assert.equal(getRes.data.info, true, 'GET resolved successfully');
  assert.equal(postRes.success, true, 'POST resolved successfully');
  assert.equal(postHeaderIfNoneMatch, undefined, 'POST never sends If-None-Match header');
});

await test('3.3 AbortSignal cleanly rejects aborted request without contaminating siblings', async () => {
  resetMocks();
  globalThis.$fetch.raw = async (url, opts) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        resolve({
          status: 200,
          headers: new Headers({ etag: 'tag-1' }),
          _data: { success: true, message: 'OK', data: { ok: true } }
        });
      }, 40);

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
  const controller = new AbortController();

  const p1 = client.getContents();
  const p2 = client.getContents(undefined, { signal: controller.signal });
  const p3 = client.getContents();

  // Abort only the second request
  controller.abort();

  const [r1, r2, r3] = await Promise.allSettled([p1, p2, p3]);

  assert.equal(r1.status, 'fulfilled', 'Sibling request 1 completed successfully');
  assert.equal(r2.status, 'rejected', 'Aborted request 2 was rejected');
  assert.equal(r3.status, 'fulfilled', 'Sibling request 3 completed successfully');
  assert.equal(r2.reason.isNetworkError, true, 'Aborted request normalized with error');
});

// -------------------------------------------------------------------------
// SUITE 4: Error Handling & Normalization (429, 422, 502, NetworkError)
// -------------------------------------------------------------------------
suite('4. Error Handling & Normalization');

await test('4.1 parseRetryAfter parses integer seconds and whitespace', async () => {
  assert.equal(parseRetryAfter('60'), 60, 'Parses 60');
  assert.equal(parseRetryAfter('  120  '), 120, 'Parses trimmed 120');
  assert.equal(parseRetryAfter('0'), 0, 'Parses 0');
  assert.equal(parseRetryAfter(''), undefined, 'Empty string returns undefined');
  assert.equal(parseRetryAfter(null), undefined, 'Null returns undefined');
  assert.equal(parseRetryAfter(undefined), undefined, 'Undefined returns undefined');
  assert.equal(parseRetryAfter('invalid-abc'), undefined, 'Non-date string returns undefined');
});

await test('4.2 parseRetryAfter parses RFC 1123 HTTP-Date', async () => {
  // Future date (+30s)
  const future = new Date(Date.now() + 30000).toUTCString();
  const diffFuture = parseRetryAfter(future);
  assert(diffFuture >= 28 && diffFuture <= 31, `Expected ~30s, got ${diffFuture}`);

  // Past date (-15s)
  const past = new Date(Date.now() - 15000).toUTCString();
  const diffPast = parseRetryAfter(past);
  assert.equal(diffPast, 0, 'Past date returns 0');
});

await test('4.3 parseRetryAfter negative value behavior', async () => {
  // Negative integer falls through to Date.parse("-5") in V8
  const res = parseRetryAfter('-5');
  assert(res === 0 || res === undefined, `Expected 0 or undefined, got ${res}`);
});

await test('4.4 HTTP 429 normalization with Retry-After header and localized message', async () => {
  const err = normalizeError({
    statusCode: 429,
    headers: new Headers({ 'retry-after': '45' }),
    data: {
      errors: { rate_limit: ['Límite alcanzado'] }
    }
  });

  assert.equal(err.status, 429, 'Status is 429');
  assert.equal(err.isRateLimited, true, 'isRateLimited is true');
  assert.equal(err.retryAfterSeconds, 45, 'retryAfterSeconds parsed as 45');
  assert.equal(err.message, 'Demasiadas peticiones. Por favor, inténtelo de nuevo más tarde.', 'Localized 429 default message');
  assert.deepEqual(err.errors.rate_limit, ['Límite alcanzado'], 'Errors map preserved');
});

await test('4.5 HTTP 422 validation error mapping (arrays and string values)', async () => {
  const err = normalizeError({
    statusCode: 422,
    data: {
      message: 'Validation failed',
      errors: {
        email: ['El email ya existe'],
        name: 'El nombre es obligatorio' // Single string
      }
    }
  });

  assert.equal(err.status, 422, 'Status is 422');
  assert.equal(err.message, 'Validation failed', 'Preserves backend message');
  assert.deepEqual(err.errors.email, ['El email ya existe'], 'Array errors preserved');
  assert.deepEqual(err.errors.name, ['El nombre es obligatorio'], 'Single string error normalized to array');
});

await test('4.6 HTTP 422 default localized message when backend message empty', async () => {
  const err = normalizeError({
    statusCode: 422,
    data: { errors: {} }
  });
  assert.equal(err.message, 'Los datos proporcionados no son válidos.', 'Default 422 message applied');
});

await test('4.7 HTTP 502 Bad Gateway normalization vs NetworkError', async () => {
  const err502 = normalizeError({
    statusCode: 502,
    data: {}
  });

  assert.equal(err502.status, 502, 'Status is 502');
  assert.equal(err502.isNetworkError, false, 'isNetworkError is false for server 502');
  assert.equal(err502.message, 'Error interno del servidor.', 'Default 500+ message applied');
});

await test('4.8 Pure client network disconnection (status 0 / fetch failed / ENOTFOUND)', async () => {
  const netErr1 = normalizeError(new Error('fetch failed'));
  assert.equal(netErr1.status, 0, 'Status is 0');
  assert.equal(netErr1.isNetworkError, true, 'isNetworkError is true');
  assert.equal(netErr1.message, 'No se pudo conectar con el servidor. Revisa tu conexión a internet.', 'Localized network error message');

  const netErr2 = normalizeError({ code: 'ECONNREFUSED' });
  assert.equal(netErr2.status, 0, 'ECONNREFUSED status is 0');
  assert.equal(netErr2.isNetworkError, true, 'ECONNREFUSED isNetworkError is true');

  const netErr3 = normalizeError({ code: 'ENOTFOUND' });
  assert.equal(netErr3.status, 0, 'ENOTFOUND status is 0');
  assert.equal(netErr3.isNetworkError, true, 'ENOTFOUND isNetworkError is true');
});

await test('4.9 HTTP 404 Not Found default message', async () => {
  const err404 = normalizeError({ statusCode: 404 });
  assert.equal(err404.status, 404, 'Status is 404');
  assert.equal(err404.message, 'Recurso no encontrado.', 'Default 404 message applied');
});

// -------------------------------------------------------------------------
// SUITE 5: URL Canonicalization & Parameter Encoding
// -------------------------------------------------------------------------
suite('5. URL Canonicalization & Parameter Encoding');

await test('5.1 Method canonicalization is uppercase', async () => {
  assert.equal(buildCacheKey('get', 'http://api.com/test'), 'GET:http://api.com/test');
  assert.equal(buildCacheKey('GET', 'http://api.com/test'), 'GET:http://api.com/test');
  assert.equal(buildCacheKey('', 'http://api.com/test'), 'GET:http://api.com/test');
});

await test('5.2 Query parameter alphabetical sorting', async () => {
  const k1 = buildCacheKey('GET', 'http://api.com/contents', { z: 'last', a: 'first', m: 'middle' });
  const k2 = buildCacheKey('GET', 'http://api.com/contents', { a: 'first', m: 'middle', z: 'last' });
  assert.equal(k1, 'GET:http://api.com/contents?a=first&m=middle&z=last');
  assert.equal(k1, k2, 'Keys with different param order match identically');
});

await test('5.3 Falsy values preservation: 0 and false are retained', async () => {
  const keyZero = buildCacheKey('GET', 'http://api.com/contents', { page: 0 });
  assert.equal(keyZero, 'GET:http://api.com/contents?page=0', 'page: 0 is retained');

  const keyFalse = buildCacheKey('GET', 'http://api.com/contents', { featured: false });
  assert.equal(keyFalse, 'GET:http://api.com/contents?featured=false', 'featured: false is retained');
});

await test('5.4 Empty, null, and undefined values are omitted', async () => {
  const key = buildCacheKey('GET', 'http://api.com/contents', {
    empty: '',
    nil: null,
    undef: undefined,
    valid: 'yes'
  });
  assert.equal(key, 'GET:http://api.com/contents?valid=yes', 'Only valid param retained');
});

await test('5.5 Array parameter encoding', async () => {
  const key = buildCacheKey('GET', 'http://api.com/contents', { tags: ['bash', 'debian'] });
  assert.equal(key, 'GET:http://api.com/contents?tags=bash&tags=debian', 'Arrays serialized with repeated keys');
});

await test('5.6 Special characters and Spanish accents encoding', async () => {
  const key = buildCacheKey('GET', 'http://api.com/search', { q: 'guía linux & terminal = 1' });
  assert.equal(
    key,
    'GET:http://api.com/search?q=gu%C3%ADa+linux+%26+terminal+%3D+1',
    'Special characters and Spanish accents properly encoded'
  );
});

await test('5.7 URL already containing query string observation', async () => {
  const key = buildCacheKey('GET', 'http://api.com/search?base=1', { page: 2 });
  // Verifying empirical behavior: buildCacheKey appends ? rather than &
  assert.equal(key, 'GET:http://api.com/search?base=1?page=2', 'Documents double ? when url already has query string');
});

// =========================================================================
// SUMMARY REPORT
// =========================================================================

console.log(`\n${ANSI.bold}${ANSI.cyan}======================================================================${ANSI.reset}`);
console.log(`${ANSI.bold}${ANSI.cyan}  STRESS TEST SUMMARY                                                 ${ANSI.reset}`);
console.log(`${ANSI.bold}${ANSI.cyan}======================================================================${ANSI.reset}`);

const passed = testResults.filter(t => t.status === 'PASS').length;
const failed = testResults.filter(t => t.status === 'FAIL').length;
const total = testResults.length;

console.log(`  Total tests executed: ${total}`);
console.log(`  ${ANSI.green}Passed: ${passed}${ANSI.reset}`);
if (failed > 0) {
  console.log(`  ${ANSI.red}Failed: ${failed}${ANSI.reset}`);
  console.log(`\nFailures:`);
  testResults.filter(t => t.status === 'FAIL').forEach(f => {
    console.log(`  - [${f.suite}] ${f.name}: ${f.error}`);
  });
} else {
  console.log(`  ${ANSI.green}${ANSI.bold}ALL STRESS TESTS PASSED EMPIRICALLY!${ANSI.reset}`);
}
console.log(`${ANSI.bold}${ANSI.cyan}======================================================================${ANSI.reset}\n`);

if (failed > 0) {
  process.exit(1);
}
