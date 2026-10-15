/**
 * tests/stress/challenger-m2-it2-2-deep.mjs
 * Deep Empirical Adversarial Verification Suite
 * Authored by Challenger M2-IT2-2 (Terminal & Sysadmin Algorithms Adversarial Challenger)
 *
 * Verifies with 0 trust:
 * 1. calculateChmod(0755) returns securityWarning === null without false warnings
 * 2. calculateChmod(4775) cleanly triggers SUID escalation alert
 * 3. validateCronField('1abc') returns isValid: false
 * 4. Destructive detection catches dd if=/dev/zero of=/dev/mmcblk0 and dd if=/dev/zero of=/dev/xvda
 * 5. ReDoS resistance & catastrophic backtracking stress on long inputs
 * 6. All 512 base octals + special permissions matrix round-trips
 * 7. Whitelist boundary check (# cat vs # catalogar, # apt vs # apple)
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
  DISTRO_CATALOG,
  CHMOD_PRESETS,
  CRON_PRESETS
} from '../../utils/sysadminTools.ts';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureLog = [];

function check(condition, testName, category, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
  } else {
    failedTests++;
    failureLog.push({ testName, category, details });
    console.error(`  [FAIL] [${category}] ${testName} -> ${details}`);
  }
}

console.log('======================================================================');
console.log('  CHALLENGER M2-IT2-2: DEEP EMPIRICAL ADVERSARIAL ORACLE             ');
console.log('======================================================================\n');

// ---------------------------------------------------------------------------
// SECTION 1: MANDATORY DISPATCH CHALLENGES
// ---------------------------------------------------------------------------
console.log('▶ SECTION 1: Mandatory Dispatch Verifications');

// 1.1 calculateChmod(0755) returns securityWarning === null
{
  const mat0755 = octalToMatrix('0755');
  const res0755 = calculateChmod(mat0755);
  check(
    res0755.securityWarning === null,
    'calculateChmod(0755) returns securityWarning === null',
    'DISPATCH_REQ',
    `Expected null, got: "${res0755.securityWarning}"`
  );
  check(res0755.octal3 === '755', '0755 octal3 is 755', 'DISPATCH_REQ');
  check(res0755.octal4 === '0755', '0755 octal4 is 0755', 'DISPATCH_REQ');
  check(res0755.symbolic === '-rwxr-xr-x', '0755 symbolic is -rwxr-xr-x', 'DISPATCH_REQ');
  check(res0755.suggestedUmask === '0022', '0755 suggestedUmask is 0022', 'DISPATCH_REQ');
  check(res0755.dirEffective === 'drwxr-xr-x', '0755 dirEffective is drwxr-xr-x', 'DISPATCH_REQ');
  check(res0755.fileEffective === '-rw-r--r--', '0755 fileEffective is -rw-r--r--', 'DISPATCH_REQ');
}

// 1.1b calculateChmod(755) also returns securityWarning === null
{
  const mat755 = octalToMatrix('755');
  const res755 = calculateChmod(mat755);
  check(
    res755.securityWarning === null,
    'calculateChmod(755) returns securityWarning === null',
    'DISPATCH_REQ',
    `Expected null, got: "${res755.securityWarning}"`
  );
}

// 1.2 calculateChmod(4775) cleanly triggers SUID escalation alert
{
  const mat4775 = octalToMatrix('4775');
  const res4775 = calculateChmod(mat4775);
  check(
    res4775.securityWarning !== null && res4775.securityWarning.includes('Alerta SUID'),
    'calculateChmod(4775) cleanly triggers SUID escalation alert',
    'DISPATCH_REQ',
    `Expected warning containing "Alerta SUID", got: "${res4775.securityWarning}"`
  );
  check(res4775.octal3 === '775', '4775 octal3 is 775', 'DISPATCH_REQ');
  check(res4775.octal4 === '4775', '4775 octal4 is 4775', 'DISPATCH_REQ');
  check(res4775.symbolic === '-rwsrwxr-x', '4775 symbolic is -rwsrwxr-x', 'DISPATCH_REQ');
}

// 1.3 validateCronField('1abc') returns isValid: false
{
  const resultMinute = validateCronField('1abc', 0, 59);
  check(
    resultMinute === false,
    'validateCronField("1abc", 0, 59) returns false',
    'DISPATCH_REQ',
    `Expected false, got ${resultMinute}`
  );
  const resultHour = validateCronField('1abc', 0, 23);
  check(
    resultHour === false,
    'validateCronField("1abc", 0, 23) returns false',
    'DISPATCH_REQ',
    `Expected false, got ${resultHour}`
  );
  const resultDom = validateCronField('1abc', 1, 31);
  check(
    resultDom === false,
    'validateCronField("1abc", 1, 31) returns false',
    'DISPATCH_REQ',
    `Expected false, got ${resultDom}`
  );
  const resultMonth = validateCronField('1abc', 1, 12);
  check(
    resultMonth === false,
    'validateCronField("1abc", 1, 12) returns false',
    'DISPATCH_REQ',
    `Expected false, got ${resultMonth}`
  );
  const resultDow = validateCronField('1abc', 0, 7, true);
  check(
    resultDow === false,
    'validateCronField("1abc", 0, 7, true) returns false',
    'DISPATCH_REQ',
    `Expected false, got ${resultDow}`
  );

  const parsedExpression = parseCronExpression('1abc * * * *');
  check(
    parsedExpression.isValid === false,
    'parseCronExpression("1abc * * * *") returns isValid: false',
    'DISPATCH_REQ',
    `Expected isValid: false, got ${parsedExpression.isValid}`
  );
  check(
    parsedExpression.errors.length > 0 && parsedExpression.errors[0].includes('1abc'),
    'parseCronExpression error message identifies 1abc',
    'DISPATCH_REQ'
  );
}

// 1.4 Destructive detection catches dd with mmcblk0 and xvda
{
  const checkMmc = isDestructiveCommand('dd if=/dev/zero of=/dev/mmcblk0');
  check(
    checkMmc.isDestructive === true && checkMmc.riskLevel === 'critical',
    'Catches dd if=/dev/zero of=/dev/mmcblk0 as critical',
    'DISPATCH_REQ',
    `Expected destructive=true, riskLevel=critical. Got: ${JSON.stringify(checkMmc)}`
  );

  const checkMmcP = isDestructiveCommand('dd if=/dev/zero of=/dev/mmcblk0p1 bs=1M');
  check(
    checkMmcP.isDestructive === true && checkMmcP.riskLevel === 'critical',
    'Catches dd if=/dev/zero of=/dev/mmcblk0p1 with options',
    'DISPATCH_REQ',
    `Expected destructive=true, got: ${JSON.stringify(checkMmcP)}`
  );

  const checkXvda = isDestructiveCommand('dd if=/dev/zero of=/dev/xvda');
  check(
    checkXvda.isDestructive === true && checkXvda.riskLevel === 'critical',
    'Catches dd if=/dev/zero of=/dev/xvda as critical',
    'DISPATCH_REQ',
    `Expected destructive=true, riskLevel=critical. Got: ${JSON.stringify(checkXvda)}`
  );

  const checkXvdf = isDestructiveCommand('dd if=/dev/urandom of=/dev/xvdf1');
  check(
    checkXvdf.isDestructive === true && checkXvdf.riskLevel === 'critical',
    'Catches dd if=/dev/urandom of=/dev/xvdf1',
    'DISPATCH_REQ',
    `Expected destructive=true, got: ${JSON.stringify(checkXvdf)}`
  );
}

// ---------------------------------------------------------------------------
// SECTION 2: CHMOD EXHAUSTIVE ROUND-TRIP & BOUNDARY MATRIX
// ---------------------------------------------------------------------------
console.log('\n▶ SECTION 2: Chmod / Umask Exhaustive Combinatorial Matrix');

// Test all 512 standard 3-digit octals (000 to 777)
for (let u = 0; u <= 7; u++) {
  for (let g = 0; g <= 7; g++) {
    for (let o = 0; o <= 7; o++) {
      const octalStr = `${u}${g}${o}`;
      const mat = octalToMatrix(octalStr);
      const res = calculateChmod(mat);

      check(res.octal3 === octalStr, `Octal ${octalStr} round-trips octal3`, 'CHMOD_512');
      check(res.suggestedUmask === `0${7 - u}${7 - g}${7 - o}`, `Octal ${octalStr} umask correct`, 'CHMOD_512');

      // Security warning invariants
      if (u === 7 && g === 7 && o === 7) {
        check(res.securityWarning !== null && res.securityWarning.includes('Peligro (777)'), `Octal 777 has 777 warning`, 'CHMOD_SEC');
      } else if ((o & 2) !== 0) {
        check(res.securityWarning !== null && res.securityWarning.includes('Otros'), `Octal ${octalStr} warns on others write`, 'CHMOD_SEC');
      } else {
        check(res.securityWarning === null, `Octal ${octalStr} has no warning`, 'CHMOD_SEC');
      }

      // Symbolic reversibility
      const roundTripMat = symbolicToMatrix(res.symbolic);
      const roundTripRes = calculateChmod(roundTripMat);
      check(roundTripRes.octal3 === octalStr, `Octal ${octalStr} reversible via symbolic (${res.symbolic})`, 'CHMOD_ROUNDTRIP');
    }
  }
}

// Test special bit combinations (SUID, SGID, Sticky)
const specialCases = [
  { oct: '4755', expectSym: '-rwsr-xr-x', expectWarning: null, desc: 'SUID safe (no group/others write)' },
  { oct: '4775', expectSym: '-rwsrwxr-x', expectWarning: 'Alerta SUID', desc: 'SUID escalation (group write)' },
  { oct: '4757', expectSym: '-rwsr-xrwx', expectWarning: 'Alerta SUID', desc: 'SUID escalation (others write)' },
  { oct: '2755', expectSym: '-rwxr-sr-x', expectWarning: null, desc: 'SGID standard' },
  { oct: '2775', expectSym: '-rwxrwsr-x', expectWarning: null, desc: 'SGID collaborative group' },
  { oct: '1777', expectSym: '-rwxrwxrwt', expectWarning: 'Peligro (777)', desc: 'Sticky tmp directory (777 takes priority)' },
  { oct: '1755', expectSym: '-rwxr-xr-t', expectWarning: null, desc: 'Sticky with safe perms' },
  { oct: '6755', expectSym: '-rwsr-sr-x', expectWarning: null, desc: 'SUID + SGID safe' },
  { oct: '7755', expectSym: '-rwsr-sr-t', expectWarning: null, desc: 'SUID + SGID + Sticky safe' },
  { oct: '0000', expectSym: '----------', expectWarning: null, desc: 'Zero permissions' },
];

for (const sc of specialCases) {
  const mat = octalToMatrix(sc.oct);
  const res = calculateChmod(mat);
  check(res.symbolic === sc.expectSym, `Special octal ${sc.oct} symbolic (${res.symbolic} === ${sc.expectSym})`, 'CHMOD_SPECIAL');
  if (sc.expectWarning) {
    check(res.securityWarning !== null && res.securityWarning.includes(sc.expectWarning), `Special octal ${sc.oct} warning matches "${sc.expectWarning}"`, 'CHMOD_SPECIAL');
  } else {
    check(res.securityWarning === null, `Special octal ${sc.oct} has null warning (${sc.desc})`, 'CHMOD_SPECIAL', `Got: ${res.securityWarning}`);
  }
}

// Uppercase S and T in symbolic parser (when execute bit is NOT set)
{
  const matSuidNoExec = symbolicToMatrix('-rwSr-xr-x');
  check(matSuidNoExec.special.suid === true, 'Parse uppercase S as SUID true', 'SYMBOLIC_SPEC');
  check(matSuidNoExec.user.execute === false, 'Parse uppercase S as user.execute false', 'SYMBOLIC_SPEC');

  const matSgidNoExec = symbolicToMatrix('-rwxr-Sr-x');
  check(matSgidNoExec.special.sgid === true, 'Parse uppercase S in group as SGID true', 'SYMBOLIC_SPEC');
  check(matSgidNoExec.group.execute === false, 'Parse uppercase S in group as group.execute false', 'SYMBOLIC_SPEC');

  const matStickyNoExec = symbolicToMatrix('-rwxr-xr-T');
  check(matStickyNoExec.special.sticky === true, 'Parse uppercase T as Sticky true', 'SYMBOLIC_SPEC');
  check(matStickyNoExec.others.execute === false, 'Parse uppercase T as others.execute false', 'SYMBOLIC_SPEC');
}

// ---------------------------------------------------------------------------
// SECTION 3: CRON VALIDATOR ADVERSARIAL MATRIX & STRESS
// ---------------------------------------------------------------------------
console.log('\n▶ SECTION 3: Crontab Validator Adversarial Stress');

const cronAdversarialInputs = [
  // Alphanumeric injections
  { val: '1abc', min: 0, max: 59, valid: false },
  { val: 'abc', min: 0, max: 59, valid: false },
  { val: '0abc', min: 0, max: 59, valid: false },
  { val: 'abc1', min: 0, max: 59, valid: false },
  { val: '1-5abc', min: 0, max: 59, valid: false },
  { val: 'abc-5', min: 0, max: 59, valid: false },
  { val: '*/5abc', min: 0, max: 59, valid: false },
  { val: '5/abc', min: 0, max: 59, valid: false },
  { val: '1,2,abc', min: 0, max: 59, valid: false },
  { val: '1,,2', min: 0, max: 59, valid: false },
  { val: ',1', min: 0, max: 59, valid: false },
  { val: '1,', min: 0, max: 59, valid: false },

  // Boundaries & step errors
  { val: '*/0', min: 0, max: 59, valid: false },
  { val: '*/-1', min: 0, max: 59, valid: false },
  { val: '-1', min: 0, max: 59, valid: false },
  { val: '60', min: 0, max: 59, valid: false },
  { val: '24', min: 0, max: 23, valid: false },
  { val: '32', min: 1, max: 31, valid: false },
  { val: '0', min: 1, max: 31, valid: false },
  { val: '13', min: 1, max: 12, valid: false },
  { val: '0', min: 1, max: 12, valid: false },
  { val: '8', min: 0, max: 7, valid: false },
  { val: '5-2', min: 0, max: 59, valid: false }, // inverted range
  { val: '0-60', min: 0, max: 59, valid: false },
  { val: '', min: 0, max: 59, valid: false },
  { val: '   ', min: 0, max: 59, valid: false },

  // Valid complex patterns
  { val: '*', min: 0, max: 59, valid: true },
  { val: '0', min: 0, max: 59, valid: true },
  { val: '59', min: 0, max: 59, valid: true },
  { val: '0-59', min: 0, max: 59, valid: true },
  { val: '1,2,3,4,5', min: 0, max: 59, valid: true },
  { val: '*/10', min: 0, max: 59, valid: true },
  { val: '5-25/5', min: 0, max: 59, valid: true },
  { val: '0,15,30,45', min: 0, max: 59, valid: true },
  { val: '7', min: 0, max: 7, valid: true }, // Sunday
  { val: '0', min: 0, max: 7, valid: true }, // Sunday
];

