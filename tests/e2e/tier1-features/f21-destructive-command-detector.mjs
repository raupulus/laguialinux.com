import { expect } from '../harness/assert.mjs';
import { TerminalGuardEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F21: Destructive Command Detection (rm -rf, dd, mkfs, fdisk)',
  tier: 1,
  tests: [
    {
      name: 'F21.1: Flags rm -rf / and rm -rf * as critical destructive operations',
      async run() {
        const rootRm = TerminalGuardEngine.checkDestructive('rm -rf /');
        expect(rootRm.isDestructive).toBe(true);
        expect(rootRm.riskLevel).toBe('critical');

        const starRm = TerminalGuardEngine.checkDestructive('rm -rf *');
        expect(starRm.isDestructive).toBe(true);
        expect(starRm.riskLevel).toBe('critical');
      }
    },
    {
      name: 'F21.2: Flags dd writing directly to block device (/dev/sda, /dev/nvme0n1) as critical',
      async run() {
        const ddSda = TerminalGuardEngine.checkDestructive('dd if=/dev/zero of=/dev/sda bs=1M count=100');
        expect(ddSda.isDestructive).toBe(true);
        expect(ddSda.riskLevel).toBe('critical');

        const ddNvme = TerminalGuardEngine.checkDestructive('dd if=archlinux.iso of=/dev/nvme0n1 status=progress');
        expect(ddNvme.isDestructive).toBe(true);
        expect(ddNvme.riskLevel).toBe('critical');
      }
    },
    {
      name: 'F21.3: Flags mkfs and mkswap formatting disk partitions as critical',
      async run() {
        const mkfsCmd = TerminalGuardEngine.checkDestructive('mkfs.ext4 -L Datos /dev/sdb1');
        expect(mkfsCmd.isDestructive).toBe(true);
        expect(mkfsCmd.riskLevel).toBe('critical');

        const mkswapCmd = TerminalGuardEngine.checkDestructive('mkswap /dev/nvme0n1p3');
        expect(mkswapCmd.isDestructive).toBe(true);
        expect(mkswapCmd.riskLevel).toBe('critical');
      }
    },
    {
      name: 'F21.4: Flags partition table manipulation with fdisk /dev/sdb or parted as dangerous',
      async run() {
        const fdiskCmd = TerminalGuardEngine.checkDestructive('fdisk /dev/sdb');
        expect(fdiskCmd.isDestructive).toBe(true);
        expect(fdiskCmd.riskLevel).toBe('danger');

        const wipefsCmd = TerminalGuardEngine.checkDestructive('wipefs -a /dev/sdc');
        expect(wipefsCmd.isDestructive).toBe(true);
        expect(wipefsCmd.riskLevel).toBe('danger');
      }
    },
    {
      name: 'F21.5: Non-destructive safe commands (ls, cat, systemctl status) are flagged as isDestructive: false',
      async run() {
        const safe1 = TerminalGuardEngine.checkDestructive('ls -la /var/log');
        expect(safe1.isDestructive).toBe(false);

        const safe2 = TerminalGuardEngine.checkDestructive('systemctl status nginx');
        expect(safe2.isDestructive).toBe(false);

        const safe3 = TerminalGuardEngine.checkDestructive('cat /etc/os-release');
        expect(safe3.isDestructive).toBe(false);
      }
    }
  ]
};
