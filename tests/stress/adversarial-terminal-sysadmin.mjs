/**
 * tests/stress/adversarial-terminal-sysadmin.mjs
 * Comprehensive Adversarial & Empirical Stress Harness for:
 * - utils/terminalGuard.ts
 * - utils/sysadminTools.ts
 *
 * Executed by Challenger M2-2 (Terminal Guard & Sysadmin Algorithms Adversarial Challenger).
 */

import {
  stripCliPrompts,
  isDestructiveCommand,
  formatCommand,
  COMMON_CLI_COMMANDS,
  DESTRUCTIVE_COMMAND_PATTERNS
} from '../../utils/terminalGuard.ts';

import {
  calculateChmod,
  octalToMatrix,
  symbolicToMatrix,
  tripletToOctal,
  octalToTriplet,
  validateCronField,
  parseCronExpression,
  humanizeCron,
  calculateNextCronRuns,
  searchEquivalences,
  EQUIVALENCES_DATABASE,
  evaluateDistroRecommendation,
  DISTRO_CATALOG
} from '../../utils/sysadminTools.ts';

const findings = [];
let passCount = 0;
let failCount = 0;

function assert(condition, testName, category, details = '') {
  if (condition) {
    passCount++;
    console.log(`  ✔ PASS [${category}]: ${testName}`);
  } else {
    failCount++;
    findings.push({ name: testName, category, details });
    console.error(`  ✖ BUG/FAILURE [${category}]: ${testName} -> ${details}`);
  }
}

console.log('======================================================================');
console.log('  CHALLENGER M2-2: ADVERSARIAL STRESS HARNESS & EMPIRICAL ORACLE      ');
console.log('======================================================================\n');

// ---------------------------------------------------------------------------
// SUITE 1: PROMPT STRIPPING & CLI FORMATTING
// ---------------------------------------------------------------------------
console.log('▶ SUITE 1: Terminal Prompt Stripper & Formatter Edge Cases');

// 1.1 Preserve comments
assert(
  stripCliPrompts('# esto es un comentario') === '# esto es un comentario',
  'Preserve Spanish comment starting with #',
  'PROMPT'
);
assert(
  stripCliPrompts('# Configurar cortafuegos antes de continuar') === '# Configurar cortafuegos antes de continuar',
  'Preserve multi-word Spanish comment',
  'PROMPT'
);
assert(
  stripCliPrompts('#!/bin/bash\n# Script de mantenimiento') === '#!/bin/bash\n# Script de mantenimiento',
  'Preserve shebang and header comment',
  'PROMPT'
);

// 1.2 Strip root commands
assert(
  stripCliPrompts('# apt update') === 'apt update',
  'Strip # when followed by apt',
  'PROMPT'
);
assert(
  stripCliPrompts('# systemctl restart nginx') === 'systemctl restart nginx',
  'Strip # when followed by systemctl',
  'PROMPT'
);
assert(
  stripCliPrompts('  # pacman -Syu') === '  pacman -Syu',
  'Strip # when indented with spaces',
  'PROMPT'
);

// 1.3 User prompts and complex prompts
assert(
  stripCliPrompts('user@host:~$ ls -la') === 'ls -la',
  'Strip user@host:~$',
  'PROMPT'
);
assert(
  stripCliPrompts('root@debian:/var/log# journalctl -xe') === 'journalctl -xe',
  'Strip root@debian:/var/log#',
  'PROMPT'
);
assert(
  stripCliPrompts('admin@prod-web-01.local:~/apps/v2.1$ ./start.sh') === './start.sh',
  'Strip complex hostname and path prompt',
  'PROMPT'
);

// 1.4 Multiline prompts
const multiPrompt = '$ echo 1\n$ echo 2\n$ echo 3';
assert(
  stripCliPrompts(multiPrompt) === 'echo 1\necho 2\necho 3',
  'Strip multiline $ prompts',
  'PROMPT'
);

// 1.5 Python REPL prompt
assert(
  stripCliPrompts('>>> print("hello world")\n>>> exit()') === 'print("hello world")\nexit()',
  'Strip Python >>> REPL prompt',
  'PROMPT'
);

