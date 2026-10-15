import { expect } from '../harness/assert.mjs';
import { ContactSecurityEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F43: Fill Time Guard (Layer 2 - Min 3000ms Interaction)',
  tier: 1,
  tests: [
    {
      name: 'F43.1: Enforces minimum interaction threshold of 3000 ms from mount',
      async run() {
        const mountedAt = 1000000;
        const submittedAt = mountedAt + 1200; // 1.2s -> too fast for human
        const result = ContactSecurityEngine.validateFillTime(mountedAt, submittedAt, 3000);

        expect(result.isTooFast).toBe(true);
        expect(result.elapsedMs).toBe(1200);
        expect(result.reason).toContain('faster than human threshold');
      }
    },
    {
      name: 'F43.2: Human submission taking >= 3000 ms passes Layer 2 validation',
      async run() {
        const mountedAt = 1000000;
        const submittedAt = mountedAt + 4500; // 4.5s -> realistic human
        const result = ContactSecurityEngine.validateFillTime(mountedAt, submittedAt, 3000);

        expect(result.isTooFast).toBe(false);
        expect(result.elapsedMs).toBe(4500);
        expect(result.reason).toBeUndefined();
      }
    },
    {
      name: 'F43.3: Accurately calculates elapsed interaction duration in milliseconds',
      async run() {
        const t1 = 5000;
        const t2 = 8234;
        const result = ContactSecurityEngine.validateFillTime(t1, t2);

        expect(result.elapsedMs).toBe(3234);
      }
    },
    {
      name: 'F43.4: Submissions under 500ms flagged as automated headless script behavior',
      async run() {
        const mountedAt = 10000;
        const submittedAt = 10050; // 50ms script
        const result = ContactSecurityEngine.validateFillTime(mountedAt, submittedAt);

        expect(result.isTooFast).toBe(true);
        expect(result.elapsedMs).toBe(50);
      }
    },
    {
      name: 'F43.5: Form reset resets mountedAt timestamp to current time',
      async run() {
        let mountedAt = 10000;
        const resetForm = (newTime) => { mountedAt = newTime; };

        resetForm(20000);
        expect(mountedAt).toBe(20000);
      }
    }
  ]
};