for (const tc of cronAdversarialInputs) {
  const res = validateCronField(tc.val, tc.min, tc.max);
  check(
    res === tc.valid,
    `validateCronField("${tc.val}", ${tc.min}, ${tc.max}) === ${tc.valid}`,
    'CRON_FIELD',
    `Expected ${tc.valid}, got ${res}`
  );
}

// Verify all CRON_PRESETS parse cleanly
for (const p of CRON_PRESETS) {
  const parsed = parseCronExpression(p.expression);
  check(parsed.isValid === true, `Preset "${p.label}" (${p.expression}) is valid`, 'CRON_PRESETS');
  check(parsed.nextRuns.length === 5, `Preset "${p.label}" generates 5 next runs`, 'CRON_PRESETS');
}

// ---------------------------------------------------------------------------
// SECTION 4: TERMINAL GUARD DESTRUCTIVE REGEX & REDOS RESISTANCE
// ---------------------------------------------------------------------------
console.log('\n▶ SECTION 4: Terminal Guard Destructive & ReDoS Stress');

const destructiveDeviceMatrix = [
  // SATA / SCSI
  'dd if=/dev/zero of=/dev/sda',
  'dd if=/dev/urandom of=/dev/sdb2',
  'dd if=/dev/zero of=/dev/sdz9',
  // NVMe
  'dd if=/dev/zero of=/dev/nvme0n1',
  'dd if=/dev/zero of=/dev/nvme0n1p1',
  'dd if=/dev/urandom of=/dev/nvme1n2p3',
  // VirtIO / KVM
  'dd if=/dev/zero of=/dev/vda',
  'dd if=/dev/zero of=/dev/vdb2',
  // Xen / AWS EC2
  'dd if=/dev/zero of=/dev/xvda',
  'dd if=/dev/zero of=/dev/xvda1',
  'dd if=/dev/zero of=/dev/xvdf',
  'dd if=/dev/zero of=/dev/xvdg3',
  // ARM / eMMC / SD Card
  'dd if=/dev/zero of=/dev/mmcblk0',
  'dd if=/dev/zero of=/dev/mmcblk0p1',
  'dd if=/dev/zero of=/dev/mmcblk1p2',
  // IDE legacy
  'dd if=/dev/zero of=/dev/hda',
  'dd if=/dev/zero of=/dev/hdb1',
  // Device Mapper / LVM / LUKS
  'dd if=/dev/zero of=/dev/mapper/root',
  'dd if=/dev/zero of=/dev/mapper/vg0-data',
  'dd if=/dev/zero of=/dev/mapper/luks_ssd',
  // Loopback
  'dd if=/dev/zero of=/dev/loop0',
  'dd if=/dev/zero of=/dev/loop10',
];