// 1.6 Inline $ and # preservation
assert(
  stripCliPrompts('echo "$HOME" # esto es inline') === 'echo "$HOME" # esto es inline',
  'Preserve internal $ and inline comment on same line',
  'PROMPT'
);

// 1.7 FormatCommand modes
const scriptToFormat = '# Actualizar paquetes\n# apt update\napt install -y nginx\n\n# Verificar estado\nsystemctl status nginx';
const cleanOut = formatCommand(scriptToFormat, 'clean');
assert(
  cleanOut.includes('apt update') && cleanOut.includes('# Actualizar paquetes'),
  'formatCommand clean mode un-prompts root command and keeps comment',
  'PROMPT'
);

const sudoOut = formatCommand(scriptToFormat, 'sudo');
assert(
  sudoOut.includes('sudo apt update') &&
  sudoOut.includes('sudo apt install -y nginx') &&
  sudoOut.includes('# Actualizar paquetes') &&
  !sudoOut.includes('sudo # Actualizar paquetes'),
  'formatCommand sudo mode prepends sudo only to executable lines',
  'PROMPT'
);

const singleOut = formatCommand(scriptToFormat, 'single-line');
assert(
  singleOut === 'apt update && apt install -y nginx && systemctl status nginx',
  'formatCommand single-line mode omits comments/blanks and joins with &&',
  'PROMPT',
  `Actual: ${singleOut}`
);

// ---------------------------------------------------------------------------
// SUITE 2: DESTRUCTIVE COMMAND DETECTION & FALSE POSITIVE RESISTANCE
// ---------------------------------------------------------------------------
console.log('\n▶ SUITE 2: Destructive Command Detection & False Positive Resistance');

const trueDestructiveCases = [
  { cmd: 'rm -rf /', reason: 'rm -rf root' },
  { cmd: 'rm -rf /*', reason: 'rm -rf root glob' },
  { cmd: 'sudo rm -rf /', reason: 'sudo rm -rf root' },
  { cmd: 'rm -fr /', reason: 'rm -fr root' },
  { cmd: 'rm -r -f /', reason: 'rm -r -f root' },
  { cmd: 'rm -f -r /', reason: 'rm -f -r root' },
  { cmd: 'rm --recursive --force /', reason: 'rm long flags root' },
  { cmd: 'rm --force --recursive /', reason: 'rm long flags reversed root' },
  { cmd: 'rm -rf .', reason: 'rm -rf current dir' },
  { cmd: 'rm -rf *', reason: 'rm -rf all in current dir' },
  { cmd: 'rm -rf ./', reason: 'rm -rf dot-slash' },
  { cmd: 'mkfs.ext4 /dev/sda1', reason: 'mkfs ext4 on sda1' },
  { cmd: 'mkfs.xfs -f /dev/nvme0n1p1', reason: 'mkfs xfs on nvme partition' },
  { cmd: 'mkswap /dev/sda2', reason: 'mkswap on partition' },
  { cmd: 'dd if=/dev/zero of=/dev/sda', reason: 'dd zero to sda' },
  { cmd: 'dd if=/dev/urandom of=/dev/nvme0n1', reason: 'dd urandom to nvme' },
  { cmd: 'dd if=/dev/zero of=/dev/vda', reason: 'dd zero to virtio disk' },
  { cmd: 'dd if=/dev/zero of=/dev/mapper/system-root', reason: 'dd zero to device mapper' },
  { cmd: 'chmod -R 777 /', reason: 'chmod -R 777 root' },
  { cmd: 'chmod -R 0777 /', reason: 'chmod -R 0777 root' },
  { cmd: 'chmod --recursive 777 /*', reason: 'chmod --recursive 777 root glob' },
  { cmd: ':(){ :|:& };:', reason: 'classic bash fork bomb' },
  { cmd: ': () { : | : & } ; :', reason: 'fork bomb with whitespace' },
  { cmd: 'wipefs -a /dev/sda', reason: 'wipefs all signatures' },
  { cmd: 'lvremove -f /dev/vg0/data', reason: 'lvremove force' },
  { cmd: 'vgremove -f vg0', reason: 'vgremove force' },
  { cmd: 'zpool destroy datapool', reason: 'zpool destroy' },
  { cmd: 'zfs destroy -r pool/dataset', reason: 'zfs destroy recursive' },
  { cmd: 'btrfs subvolume delete /mnt/subvol', reason: 'btrfs subvolume delete' },
  { cmd: 'shred -u -z -n 3 /dev/sda', reason: 'shred physical device' },
  { cmd: 'cat /dev/zero > /dev/sda', reason: 'direct redirect to raw disk' },
  { cmd: 'dd if=/dev/zero of=/dev/mmcblk0', reason: 'dd zero to mmcblk ARM/eMMC device' },
  { cmd: 'dd if=/dev/zero of=/dev/xvda', reason: 'dd zero to Xen virtual disk (AWS EC2)' }
];

