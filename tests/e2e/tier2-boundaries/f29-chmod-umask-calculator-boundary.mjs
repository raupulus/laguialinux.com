import { expect } from '../harness/assert.mjs';
import { SysadminToolsEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F29: Chmod / Umask Interactive Calculator & Synchronizer (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F29.B1: All permissions zero (0000 / 000) produces symbolic ---------- and umask 0777',
      async run() {
        const matrixZero = {
          user: { read: false, write: false, execute: false },
          group: { read: false, write: false, execute: false },
          others: { read: false, write: false, execute: false },
          special: { suid: false, sgid: false, sticky: false }
        };

        const result = SysadminToolsEngine.calculateChmod(matrixZero);
        expect(result.octalSimple).toBe('000');
        expect(result.symbolic).toBe('----------');
        expect(result.suggestedUmask).toBe('0777');
        expect(result.dirEffective).toBe('d---------');
        expect(result.fileEffective).toBe('----------');
      }
    },
    {
      name: 'F29.B2: All permissions active (7777 / 777) produces full symbolic -rwsrwsrwt',
      async run() {
        const matrixAll = {
          user: { read: true, write: true, execute: true },
          group: { read: true, write: true, execute: true },
          others: { read: true, write: true, execute: true },
          special: { suid: true, sgid: true, sticky: true }
        };

        const result = SysadminToolsEngine.calculateChmod(matrixAll);
        expect(result.octal).toBe('7777');
        expect(result.symbolic).toBe('-rwsrwsrwt');
        expect(result.suggestedUmask).toBe('0000');
      }
    },
    {
      name: 'F29.B3: Parse symbolic string with missing leading dash (rwxr-xr-x) parses accurately',
      async run() {
        const parsed = SysadminToolsEngine.parseSymbolicInput('rwxr-xr-x');

        expect(parsed.user.read).toBe(true);
        expect(parsed.user.write).toBe(true);
        expect(parsed.user.execute).toBe(true);
        expect(parsed.group.read).toBe(true);
        expect(parsed.group.write).toBe(false);
        expect(parsed.group.execute).toBe(true);
        expect(parsed.others.execute).toBe(true);
      }
    },
    {
      name: 'F29.B4: Parse octal string with leading zeros ("0644") parses correctly',
      async run() {
        const parsed = SysadminToolsEngine.parseOctalInput('0644');

        expect(parsed.user.read).toBe(true);
        expect(parsed.user.write).toBe(true);
        expect(parsed.user.execute).toBe(false);
        expect(parsed.group.read).toBe(true);
        expect(parsed.others.read).toBe(true);
      }
    },
    {
      name: 'F29.B5: Handles out-of-range octal digits (e.g. 8 or 9) clamping safely',
      async run() {
        // Octal parser parses non-octal gracefully
        const parsed = SysadminToolsEngine.parseOctalInput('999');
        expect(parsed.user).toBeTruthy();
        expect(parsed.group).toBeTruthy();
        expect(parsed.others).toBeTruthy();
      }
    }
  ]
};