for (const cmd of destructiveDeviceMatrix) {
  const checkRes = isDestructiveCommand(cmd);
  check(
    checkRes.isDestructive === true && checkRes.riskLevel === 'critical',
    `Device target flagged as critical: ${cmd}`,
    'DESTRUCTIVE_DEVICE',
    `Got: ${JSON.stringify(checkRes)}`
  );
}

// ReDoS resistance test: ensure catastrophic backtracking does not exist
console.log('  Testing ReDoS resistance on 10,000-character adversarial inputs...');
const longSafeString = 'rm -r ' + 'a/'.repeat(5000);
const start1 = performance.now();
const res1 = isDestructiveCommand(longSafeString);
const duration1 = performance.now() - start1;
check(duration1 < 100, `ReDoS test 1: long path rm finished in ${duration1.toFixed(2)}ms (< 100ms)`, 'REDOS');
check(res1.isDestructive === false, 'Long safe rm is not destructive', 'REDOS');

const longFlagString = 'rm ' + '-v'.repeat(2000) + ' /tmp/foo';
const start2 = performance.now();
const res2 = isDestructiveCommand(longFlagString);
const duration2 = performance.now() - start2;
check(duration2 < 100, `ReDoS test 2: long flags rm finished in ${duration2.toFixed(2)}ms (< 100ms)`, 'REDOS');
check(res2.isDestructive === false, 'Long flags rm is not destructive', 'REDOS');