for (const tc of trueDestructiveCases) {
  const check = isDestructiveCommand(tc.cmd);
  assert(
    check.isDestructive === true,
    `Detect destructive: ${tc.reason} (${tc.cmd})`,
    'DESTRUCTIVE',
    `Expected destructive=true, got ${check.isDestructive}`
  );
}

const safeCases = [
  { cmd: 'ls -la', reason: 'ls -la standard listing' },
  { cmd: 'ls -la /', reason: 'ls root directory' },
  { cmd: 'cat /etc/os-release', reason: 'read os-release' },
  { cmd: 'chmod +x script.sh', reason: 'chmod add execute bit to script' },
  { cmd: 'chmod 755 /var/www', reason: 'chmod 755 non-root dir' },
  { cmd: 'chmod -R 755 /var/www/html', reason: 'chmod -R 755 webroot' },
  { cmd: 'dd if=/dev/sda of=/home/user/backup.img', reason: 'dd backup to normal file' },
  { cmd: 'fdisk -l', reason: 'fdisk -l list all partitions' },
  { cmd: 'df -h /', reason: 'disk free inspection' },
  { cmd: 'du -sh /var/log', reason: 'disk usage inspection' },
  { cmd: 'systemctl restart nginx', reason: 'restart service' },
  { cmd: 'echo "rm -rf /"', reason: 'echo statement containing rm' },
  { cmd: '# rm -rf /', reason: 'commented out rm command' },
  { cmd: 'grep -rn "rm -rf" /var/log', reason: 'grep searching for string' },
  { cmd: 'touch /tmp/testfile', reason: 'touch temp file' }
];

for (const sc of safeCases) {
  const check = isDestructiveCommand(sc.cmd);
  assert(
    check.isDestructive === false,
    `Reject false positive: ${sc.reason} (${sc.cmd})`,
    'SAFE_CMD',
    `Expected destructive=false, got ${check.isDestructive} (risk: ${check.riskLevel}, reason: ${check.reason})`
  );
}

// ---------------------------------------------------------------------------
// SUITE 3: CHMOD & UMASK ALGORITHMS & PERMISSION MATRIX
// ---------------------------------------------------------------------------
console.log('\n▶ SUITE 3: Chmod / Umask Matrix & Edge Cases');

// 3.1 Octal 0000 (all off)
{
  const mat0 = octalToMatrix('0000');
  const res0 = calculateChmod(mat0);
  assert(res0.octal3 === '000', '0000 octal3 is 000', 'CHMOD');
  assert(res0.octal4 === '0000', '0000 octal4 is 0000', 'CHMOD');
  assert(res0.symbolic === '----------', '0000 symbolic is ----------', 'CHMOD');
  assert(res0.suggestedUmask === '0777', '0000 suggested umask is 0777', 'CHMOD');
  assert(res0.dirEffective === 'd---------', '0000 dirEffective is d---------', 'CHMOD');
  assert(res0.fileEffective === '----------', '0000 fileEffective is ----------', 'CHMOD');
}

