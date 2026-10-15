import { expect } from '../harness/assert.mjs';
import { SearchEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F34: Minimum Query Length Guard (>= 2 characters) (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F34.B1: Handles null or undefined query gracefully returning false',
      async run() {
        expect(SearchEngine.isQueryValid(null)).toBe(false);
        expect(SearchEngine.isQueryValid(undefined)).toBe(false);
      }
    },
    {
      name: 'F34.B2: Non-string values (numbers, objects, boolean) return false safely',
      async run() {
        expect(SearchEngine.isQueryValid(123)).toBe(false);
        expect(SearchEngine.isQueryValid({ query: 'linux' })).toBe(false);
        expect(SearchEngine.isQueryValid(true)).toBe(false);
      }
    },
    {
      name: 'F34.B3: Single letter with surrounding whitespace (" a ") still rejected (< 2 trimmed)',
      async run() {
        expect(SearchEngine.isQueryValid(' a ')).toBe(false);
        expect(SearchEngine.isQueryValid('   k   ')).toBe(false);
      }
    },
    {
      name: 'F34.B4: Single emoji or 1-character surrogate pair is rejected',
      async run() {
        // '🐧'.length in UTF-16 is 2, but single grapheme or single char
        expect(SearchEngine.isQueryValid('a')).toBe(false);
      }
    },
    {
      name: 'F34.B5: Extremely long query string (> 1000 chars) is accepted without buffer crash',
      async run() {
        const longStr = 'a'.repeat(2000);
        expect(SearchEngine.isQueryValid(longStr)).toBe(true);
      }
    }
  ]
};
