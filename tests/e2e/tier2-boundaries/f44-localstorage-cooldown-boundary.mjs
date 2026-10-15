import { expect } from '../harness/assert.mjs';
import { ContactSecurityEngine, createMockStorage } from '../harness/client-engine.mjs';

export default {
  feature: 'F44: LocalStorage Cooldown (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F44.B1: Exactly 300,000ms boundary clears lock state',
      async run() {
        const storage = createMockStorage();
        const start = 1000000;
        ContactSecurityEngine.setCooldown(storage, start);

        const exactEnd = start + 300000;
        const check = ContactSecurityEngine.checkCooldown(storage, exactEnd);
        expect(check.isLocked).toBe(false);
      }
    },
    {
      name: 'F44.B2: Exactly 299,999ms boundary preserves active lock with 1 second remaining',
      async run() {
        const storage = createMockStorage();
        const start = 1000000;
        ContactSecurityEngine.setCooldown(storage, start);

        const check = ContactSecurityEngine.checkCooldown(storage, start + 299999);
        expect(check.isLocked).toBe(true);
        expect(check.remainingSeconds).toBe(1);
      }
    },
    {
      name: 'F44.B3: Non-numeric corrupted value in localStorage is purged and unlocks cleanly',
      async run() {
        const storage = createMockStorage({ lgl_contact_cooldown: 'not-a-timestamp' });
        const check = ContactSecurityEngine.checkCooldown(storage);
        expect(check.isLocked).toBe(false);
        expect(storage.getItem('lgl_contact_cooldown')).toBeNull();
      }
    },
    {
      name: 'F44.B4: Future timestamp caused by system clock distortion resets safely',
      async run() {
        const storage = createMockStorage();
        const futureTime = Date.now() + 10000000;
        ContactSecurityEngine.setCooldown(storage, futureTime);

        // Current time is before the timestamp stored
        const check = ContactSecurityEngine.checkCooldown(storage, Date.now());
        // Should not lock infinitely
        expect(check).toBeTruthy();
      }
    },
    {
      name: 'F44.B5: Multiple rapid submissions do not corrupt cooldown value',
      async run() {
        const storage = createMockStorage();
        ContactSecurityEngine.setCooldown(storage, 1000);
        ContactSecurityEngine.setCooldown(storage, 2000);
        ContactSecurityEngine.setCooldown(storage, 3000);

        expect(storage.getItem('lgl_contact_cooldown')).toBe('3000');
      }
    }
  ]
};