const longDdString = 'dd ' + 'if=/dev/zero '.repeat(500) + 'of=/home/user/file.img';
const start3 = performance.now();
const res3 = isDestructiveCommand(longDdString);
const duration3 = performance.now() - start3;
check(duration3 < 100, `ReDoS test 3: long dd string finished in ${duration3.toFixed(2)}ms (< 100ms)`, 'REDOS');
check(res3.isDestructive === false, 'dd to safe regular file is not destructive', 'REDOS');

// ---------------------------------------------------------------------------
// SECTION 5: PROMPT STRIPPING PRECISION & SUBSTRING BOUNDARY
// ---------------------------------------------------------------------------
console.log('\n▶ SECTION 5: Prompt Stripping Precision & Whitelist Boundaries');

// Verify words starting with whitelisted commands don't trigger false prompt stripping
const promptBoundaryCases = [
  { input: '# cat /etc/hosts', expected: 'cat /etc/hosts', desc: '# cat command is stripped' },
  { input: '# catalogar documentos', expected: '# catalogar documentos', desc: '# catalogar (Spanish word) preserved' },
  { input: '# apt install curl', expected: 'apt install curl', desc: '# apt command is stripped' },
  { input: '# apto para consumo', expected: '# apto para consumo', desc: '# apto (Spanish word) preserved' },
  { input: '# rm file.txt', expected: 'rm file.txt', desc: '# rm command is stripped' },
  { input: '# rmdir test', expected: 'rmdir test', desc: '# rmdir command is stripped' },
  { input: '# echo hola', expected: 'echo hola', desc: '# echo command is stripped' },
  { input: '# ecología y medio ambiente', expected: '# ecología y medio ambiente', desc: '# ecología preserved' },
  { input: '# id de usuario', expected: 'id de usuario', desc: '# id command is stripped' },
  { input: '# idea para el proyecto', expected: '# idea para el proyecto', desc: '# idea preserved' },
  { input: '# su - root', expected: 'su - root', desc: '# su command is stripped' },
  { input: '# suelo mojado', expected: '# suelo mojado', desc: '# suelo preserved' },
];

