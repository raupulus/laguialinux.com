import { expect } from '../harness/assert.mjs';
import { SysadminToolsEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F29: Chmod / Umask Interactive Calculator & Synchronizer',
  tier: 1,
  tests: [
    {
      name: 'F29.1: Converts 3x3 permission matrix to standard octal string (0755, 0644)',
      async run() {
        const matrix755 = {
          user: { read: true, write: true, execute: true },
          group: { read: true, write: false, execute: true },
          others: { read: true, write: false, execute: true },
          special: { suid: false, sgid: false, sticky: false }
        };

        const result755 = SysadminToolsEngine.calculateChmod(matrix755);
        expect(result755.octal).toBe('0755');
        expect(result755.octalSimple).toBe('755');

        const matrix644 = {
          user: { read: true, write: true, execute: false },
          group: { read: true, write: false, execute: false },
          others: { read: true, write: false, execute: false },
          special: { suid: false, sgid: false, sticky: false }
        };

        const result644 = SysadminToolsEngine.calculateChmod(matrix644);
        expect(result644.octalSimple).toBe('644');
      }
    },
    {
      name: 'F29.2: Calculates symbolic representation with leading dash (-rwxr-xr-x)',
      async run() {
        const matrix755 = {
          user: { read: true, write: true, execute: true },
          group: { read: true, write: false, execute: true },
          others: { read: true, write: false, execute: true },
          special: { suid: false, sgid: false, sticky: false }
        };

        const result = SysadminToolsEngine.calculateChmod(matrix755);
        expect(result.symbolic).toBe('-rwxr-xr-x');
      }
    },
    {
      name: 'F29.3: Supports special bits SUID (4), SGID (2), and Sticky (1) with s/t flags',
      async run() {
        const suidMatrix = {
          user: { read: true, write: true, execute: true },
          group: { read: true, write: false, execute: true },
          others: { read: true, write: false, execute: true },
          special: { suid: true, sgid: false, sticky: false }
        };

        const suidResult = SysadminToolsEngine.calculateChmod(suidMatrix);
        expect(suidResult.octal).toBe('4755');
        expect(suidResult.symbolic).toBe('-rwsr-xr-x');

        const stickyMatrix = {
          user: { read: true, write: true, execute: true },
          group: { read: true, write: true, execute: true },
          others: { read: true, write: true, execute: true },
          special: { suid: false, sgid: false, sticky: true }
        };

        const stickyResult = SysadminToolsEngine.calculateChmod(stickyMatrix);
        expect(stickyResult.octal).toBe('1777');
        expect(stickyResult.symbolic).toBe('-rwxrwxrwt');
      }
    },
    {
      name: 'F29.4: Synchronizes octal input (e.g. 755) bidirectionally back to matrix checkboxes',
      async run() {
        const parsed = SysadminToolsEngine.parseOctalInput('755');

        expect(parsed.user.read).toBe(true);
        expect(parsed.user.write).toBe(true);
        expect(parsed.user.execute).toBe(true);
        expect(parsed.group.read).toBe(true);
        expect(parsed.group.write).toBe(false);
        expect(parsed.group.execute).toBe(true);
        expect(parsed.others.read).toBe(true);
        expect(parsed.others.write).toBe(false);
        expect(parsed.others.execute).toBe(true);
      }
    },
    {
      name: 'F29.5: Calculates suggested umask (0022) and effective directory/file bitwise permissions',
      async run() {
        const matrix755 = {
          user: { read: true, write: true, execute: true },
          group: { read: true, write: false, execute: true },
          others: { read: true, write: false, execute: true },
          special: { suid: false, sgid: false, sticky: false }
        };

        const result = SysadminToolsEngine.calculateChmod(matrix755);
        expect(result.suggestedUmask).toBe('0022');
        expect(result.dirEffective).toBe('drwxr-xr-x');
        expect(result.fileEffective).toBe('-rw-r--r--');
      }
    }
  ]
};
