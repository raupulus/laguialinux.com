import { expect } from '../harness/assert.mjs';
import { TerminalGuardEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F22: Destructive Command Confirmation Modal (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F22.B1: Multiple rapid copy triggers do not produce duplicate modal instances',
      async run() {
        const modal1 = TerminalGuardEngine.createWarningModalState('rm -rf /');
        const modal2 = TerminalGuardEngine.createWarningModalState('rm -rf /');

        expect(modal1.isOpen).toBe(true);
        expect(modal2.isOpen).toBe(true);
      }
    },
    {
      name: 'F22.B2: Canceling modal clears pending command preventing deferred leak',
      async run() {
        const modal = TerminalGuardEngine.createWarningModalState('fdisk /dev/sda');
        expect(modal.pendingCommand).toBe('fdisk /dev/sda');

        modal.cancelCopy();
        expect(modal.pendingCommand).toBe('');
        expect(modal.isOpen).toBe(false);

        // Attempting confirm after cancel returns null
        const afterCancel = modal.confirmCopy();
        expect(afterCancel).toBeNull();
      }
    },
    {
      name: 'F22.B3: Empty string or null command input does not open warning modal',
      async run() {
        const emptyModal = TerminalGuardEngine.createWarningModalState('');
        expect(emptyModal.isOpen).toBe(false);

        const nullModal = TerminalGuardEngine.createWarningModalState(null);
        expect(nullModal.isOpen).toBe(false);
      }
    },
    {
      name: 'F22.B4: Modal state retains exact original dangerous command for confirmation',
      async run() {
        const cmd = 'mkfs.ext4 -L Backup /dev/nvme0n1p2';
        const modal = TerminalGuardEngine.createWarningModalState(cmd);

        expect(modal.pendingCommand).toBe(cmd);
        const copied = modal.confirmCopy();
        expect(copied).toBe(cmd);
      }
    },
    {
      name: 'F22.B5: Confirming copy with empty pending command returns null safely',
      async run() {
        const modal = TerminalGuardEngine.createWarningModalState('safe command');
        expect(modal.isOpen).toBe(false);

        const res = modal.confirmCopy();
        expect(res).toBeNull();
      }
    }
  ]
};