// 3.2 Octal 0777 (all on)
{
  const mat777 = octalToMatrix('0777');
  const res777 = calculateChmod(mat777);
  assert(res777.octal3 === '777', '0777 octal3 is 777', 'CHMOD');
  assert(res777.octal4 === '0777', '0777 octal4 is 0777', 'CHMOD');
  assert(res777.symbolic === '-rwxrwxrwx', '0777 symbolic is -rwxrwxrwx', 'CHMOD');
  assert(res777.suggestedUmask === '0000', '0777 suggested umask is 0000', 'CHMOD');
  assert(res777.dirEffective === 'drwxrwxrwx', '0777 dirEffective is drwxrwxrwx', 'CHMOD');
  assert(res777.fileEffective === '-rw-rw-rw-', '0777 fileEffective is -rw-rw-rw-', 'CHMOD');
  assert(res777.securityWarning !== null, '0777 produces security warning', 'CHMOD');
}

// 3.3 Octal 0755 (standard binary/script)
{
  const mat755 = octalToMatrix('0755');
  const res755 = calculateChmod(mat755);
  assert(res755.octal3 === '755', '0755 octal3 is 755', 'CHMOD');
  assert(res755.octal4 === '0755', '0755 octal4 is 0755', 'CHMOD');
  assert(res755.symbolic === '-rwxr-xr-x', '0755 symbolic is -rwxr-xr-x', 'CHMOD');
  assert(res755.suggestedUmask === '0022', '0755 suggested umask is 0022', 'CHMOD');
  assert(res755.dirEffective === 'drwxr-xr-x', '0755 dirEffective is drwxr-xr-x', 'CHMOD');
  assert(res755.fileEffective === '-rw-r--r--', '0755 fileEffective is -rw-r--r--', 'CHMOD');
  assert(
    res755.securityWarning === null,
    '0755 has no security warning (Others only has read/execute, no write)',
    'CHMOD_BUG',
    `Found false positive warning: "${res755.securityWarning}"`
  );
}

// 3.3b Octal 0644 (standard file)
{
  const mat644 = octalToMatrix('0644');
  const res644 = calculateChmod(mat644);
  assert(
    res644.securityWarning === null,
    '0644 has no security warning (Others only has read, no write)',
    'CHMOD_BUG',
    `Found false positive warning: "${res644.securityWarning}"`
  );
}

// 3.4 SUID (4755)
{
  const mat4755 = octalToMatrix('4755');
  const res4755 = calculateChmod(mat4755);
  assert(res4755.octal3 === '755', '4755 octal3 is 755', 'CHMOD');
  assert(res4755.octal4 === '4755', '4755 octal4 is 4755', 'CHMOD');
  assert(res4755.symbolic === '-rwsr-xr-x', '4755 symbolic has s for user execute', 'CHMOD', `Actual: ${res4755.symbolic}`);
}

// 3.4b SUID with group write (4775)
{
  const mat4775 = octalToMatrix('4775');
  const res4775 = calculateChmod(mat4775);
  assert(
    res4775.securityWarning?.includes('Alerta SUID'),
    '4775 triggers SUID privilege escalation alert rather than false Others write warning',
    'CHMOD_BUG',
    `Actual warning: "${res4775.securityWarning}"`
  );
}

// 3.5 SGID (2755)
{
  const mat2755 = octalToMatrix('2755');
  const res2755 = calculateChmod(mat2755);
  assert(res2755.octal3 === '755', '2755 octal3 is 755', 'CHMOD');
  assert(res2755.octal4 === '2755', '2755 octal4 is 2755', 'CHMOD');
  assert(res2755.symbolic === '-rwxr-sr-x', '2755 symbolic has s for group execute', 'CHMOD', `Actual: ${res2755.symbolic}`);
}

// 3.6 Sticky Bit (1777)
{
  const mat1777 = octalToMatrix('1777');
  const res1777 = calculateChmod(mat1777);
  assert(res1777.octal3 === '777', '1777 octal3 is 777', 'CHMOD');
  assert(res1777.octal4 === '1777', '1777 octal4 is 1777', 'CHMOD');
  assert(res1777.symbolic === '-rwxrwxrwt', '1777 symbolic has t for others execute', 'CHMOD', `Actual: ${res1777.symbolic}`);
}

// 3.7 Inverted permissions: umask 0022 vs 0027
{
  const res0750 = calculateChmod(octalToMatrix('0750'));
  assert(res0750.suggestedUmask === '0027', '0750 yields suggested umask 0027', 'UMASK');
  assert(res0750.dirEffective === 'drwxr-x---', '0750 dirEffective is drwxr-x---', 'UMASK');
  assert(res0750.fileEffective === '-rw-r-----', '0750 fileEffective is -rw-r-----', 'UMASK');
}

