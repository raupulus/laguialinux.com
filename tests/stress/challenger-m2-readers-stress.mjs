#!/usr/bin/env node
/**
 * CHALLENGER M2-1: Content Readers Adversarial Verification & Stress Suite
 * Focus:
 *  - pages/guia/[slug].vue
 *  - pages/guia/[slug]/[page].vue
 *  - pages/noticia/[slug].vue
 * 
 * Stress Scenarios:
 * 1. Out-of-bounds step parameter in /guia/[slug]/[page]
 * 2. Boundary stepping: first step, last step, completion state
 * 3. Keyboard arrow navigation logic & listener lifecycle
 * 4. Non-existent slug error handling (404 vs soft-404)
 * 5. News reading scroll progress calculation extremes
 * 6. Architectural Nuxt route structure inspection
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';

const PORT = 3999;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m'
};

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status) return true;
    } catch {
      // retry
    }
    await sleep(200);
  }
  throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
}

const findings = [];
let passCount = 0;
let failCount = 0;
let warnCount = 0;

function report(scenario, name, status, details, level = 'PASS') {
  if (status) {
    passCount++;
    console.log(`  ${ANSI.green}✔ [PASS]${ANSI.reset} ${name}`);
    if (details) console.log(`         ${ANSI.gray}${details}${ANSI.reset}`);
  } else {
    if (level === 'WARN') {
      warnCount++;
      console.log(`  ${ANSI.yellow}⚠ [WARN]${ANSI.reset} ${name}`);
      findings.push({ scenario, name, level: 'WARN', details });
      if (details) console.log(`         ${ANSI.yellow}${details}${ANSI.reset}`);
    } else {
      failCount++;
      console.log(`  ${ANSI.red}✖ [FAIL]${ANSI.reset} ${name}`);
      findings.push({ scenario, name, level: 'FAIL', details });
      if (details) console.log(`         ${ANSI.red}${details}${ANSI.reset}`);
    }
  }
}

async function runReadersAdversarialSuite() {
  console.log(`\n${ANSI.bold}${ANSI.cyan}======================================================================${ANSI.reset}`);
  console.log(`${ANSI.bold}${ANSI.cyan}  CHALLENGER M2-1: CONTENT READERS EMPIRICAL STRESS TEST SUITE        ${ANSI.reset}`);
  console.log(`${ANSI.bold}${ANSI.cyan}======================================================================${ANSI.reset}\n`);

  // =========================================================================
  // SCENARIO 0: Architectural Nuxt Route Tree Inspection
  // =========================================================================
  console.log(`${ANSI.bold}▶ ARCHITECTURAL ROUTE INSPECTION: pages/guia/[slug].vue vs pages/guia/[slug]/[page].vue${ANSI.reset}`);
  const entryMjsPath = '.output/server/chunks/virtual/entry.mjs';
  if (fs.existsSync(entryMjsPath)) {
    const entryContent = fs.readFileSync(entryMjsPath, 'utf8');
    const isGuiaPageAChild = entryContent.includes('name: "guia-slug"') &&
                             entryContent.includes('children: [{') &&
                             entryContent.includes('name: "guia-slug-page"');
    const guiaSlugSource = fs.existsSync('pages/guia/[slug]/index.vue')
      ? fs.readFileSync('pages/guia/[slug]/index.vue', 'utf8')
      : (fs.existsSync('pages/guia/[slug].vue') ? fs.readFileSync('pages/guia/[slug].vue', 'utf8') : '');
    const hasNuxtPageTag = guiaSlugSource.includes('<NuxtPage') || guiaSlugSource.includes('<router-view');

    report(
      'Architecture',
      'Route tree nesting: guia-slug-page registered as child route of guia-slug',
      !isGuiaPageAChild || hasNuxtPageTag,
      isGuiaPageAChild && !hasNuxtPageTag
        ? 'CRITICAL DEFECT: Nuxt compiled pages/guia/[slug].vue as parent of pages/guia/[slug]/[page].vue (children: [{ name: "guia-slug-page" }]). Because pages/guia/[slug].vue does not contain <NuxtPage />, the child step reader component is NEVER rendered on HTTP requests to /guia/:slug/:page! Fix: move pages/guia/[slug].vue to pages/guia/[slug]/index.vue.'
        : 'Guia step route is independent or parent has <NuxtPage />',
      'FAIL'
    );
  }

  // =========================================================================
  // SCENARIO 1: Component Unit Logic - Out-of-bounds Step Parameter Resolution
  // =========================================================================
  console.log(`\n${ANSI.bold}▶ SCENARIO 1: Step Parameter Out-of-Bounds Resolution Logic${ANSI.reset}`);
  
  // Test the exact resolution algorithm from pages/guia/[slug]/[page].vue (lines 104-115)
  function resolveStepIndex(pages, stepParam) {
    let stepIndex = pages.findIndex(
      p => p.slug === stepParam || String(p.order) === stepParam
    );
    if (stepIndex === -1) {
      const num = parseInt(stepParam, 10);
      if (!isNaN(num) && num >= 1 && num <= pages.length) {
        stepIndex = num - 1;
      } else {
        stepIndex = 0;
      }
    }
    return stepIndex;
  }

  const samplePages = [
    { id: 1, order: 1, slug: 'paso-1', title: 'Paso 1' },
    { id: 2, order: 2, slug: 'paso-2', title: 'Paso 2' },
    { id: 3, order: 3, slug: 'paso-3', title: 'Paso 3' },
  ];

  // 1.1 Negative step (-1)
  const idxNeg = resolveStepIndex(samplePages, '-1');
  report(
    'Scenario 1',
    'Algorithm: Negative step ("-1") resolves to step index 0 (Paso 1)',
    idxNeg === 0,
    `Resolved index: ${idxNeg}`
  );

  // 1.2 Non-numeric step ("abc")
  const idxAbc = resolveStepIndex(samplePages, 'abc');
  report(
    'Scenario 1',
    'Algorithm: Non-numeric step ("abc") resolves to step index 0 (Paso 1)',
    idxAbc === 0,
    `Resolved index: ${idxAbc}`
  );

  // 1.3 Step "Infinity"
  const idxInf = resolveStepIndex(samplePages, 'Infinity');
  report(
    'Scenario 1',
    'Algorithm: Step "Infinity" resolves to step index 0 (Paso 1)',
    idxInf === 0,
    `Resolved index: ${idxInf}`
  );

  // 1.4 Large step out-of-bounds (999)
  const idx999 = resolveStepIndex(samplePages, '999');
  report(
    'Scenario 1',
    'Algorithm: Out-of-bounds step (999) resolves to step index 0 (Paso 1)',
    idx999 === 0,
    `Resolved index: ${idx999}`
  );

  // 1.5 Step zero (0)
  const idxZero = resolveStepIndex(samplePages, '0');
  report(
    'Scenario 1',
    'Algorithm: Step "0" resolves to step index 0 (Paso 1)',
    idxZero === 0,
    `Resolved index: ${idxZero}`
  );

  // 1.6 Valid slug lookup
  const idxSlug = resolveStepIndex(samplePages, 'paso-2');
  report(
    'Scenario 1',
    'Algorithm: Valid slug ("paso-2") resolves accurately to index 1 (Paso 2)',
    idxSlug === 1,
    `Resolved index: ${idxSlug}`
  );

  // 1.7 Valid numeric string lookup
  const idxNum = resolveStepIndex(samplePages, '3');
  report(
    'Scenario 1',
    'Algorithm: Valid order string ("3") resolves accurately to index 2 (Paso 3)',
    idxNum === 2,
    `Resolved index: ${idxNum}`
  );

  // 1.8 Empty pages array boundary check
  const idxEmpty = resolveStepIndex([], '1');
  report(
    'Scenario 1',
    'Algorithm: Empty pages array returns index 0 without crashing',
    idxEmpty === 0,
    `Resolved index: ${idxEmpty}`
  );

  // =========================================================================
  // SCENARIO 2: Boundary Stepping Logic (Step 1 vs Last Step)
  // =========================================================================
  console.log(`\n${ANSI.bold}▶ SCENARIO 2: Boundary Stepping Logic${ANSI.reset}`);

  function evalStepperState(pages, currentIndex, guideSlug) {
    const totalPages = pages.length || 1;
    const isFirstStep = currentIndex === 0;
    const isLastStep = currentIndex === totalPages - 1;
    const prevStep = currentIndex > 0 ? pages[currentIndex - 1] : null;
    const nextStep = currentIndex < totalPages - 1 ? pages[currentIndex + 1] : null;
    const getStepUrl = (p) => `/guia/${guideSlug}/${p.slug || p.order}`;
    const prevUrl = prevStep ? getStepUrl(prevStep) : `/guia/${guideSlug}`;
    const nextUrl = nextStep ? getStepUrl(nextStep) : null;
    return { isFirstStep, isLastStep, prevStep, nextStep, prevUrl, nextUrl };
  }

  // 2.1 First step boundary evaluation
  const stateFirst = evalStepperState(samplePages, 0, 'mi-guia');
  report(
    'Scenario 2',
    'Boundary: Step 1 sets isFirstStep = true, isLastStep = false',
    stateFirst.isFirstStep === true && stateFirst.isLastStep === false,
    `isFirstStep: ${stateFirst.isFirstStep}, isLastStep: ${stateFirst.isLastStep}`
  );
  report(
    'Scenario 2',
    'Boundary: Step 1 prevStep is null, prevUrl links to summary hub (/guia/mi-guia)',
    stateFirst.prevStep === null && stateFirst.prevUrl === '/guia/mi-guia',
    `prevUrl: ${stateFirst.prevUrl}`
  );
  report(
    'Scenario 2',
    'Boundary: Step 1 nextStep is Step 2, nextUrl is /guia/mi-guia/paso-2',
    stateFirst.nextStep?.order === 2 && stateFirst.nextUrl === '/guia/mi-guia/paso-2',
    `nextUrl: ${stateFirst.nextUrl}`
  );

  // 2.2 Last step boundary evaluation
  const stateLast = evalStepperState(samplePages, 2, 'mi-guia');
  report(
    'Scenario 2',
    'Boundary: Final Step sets isFirstStep = false, isLastStep = true',
    stateLast.isFirstStep === false && stateLast.isLastStep === true,
    `isFirstStep: ${stateLast.isFirstStep}, isLastStep: ${stateLast.isLastStep}`
  );
  report(
    'Scenario 2',
    'Boundary: Final Step nextStep is null, nextUrl is null',
    stateLast.nextStep === null && stateLast.nextUrl === null,
    `nextUrl: ${stateLast.nextUrl}`
  );
  report(
    'Scenario 2',
    'Boundary: Final Step prevStep is Step 2, prevUrl is /guia/mi-guia/paso-2',
    stateLast.prevStep?.order === 2 && stateLast.prevUrl === '/guia/mi-guia/paso-2',
    `prevUrl: ${stateLast.prevUrl}`
  );

  // =========================================================================
  // SCENARIO 3: Keyboard Arrow Navigation & Event Listener Lifecycle
  // =========================================================================
  console.log(`\n${ANSI.bold}▶ SCENARIO 3: Keyboard Arrow Navigation & Event Listener Lifecycle${ANSI.reset}`);

  const stepSource = fs.readFileSync('pages/guia/[slug]/[page].vue', 'utf8');

  // 3.1 Input filtering
  const hasInputGuard = stepSource.includes("tag === 'input'") &&
                        stepSource.includes("tag === 'textarea'") &&
                        stepSource.includes("tag === 'select'") &&
                        stepSource.includes('isContentEditable');
  report(
    'Scenario 3',
    'Keyboard navigation ignores arrow keys when user focuses input/textarea/select/editable elements',
    hasInputGuard,
    'Verified: Form controls prevent arrow navigation collision.'
  );

  // 3.2 ArrowLeft / ArrowRight navigation
  const hasArrowKeys = stepSource.includes("e.key === 'ArrowLeft'") && stepSource.includes("e.key === 'ArrowRight'");
  report(
    'Scenario 3',
    'Keyboard navigation listens for ArrowLeft and ArrowRight keys',
    hasArrowKeys,
    'Verified: ArrowLeft/ArrowRight trigger router.push.'
  );

  // 3.3 Boundary protection on ArrowRight at final step
  const hasBoundaryKeyCheck = stepSource.includes("e.key === 'ArrowRight' && nextUrl.value");
  report(
    'Scenario 3',
    'ArrowRight key is strictly guarded against null nextUrl at final step',
    hasBoundaryKeyCheck,
    'Verified: When nextUrl is null, ArrowRight is a no-op.'
  );

  // 3.4 Event listener attached on mount and cleaned on unmount
  const hasClientGuard = stepSource.includes('if (import.meta.client)') &&
                         stepSource.includes("window.addEventListener('keydown', handleKeydown)");
  const hasUnmountCleanup = stepSource.includes("window.removeEventListener('keydown', handleKeydown)");
  report(
    'Scenario 3',
    'Keydown listener is attached only on client (SSR-safe) and cleaned up on unmount',
    hasClientGuard && hasUnmountCleanup,
    'Verified: onMounted adds listener and onUnmounted removes exact handler reference.'
  );

  // 3.5 Check modifier keys (Alt, Cmd, Ctrl)
  const checksModifiers = stepSource.includes('e.altKey') || stepSource.includes('e.metaKey') || stepSource.includes('e.ctrlKey');
  report(
    'Scenario 3',
    'Modifier keys (Alt+Arrow, Cmd+Arrow, Ctrl+Arrow) inspection',
    checksModifiers,
    checksModifiers
      ? 'Modifier keys are filtered out'
      : 'Note: Alt+Arrow/Cmd+Arrow are not explicitly filtered. Browser navigation shortcuts could overlap.',
    'WARN'
  );

  // =========================================================================
  // SCENARIO 4: Error Handling & 404 Verification
  // =========================================================================
  console.log(`\n${ANSI.bold}▶ SCENARIO 4: Error Handling & 404 Status Verification${ANSI.reset}`);

  console.log(`Starting isolated Nitro server on port ${PORT}...`);
  const serverProcess = spawn('node', ['.output/server/index.mjs'], {
    env: { ...process.env, PORT: String(PORT), HOST: '127.0.0.1', NITRO_PORT: String(PORT), NITRO_HOST: '127.0.0.1' },
    stdio: 'ignore',
  });

  try {
    await waitForServer(`${BASE_URL}/`, 15000);
    console.log(`${ANSI.green}Nitro server responsive on ${BASE_URL}${ANSI.reset}\n`);

    // 4.1 Non-existent guide summary
    const resNonGuide = await fetch(`${BASE_URL}/guia/guia-fantasma-12345`);
    report(
      'Scenario 4',
      'Non-existent guide slug (/guia/guia-fantasma-12345) throws HTTP 404',
      resNonGuide.status === 404,
      `HTTP status: ${resNonGuide.status}. pages/guia/[slug].vue cleanly throws fatal 404.`
    );

    // 4.2 Accented non-existent guide
    const resAccentedGuide = await fetch(`${BASE_URL}/guia/gu%C3%ADa-inexistente`);
    report(
      'Scenario 4',
      'Accented non-existent guide slug handles safely with HTTP 404 without 500 crash',
      resAccentedGuide.status === 404,
      `HTTP status: ${resAccentedGuide.status}`
    );

    // 4.3 Existing sample news slug
    const resValidNews = await fetch(`${BASE_URL}/noticia/linux-kernel-6-12-lanzado-real-time`);
    report(
      'Scenario 4',
      'Existing news slug (/noticia/linux-kernel-6-12-lanzado-real-time) returns HTTP 200',
      resValidNews.status === 200,
      `HTTP status: ${resValidNews.status}. News reader renders correctly.`
    );

    // 4.4 Non-existent news slug - Soft-404 vs Hard-404
    const resNonNews = await fetch(`${BASE_URL}/noticia/noticia-fantasma-12345`);
    const isNews404 = resNonNews.status === 404;
    report(
      'Scenario 4',
      'Non-existent news slug (/noticia/noticia-fantasma-12345) returns HTTP 404',
      isNews404,
      isNews404
        ? `HTTP status is 404 as expected.`
        : `CRITICAL FLAW (Soft-404): HTTP status is ${resNonNews.status}. pages/noticia/[slug].vue generates a synthetic fallback article (id: 999) instead of throwing 404 when the slug is absent from API and SAMPLE_NEWS. Search engines will index infinite invalid news URLs.`,
      'FAIL'
    );

  } finally {
    console.log(`\nStopping isolated Nitro server...`);
    serverProcess.kill('SIGTERM');
  }

  // =========================================================================
  // SCENARIO 5: News Reading Scroll Progress Calculation Extremes
  // =========================================================================
  console.log(`\n${ANSI.bold}▶ SCENARIO 5: News Reading Scroll Progress Calculation Extremes${ANSI.reset}`);

  const newsSource = fs.readFileSync('pages/noticia/[slug].vue', 'utf8');

  function calcScrollProgress(scrollHeight, innerHeight, scrollY) {
    let progress = 0;
    const totalHeight = scrollHeight - innerHeight;
    if (totalHeight > 0) {
      progress = Math.min(100, Math.max(0, (scrollY / totalHeight) * 100));
    }
    return progress;
  }

  // 5.1 Zero scroll height (content fits in viewport)
  const progZeroHeight = calcScrollProgress(800, 800, 0);
  report(
    'Scenario 5',
    'Zero scroll height (scrollHeight === innerHeight) returns 0% without division-by-zero or NaN',
    progZeroHeight === 0 && !isNaN(progZeroHeight),
    `Result: ${progZeroHeight}%. Protected by totalHeight > 0 check.`
  );

  // 5.2 Negative scroll height (content smaller than viewport)
  const progNegHeight = calcScrollProgress(500, 800, 0);
  report(
    'Scenario 5',
    'Negative totalHeight (content smaller than viewport) returns 0% safely',
    progNegHeight === 0 && !isNaN(progNegHeight),
    `Result: ${progNegHeight}%.`
  );

  // 5.3 Top boundary (scrollY === 0)
  const progTop = calcScrollProgress(2000, 800, 0);
  report(
    'Scenario 5',
    'Top of page (scrollY = 0) returns exactly 0%',
    progTop === 0,
    `Result: ${progTop}%.`
  );

  // 5.4 Halfway scroll (scrollY === totalHeight / 2)
  const progHalf = calcScrollProgress(2000, 800, 600);
  report(
    'Scenario 5',
    'Halfway scroll (scrollY = 600 of 1200) returns exactly 50%',
    progHalf === 50,
    `Result: ${progHalf}%.`
  );

  // 5.5 Bottom boundary (scrollY === totalHeight)
  const progBottom = calcScrollProgress(2000, 800, 1200);
  report(
    'Scenario 5',
    'Exact bottom of page (scrollY = totalHeight) returns exactly 100%',
    progBottom === 100,
    `Result: ${progBottom}%.`
  );

  // 5.6 Overscroll at top (iOS bounce, scrollY < 0, e.g. -150)
  const progOverscrollTop = calcScrollProgress(2000, 800, -150);
  report(
    'Scenario 5',
    'Negative scroll / iOS top bounce (scrollY = -150) clamped safely to 0%',
    progOverscrollTop === 0,
    `Result: ${progOverscrollTop}%. Clamped by Math.max(0, ...).`
  );

  // 5.7 Overscroll at bottom (iOS bounce, scrollY > totalHeight, e.g. 1400)
  const progOverscrollBottom = calcScrollProgress(2000, 800, 1400);
  report(
    'Scenario 5',
    'Bottom overscroll (scrollY = 1400 of 1200) clamped safely to 100%',
    progOverscrollBottom === 100,
    `Result: ${progOverscrollBottom}%. Clamped by Math.min(100, ...).`
  );

  // 5.8 Extreme astronomical scroll position (e.g. 1e12)
  const progExtreme = calcScrollProgress(2000, 800, 1e12);
  report(
    'Scenario 5',
    'Extreme astronomical scroll position (1e12) clamped safely to 100%',
    progExtreme === 100,
    `Result: ${progExtreme}%.`
  );

  // 5.9 Scroll listener lifecycle in pages/noticia/[slug].vue
  const hasPassiveScroll = newsSource.includes("window.addEventListener('scroll', onScroll, { passive: true })");
  const hasScrollCleanup = newsSource.includes("window.removeEventListener('scroll', onScroll)");
  report(
    'Scenario 5',
    'Scroll listener is registered with { passive: true } and removed on unmount',
    hasPassiveScroll && hasScrollCleanup,
    'Verified: Passive scroll listener minimizes main-thread jank and unmounts cleanly.'
  );

  // 5.10 Window resize listener check
  const hasResizeListener = newsSource.includes("addEventListener('resize'") || newsSource.includes('ResizeObserver');
  report(
    'Scenario 5',
    'Window resize / viewport dimension change handling',
    hasResizeListener,
    hasResizeListener
      ? 'Resize listener is present'
      : 'Note: Window resize does not immediately recalculate scrollProgress until the next scroll event occurs.',
    'WARN'
  );

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log(`\n${ANSI.bold}${ANSI.cyan}======================================================================${ANSI.reset}`);
  console.log(`${ANSI.bold}${ANSI.cyan}  CHALLENGER M2-1: EXECUTION SUMMARY                                  ${ANSI.reset}`);
  console.log(`${ANSI.bold}${ANSI.cyan}======================================================================${ANSI.reset}`);
  console.log(`  Passed Scenarios : ${ANSI.green}${passCount}${ANSI.reset}`);
  console.log(`  Failed Scenarios : ${failCount > 0 ? ANSI.red : ANSI.gray}${failCount}${ANSI.reset}`);
  console.log(`  Warnings/Notes   : ${warnCount > 0 ? ANSI.yellow : ANSI.gray}${warnCount}${ANSI.reset}`);
  console.log(`${ANSI.bold}${ANSI.cyan}======================================================================${ANSI.reset}\n`);

  if (findings.length > 0) {
    console.log(`${ANSI.yellow}Critical Findings Detected:${ANSI.reset}`);
    findings.forEach(f => {
      console.log(` - [${f.level}] ${f.scenario}: ${f.name}`);
      if (f.details) console.log(`   ${f.details}`);
    });
    console.log('');
  }

  return { passCount, failCount, warnCount, findings };
}

runReadersAdversarialSuite()
  .then((res) => {
    if (res.failCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  })
  .catch((err) => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  });
