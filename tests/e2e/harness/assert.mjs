import assert from 'node:assert';

/**
 * Custom assertions with clear failure diagnostics for E2E suites
 */
export const expect = (actual) => ({
  toBe(expected, message) {
    assert.strictEqual(actual, expected, message || `Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
  },
  toEqual(expected, message) {
    assert.deepStrictEqual(actual, expected, message || `Expected deep equality`);
  },
  toBeTruthy(message) {
    assert.ok(Boolean(actual), message || `Expected ${actual} to be truthy`);
  },
  toBeFalsy(message) {
    assert.ok(!actual, message || `Expected ${actual} to be falsy`);
  },
  toBeNull(message) {
    assert.strictEqual(actual, null, message || `Expected ${actual} to be null`);
  },
  toBeUndefined(message) {
    assert.strictEqual(actual, undefined, message || `Expected ${actual} to be undefined`);
  },
  toBeGreaterThan(expected, message) {
    assert.ok(actual > expected, message || `Expected ${actual} > ${expected}`);
  },
  toBeGreaterThanOrEqual(expected, message) {
    assert.ok(actual >= expected, message || `Expected ${actual} >= ${expected}`);
  },
  toBeLessThan(expected, message) {
    assert.ok(actual < expected, message || `Expected ${actual} < ${expected}`);
  },
  toBeLessThanOrEqual(expected, message) {
    assert.ok(actual <= expected, message || `Expected ${actual} <= ${expected}`);
  },
  toContain(item, message) {
    if (typeof actual === 'string' || Array.isArray(actual)) {
      assert.ok(actual.includes(item), message || `Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(item)}`);
    } else {
      assert.fail(`toContain target is not string or array`);
    }
  },
  toMatch(regex, message) {
    assert.ok(regex.test(String(actual)), message || `Expected ${actual} to match ${regex}`);
  },
  toHaveProperty(prop, message) {
    assert.ok(actual && Object.prototype.hasOwnProperty.call(actual, prop), message || `Expected object to have property ${prop}`);
  },
  toThrow(message) {
    let threw = false;
    try {
      if (typeof actual === 'function') actual();
    } catch {
      threw = true;
    }
    assert.ok(threw, message || `Expected function to throw`);
  },
  not: {
    toBe(expected, message) {
      assert.notStrictEqual(actual, expected, message || `Expected ${JSON.stringify(actual)} NOT to be ${JSON.stringify(expected)}`);
    },
    toEqual(expected, message) {
      assert.notDeepStrictEqual(actual, expected, message || `Expected NOT deep equality`);
    },
    toBeNull(message) {
      assert.notStrictEqual(actual, null, message || `Expected ${actual} NOT to be null`);
    },
    toBeUndefined(message) {
      assert.notStrictEqual(actual, undefined, message || `Expected ${actual} NOT to be undefined`);
    },
    toContain(item, message) {
      if (typeof actual === 'string' || Array.isArray(actual)) {
        assert.ok(!actual.includes(item), message || `Expected ${JSON.stringify(actual)} NOT to contain ${JSON.stringify(item)}`);
      } else {
        assert.fail(`toContain target is not string or array`);
      }
    },
    toThrow(message) {
      let threw = false;
      let caught = null;
      try {
        if (typeof actual === 'function') actual();
      } catch (err) {
        threw = true;
        caught = err;
      }
      assert.ok(!threw, message || `Expected function NOT to throw, but it threw: ${caught?.message}`);
    }
  }
});