// 3.8 Symbolic to Matrix conversions
{
  const sym1 = symbolicToMatrix('-rwxr-xr-x');
  const calc1 = calculateChmod(sym1);
  assert(calc1.octal3 === '755' && calc1.octal4 === '0755', '-rwxr-xr-x converts back to 0755', 'SYMBOLIC');

  const sym2 = symbolicToMatrix('drwxrwxrwt');
  const calc2 = calculateChmod(sym2);
  assert(calc2.octal4 === '1777', 'drwxrwxrwt converts back to 1777', 'SYMBOLIC');

  const sym3 = symbolicToMatrix('-rwsr-xr-x');
  const calc3 = calculateChmod(sym3);
  assert(calc3.octal4 === '4755', '-rwsr-xr-x converts back to 4755', 'SYMBOLIC');

  const sym4 = symbolicToMatrix('-rwxr-sr-x');
  const calc4 = calculateChmod(sym4);
  assert(calc4.octal4 === '2755', '-rwxr-sr-x converts back to 2755', 'SYMBOLIC');
}

// ---------------------------------------------------------------------------
// SUITE 4: CRONTAB PARSER, VALIDATOR & MONOTONIC RUNS
// ---------------------------------------------------------------------------
console.log('\n▶ SUITE 4: Crontab Parser, Validator & Next Runs Monotonicity');

// 4.1 Dispatch required expressions
const cronRequired = ['*/5 * * * *', '1,15,30 * * * *', '0 9-17 * * 1-5'];

for (const expr of cronRequired) {
  const p = parseCronExpression(expr);
  assert(p.isValid === true, `Parse valid cron: ${expr}`, 'CRON');
  assert(p.nextRuns.length === 5, `Next runs count is 5 for: ${expr}`, 'CRON');

  let monotonic = true;
  for (let i = 1; i < p.nextRuns.length; i++) {
    if (p.nextRuns[i].getTime() <= p.nextRuns[i - 1].getTime()) {
      monotonic = false;
      break;
    }
  }
  assert(monotonic, `Next 5 runs strictly monotonically increasing for: ${expr}`, 'CRON_MONOTONIC');
}

// 4.2 Invalid syntax test cases
const invalidCrons = [
  { expr: '* * * * * *', reason: '6 fields' },
  { expr: '* * * *', reason: '4 fields' },
  { expr: '60 * * * *', reason: 'minute 60' },
  { expr: '* 24 * * *', reason: 'hour 24' },
  { expr: '* * 32 * *', reason: 'day of month 32' },
  { expr: '* * * 13 *', reason: 'month 13' },
  { expr: '* * * * 8', reason: 'day of week 8' },
  { expr: '*/0 * * * *', reason: 'step 0' }
];

for (const inv of invalidCrons) {
  const p = parseCronExpression(inv.expr);
  assert(
    p.isValid === false,
    `Reject invalid cron (${inv.reason}): ${inv.expr}`,
    'CRON_INVALID',
    `Expected isValid=false, got ${p.isValid}`
  );
  assert(
    p.errors.length > 0,
    `Errors array populated for (${inv.reason}): ${inv.expr}`,
    'CRON_INVALID'
  );
  assert(
    p.nextRuns.length === 0,
    `Next runs empty for invalid cron (${inv.reason}): ${inv.expr}`,
    'CRON_INVALID'
  );
}

// 4.2b Cron field strict numeric validation
assert(
  validateCronField('1abc', 0, 59) === false,
  'validateCronField rejects alphanumeric contamination ("1abc")',
  'CRON_STRICTNESS',
  'validateCronField("1abc") returned true due to parseInt behavior'
);