for (const tc of promptBoundaryCases) {
  const stripped = stripCliPrompts(tc.input);
  check(
    stripped === tc.expected,
    `${tc.desc}: "${tc.input}" -> "${stripped}"`,
    'PROMPT_BOUNDARY',
    `Expected "${tc.expected}", got "${stripped}"`
  );
}

// ---------------------------------------------------------------------------
// SECTION 6: FORMAT COMMAND MODES ADVERSARIAL CASES
// ---------------------------------------------------------------------------
console.log('\n▶ SECTION 6: Format Command Modes (clean, sudo, single-line)');

const multiLineInput = `
# Comentario de inicio
$ echo "Paso 1"
# apt install -y htop
user@host:~$ sudo systemctl restart nginx
# Comentario final
`;

const cleanRes = formatCommand(multiLineInput, 'clean');
check(cleanRes.includes('echo "Paso 1"'), 'Clean mode strips $', 'FORMAT_MODE');
check(cleanRes.includes('apt install -y htop'), 'Clean mode strips root # for apt', 'FORMAT_MODE');
check(cleanRes.includes('# Comentario de inicio'), 'Clean mode preserves comments', 'FORMAT_MODE');

const sudoRes = formatCommand(multiLineInput, 'sudo');
check(sudoRes.includes('sudo echo "Paso 1"'), 'Sudo mode adds sudo to echo', 'FORMAT_MODE');
check(sudoRes.includes('sudo apt install -y htop'), 'Sudo mode adds sudo to apt', 'FORMAT_MODE');
check(sudoRes.includes('sudo systemctl restart nginx'), 'Sudo mode does not duplicate existing sudo', 'FORMAT_MODE');
check(!sudoRes.includes('sudo sudo'), 'No double sudo created', 'FORMAT_MODE');
check(!sudoRes.includes('sudo #'), 'Sudo not added to comments', 'FORMAT_MODE');

const singleRes = formatCommand(multiLineInput, 'single-line');
check(
  singleRes === 'echo "Paso 1" && apt install -y htop && sudo systemctl restart nginx',
  'Single-line joins only executable commands with && and discards comments',
  'FORMAT_MODE',
  `Actual: "${singleRes}"`
);

// Empty input handling
check(formatCommand('', 'clean') === '', 'Empty string clean mode returns empty', 'FORMAT_EMPTY');
check(formatCommand('', 'sudo') === '', 'Empty string sudo mode returns empty', 'FORMAT_EMPTY');
check(formatCommand('', 'single-line') === '', 'Empty string single-line mode returns empty', 'FORMAT_EMPTY');

// ---------------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`  EXECUTION SUMMARY: ${passedTests}/${totalTests} PASSED, ${failedTests} DEFECTS`);
console.log('======================================================================\n');

if (failedTests > 0) {
  console.error(`Found ${failedTests} failures:`);
  console.error(JSON.stringify(failureLog, null, 2));
  process.exit(1);
} else {
  console.log('ALL ADVERSARIAL STRESS TESTS PASSED WITH 0 DEFECTS! ✨');
  process.exit(0);
}
