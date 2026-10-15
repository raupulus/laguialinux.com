import { expect } from '../harness/assert.mjs';
import { TerminalGuardEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F22: Destructive Command Confirmation Modal',
  tier: 1,
  tests: [
    {
      name: 'F22.1: Intercepts copy action and opens confirmation modal when command is destructive',
      async run() {
        const modal = TerminalGuardEngine.createWarningModalState('rm -rf /');

        expect(modal.isOpen).toBe(true);
        expect(modal.pendingCommand).toBe('rm -rf /');
        expect(modal.detection.isDestructive).toBe(true);
        expect(modal.copiedText).toBeNull();
      }
    },
    {
      name: 'F22.2: Prevents clipboard write while modal is pending',
      async run() {
        const modal = TerminalGuardEngine.createWarningModalState('mkfs.ext4 /dev/sdb1');

        expect(modal.isOpen).toBe(true);
        expect(modal.copiedText).toBeNull();
      }
    },
    {
      name: 'F22.3: Canceling modal closes dialog and discards pending clipboard write',
      async run() {
        const modal = TerminalGuardEngine.createWarningModalState('dd if=/dev/zero of=/dev/sda');
        expect(modal.isOpen).toBe(true);

        modal.cancelCopy();

        expect(modal.isOpen).toBe(false);
        expect(modal.pendingCommand).toBe('');
        expect(modal.copiedText).toBeNull();
      }
    },
    {
      name: 'F22.4: Confirming modal writes dangerous command to clipboard and clears state',
      async run() {
        const modal = TerminalGuardEngine.createWarningModalState('wipefs -a /dev/sdb');
        expect(modal.isOpen).toBe(true);

        const result = modal.confirmCopy();

        expect(result).toBe('wipefs -a /dev/sdb');
        expect(modal.isOpen).toBe(false);
        expect(modal.copiedText).toBe('wipefs -a /dev/sdb');
        expect(modal.pendingCommand).toBe('');
      }
    },
    {
      name: 'F22.5: Safe command copies directly to clipboard without opening modal',
      async run() {
        const modal = TerminalGuardEngine.createWarningModalState('free -h');

        expect(modal.isOpen).toBe(false);
        expect(modal.copiedText).toBe('free -h');
      }
    }
  ]
};
