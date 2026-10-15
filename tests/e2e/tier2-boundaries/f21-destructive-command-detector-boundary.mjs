import { expect } from '../harness/assert.mjs';
import { TerminalGuardEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F21: Destructive Command Detection (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F21.B1: Flags rm with flags reordered (rm -fr /, rm -rf ./, rm -rf *)',
      async run() {
        const frRoot = TerminalGuardEngine.checkDestructive('rm -fr /');
        expect(frRoot.isDestructive).toBe(true);
        expect(frRoot.riskLevel).toBe('critical');

        const rfDot = TerminalGuardEngine.checkDestructive('rm -rf ./');
        expect(rfDot.isDestructive).toBe(true);

        const verboseRf = TerminalGuardEngine.checkDestructive('rm --recursive --force /');
        expect(verboseRf.isDestructive).toBe(true);
      }
    },
    {
      name: 'F21.B2: Detects chmod -R 777 / and chmod --recursive 0777 / as critical',
      async run() {
        const chmod1 = TerminalGuardEngine.checkDestructive('chmod -R 777 /');
        expect(chmod1.isDestructive).toBe(true);
        expect(chmod1.riskLevel).toBe('critical');

        const chmod2 = TerminalGuardEngine.checkDestructive('chmod --recursive 0777 /');
        expect(chmod2.isDestructive).toBe(true);
      }
    },
    {
      name: 'F21.B3: Detects classic fork-bomb :(){ :|:& };: as critical',
      async run() {
        const forkBomb = TerminalGuardEngine.checkDestructive(':(){ :|:& };:');
        expect(forkBomb.isDestructive).toBe(true);
        expect(forkBomb.riskLevel).toBe('critical');
      }
    },
    {
      name: 'F21.B4: Does not flag safe rm on temporary files (rm /tmp/test.txt)',
      async run() {
        const safeRm = TerminalGuardEngine.checkDestructive('rm /tmp/test.txt');
        expect(safeRm.isDestructive).toBe(false);

        const safeRmWildcard = TerminalGuardEngine.checkDestructive('rm /tmp/*.log');
        expect(safeRmWildcard.isDestructive).toBe(false);
      }
    },
    {
      name: 'F21.B5: Does not flag dd with output to regular file (dd if=/dev/urandom of=key.bin)',
      async run() {
        const safeDd = TerminalGuardEngine.checkDestructive('dd if=/dev/urandom of=key.bin bs=32 count=1');
        expect(safeDd.isDestructive).toBe(false);
      }
    }
  ]
};
