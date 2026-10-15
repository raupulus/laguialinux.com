import { expect } from '../harness/assert.mjs';
import { SearchEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F34: Minimum Query Length Guard (>= 2 characters)',
  tier: 1,
  tests: [
    {
      name: 'F34.1: Rejects empty query string ("")',
      async run() {
        expect(SearchEngine.isQueryValid('')).toBe(false);
      }
    },
    {
      name: 'F34.2: Rejects single-character query ("a", "x", "1")',
      async run() {
        expect(SearchEngine.isQueryValid('a')).toBe(false);
        expect(SearchEngine.isQueryValid('x')).toBe(false);
        expect(SearchEngine.isQueryValid('1')).toBe(false);
      }
    },
    {
      name: 'F34.3: Rejects strings composed exclusively of whitespace ("   ", "\\t\\n")',
      async run() {
        expect(SearchEngine.isQueryValid('   ')).toBe(false);
        expect(SearchEngine.isQueryValid('\t \n')).toBe(false);
      }
    },
    {
      name: 'F34.4: Accepts queries with exactly 2 characters ("ls", "rm", "ip")',
      async run() {
        expect(SearchEngine.isQueryValid('ls')).toBe(true);
        expect(SearchEngine.isQueryValid('rm')).toBe(true);
        expect(SearchEngine.isQueryValid('ip')).toBe(true);
      }
    },
    {
      name: 'F34.5: Accepts multi-character and multi-word queries ("tar xzvf", "systemctl")',
      async run() {
        expect(SearchEngine.isQueryValid('tar xzvf')).toBe(true);
        expect(SearchEngine.isQueryValid('systemctl')).toBe(true);
      }
    }
  ]
};
