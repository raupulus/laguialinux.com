import { expect } from '../harness/assert.mjs';
import { ContactSecurityEngine, createMockStorage } from '../harness/client-engine.mjs';

export default {
  feature: 'F44: LocalStorage Cooldown (Layer 3 - 5 min / 300s)',
  tier: 1,
  tests: [
    {
      name: 'F44.1: Initial visit with no cooldown in storage allows immediate submission',
      async run() {
        const storage = createMockStorage();
        const check = ContactSecurityEngine.checkCooldown(storage);

        expect(check.isLocked).toBe(false);
        expect(check.remainingSeconds).toBe(0);
      }
    },
    {
      name: 'F44.2: Successful submission sets 5-minute cooldown in localStorage (lgl_contact_cooldown)',
      async run() {
        const storage = createMockStorage();
        const now = 1000000;
        ContactSecurityEngine.setCooldown(storage, now);

        expect(storage.getItem('lgl_contact_cooldown')).toBe('1000000');
      }
    },
    {
      name: 'F44.3: Active cooldown locks submission and computes remaining seconds accurately',
      async run() {
        const storage = createMockStorage();
        const submittedAt = 1000000;
        ContactSecurityEngine.setCooldown(storage, submittedAt);

        // 2 minutes (120s) later
        const current = submittedAt + 120000;
        const check = ContactSecurityEngine.checkCooldown(storage, current);

        expect(check.isLocked).toBe(true);
        expect(check.remainingMs).toBe(180000); // 300,000 - 120,000 = 180,000ms
        expect(check.remainingSeconds).toBe(180); // 3 minutes remaining
      }
    },
    {
      name: 'F44.4: Expired cooldown (>= 300s elapsed) automatically unlocks submission',
      async run() {
        const storage = createMockStorage();
        const submittedAt = 1000000;
        ContactSecurityEngine.setCooldown(storage, submittedAt);

        // 5 minutes and 1 second later
        const current = submittedAt + 301000;
        const check = ContactSecurityEngine.checkCooldown(storage, current);

        expect(check.isLocked).toBe(false);
        expect(check.remainingSeconds).toBe(0);
      }
    },
    {
      name: 'F44.5: Manual cooldown clearance removes localStorage item immediately',
      async run() {
        const storage = createMockStorage();
        ContactSecurityEngine.setCooldown(storage, 1000000);
        ContactSecurityEngine.clearCooldown(storage);

        const check = ContactSecurityEngine.checkCooldown(storage);
        expect(check.isLocked).toBe(false);
        expect(storage.getItem('lgl_contact_cooldown')).toBeNull();
      }
    }
  ]
};
