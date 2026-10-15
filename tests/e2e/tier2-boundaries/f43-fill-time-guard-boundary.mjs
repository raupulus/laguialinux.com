import { expect } from '../harness/assert.mjs';
import { ContactSecurityEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F43: Fill Time Guard (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F43.B1: Exactly 3000ms elapsed boundary passes threshold (>= 3000ms)',
      async run() {
        const start = 10000;
        const end = 13000;
        const res = ContactSecurityEngine.validateFillTime(start, end, 3000);
        expect(res.isTooFast).toBe(false);
        expect(res.elapsedMs).toBe(3000);
      }
    },
    {
      name: 'F43.B2: Exactly 2999ms elapsed boundary is flagged as too fast (< 3000ms)',
      async run() {
        const start = 10000;
        const end = 12999;
        const res = ContactSecurityEngine.validateFillTime(start, end, 3000);
        expect(res.isTooFast).toBe(true);
        expect(res.elapsedMs).toBe(2999);
      }
    },
    {
      name: 'F43.B3: Negative elapsed time (system clock backwards skew) safely rejected as invalid',
      async run() {
        const start = 10000;
        const end = 9000; // clock drifted backwards
        const res = ContactSecurityEngine.validateFillTime(start, end, 3000);
        expect(res.isTooFast).toBe(true);
        expect(res.elapsedMs).toBe(-1000);
      }
    },
    {
      name: 'F43.B4: User taking long time (e.g. 1 hour) passes without false positive',
      async run() {
        const start = 10000;
        const end = 10000 + 3600000; // 1 hour
        const res = ContactSecurityEngine.validateFillTime(start, end, 3000);
        expect(res.isTooFast).toBe(false);
      }
    },
    {
      name: 'F43.B5: Missing timestamps safely treated as invalid/too fast',
      async run() {
        const res = ContactSecurityEngine.validateFillTime(0, 0, 3000);
        expect(res.isTooFast).toBe(true);
      }
    }
  ]
};