// 4.3 Deep monotonicity verification: from fixed epoch
{
  const fixedEpoch = new Date('2026-10-12T12:00:00.000Z');
  const complexExpressions = [
    '0 0 * * *',          // Daily midnight
    '30 2 1 * *',         // Monthly 1st at 02:30
    '0 12 * * 0',         // Weekly Sundays at noon
    '*/10 8-18 * * 1-5',  // Every 10 min during business hours
    '59 23 28-31 * *'     // End of month runs
  ];

  for (const expr of complexExpressions) {
    const runs = calculateNextCronRuns(expr, 10, fixedEpoch);
    assert(runs.length === 10, `calculateNextCronRuns returns 10 dates for: ${expr}`, 'CRON_FUTURE');
    assert(runs[0].getTime() > fixedEpoch.getTime(), `First run is in future for: ${expr}`, 'CRON_FUTURE');

    let strictlyIncreasing = true;
    for (let i = 1; i < runs.length; i++) {
      if (runs[i].getTime() <= runs[i - 1].getTime()) {
        strictlyIncreasing = false;
        break;
      }
    }
    assert(strictlyIncreasing, `Runs strictly monotonic for complex expression: ${expr}`, 'CRON_MONOTONIC');
  }
}

// ---------------------------------------------------------------------------
// SUITE 5: SOFTWARE EQUIVALENCES & DISTRO FINDER QUIZ
// ---------------------------------------------------------------------------
console.log('\n▶ SUITE 5: Distro Finder & Software Equivalences');

// 5.1 Equivalences edge cases
assert(
  searchEquivalences('').length === EQUIVALENCES_DATABASE.length,
  'searchEquivalences empty query returns entire database',
  'EQUIV'
);
assert(
  searchEquivalences('   ').length === EQUIVALENCES_DATABASE.length,
  'searchEquivalences whitespace query returns entire database',
  'EQUIV'
);
assert(
  searchEquivalences('.*+?^${}()|[]\\').length === 0,
  'searchEquivalences special regex characters handled safely without throwing',
  'EQUIV'
);
assert(
  searchEquivalences('photoshop').length === 1 && searchEquivalences('photoshop')[0].id === 'eq-photoshop',
  'searchEquivalences finds photoshop regardless of case',
  'EQUIV'
);
assert(
  searchEquivalences('FOTOGRAFICO').length >= 1,
  'searchEquivalences searches normalized description without accents',
  'EQUIV'
);
assert(
  searchEquivalences('', 'Ofimática').length === 1,
  'searchEquivalences filters by category Ofimática',
  'EQUIV'
);

// 5.2 Distro Finder 108 combinations exhaustive test
const hardwares = ['legacy', 'standard', 'modern'];
const experiences = ['novice', 'intermediate', 'sysadmin'];
const purposes = ['desktop', 'development', 'gaming', 'server'];
const updateCycles = ['stable', 'rolling', 'immutable'];

let distroQuizPass = true;
let distroComboCount = 0;

for (const h of hardwares) {
  for (const e of experiences) {
    for (const p of purposes) {
      for (const u of updateCycles) {
        distroComboCount++;
        const rec = evaluateDistroRecommendation({ hardware: h, experience: e, purpose: p, updateCycle: u });
        if (
          !rec.primary ||
          !rec.secondary ||
          rec.primary.distro.id === rec.secondary.distro.id ||
          isNaN(rec.primary.matchScore) ||
          isNaN(rec.secondary.matchScore) ||
          rec.primary.matchScore < 75 ||
          rec.primary.matchScore > 98 ||
          rec.secondary.matchScore < 75 ||
          rec.secondary.matchScore > 98 ||
          !rec.primary.reason ||
          !rec.secondary.reason
        ) {
          distroQuizPass = false;
        }
      }
    }
  }
}

assert(
  distroComboCount === 108 && distroQuizPass,
  `All 108 Distro Quiz combinations produce valid, non-colliding primary/secondary distros with score 75-98%`,
  'DISTRO_QUIZ'
);

// ---------------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`  EXECUTION SUMMARY: ${passCount} PASSED, ${failCount} DEFECTS/FINDINGS`);
console.log('======================================================================\n');

if (findings.length > 0) {
  console.log('LIST OF EMPIRICAL DEFECTS FOUND:');
  findings.forEach((f, idx) => {
    console.log(`  [${idx + 1}] Category: ${f.category} | Test: ${f.name}`);
    console.log(`      Details: ${f.details}\n`);
  });
}
