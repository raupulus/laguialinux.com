#!/usr/bin/env node
import { MockApiServer } from './harness/mock-api-server.mjs';
import { ApiClientEngine } from './harness/client-engine.mjs';
import { expect } from './harness/assert.mjs';

// Import Tier 1 Feature Coverage Suites (Milestone 1: F1 to F10)
import f01Tier1 from './tier1-features/f01-envelope-unpacking.mjs';
import f02Tier1 from './tier1-features/f02-etag-swr-cache.mjs';
import f03Tier1 from './tier1-features/f03-multi-tenant-param.mjs';
import f04Tier1 from './tier1-features/f04-rate-limit-parser.mjs';
import f05Tier1 from './tier1-features/f05-category-explorer.mjs';
import f06Tier1 from './tier1-features/f06-subcategory-pills.mjs';
import f07Tier1 from './tier1-features/f07-weighted-tag-cloud.mjs';
import f08Tier1 from './tier1-features/f08-mega-menu-dropdown.mjs';
import f09Tier1 from './tier1-features/f09-full-catalog-page.mjs';
import f10Tier1 from './tier1-features/f10-tag-explorer-page.mjs';

// Import Tier 1 Feature Coverage Suites (Milestone 2: F11 to F31)
import f11Tier1 from './tier1-features/f11-guide-summary-hero.mjs';
import f12Tier1 from './tier1-features/f12-guide-toc-steps.mjs';
import f13Tier1 from './tier1-features/f13-guide-prerequisites.mjs';
import f14Tier1 from './tier1-features/f14-guide-reader-pages.mjs';
import f15Tier1 from './tier1-features/f15-guide-step-navigation.mjs';
import f16Tier1 from './tier1-features/f16-guide-quick-selector.mjs';
import f17Tier1 from './tier1-features/f17-guide-completion-screen.mjs';
import f18Tier1 from './tier1-features/f18-terminal-block-styling.mjs';
import f19Tier1 from './tier1-features/f19-smart-copy-prompt-stripper.mjs';
import f20Tier1 from './tier1-features/f20-smart-copy-contextual-hash.mjs';
import f21Tier1 from './tier1-features/f21-destructive-command-detector.mjs';
import f22Tier1 from './tier1-features/f22-destructive-command-modal.mjs';
import f23Tier1 from './tier1-features/f23-news-continuous-reader.mjs';
import f24Tier1 from './tier1-features/f24-news-original-source-box.mjs';
import f25Tier1 from './tier1-features/f25-news-related-articles.mjs';
import f26Tier1 from './tier1-features/f26-kernel-watcher-proxy.mjs';
import f27Tier1 from './tier1-features/f27-kernel-watcher-widget-cache.mjs';
import f28Tier1 from './tier1-features/f28-cve-critical-alert-banner.mjs';
import f29Tier1 from './tier1-features/f29-chmod-umask-calculator.mjs';
import f30Tier1 from './tier1-features/f30-cron-expression-generator.mjs';
import f31Tier1 from './tier1-features/f31-equivalences-distro-quiz.mjs';

// Import Tier 1 Feature Coverage Suites (Milestone 3: F32 to F74)
import f32Tier1 from './tier1-features/f32-global-keyboard-shortcut.mjs';
import f33Tier1 from './tier1-features/f33-reactive-search-debounce.mjs';
import f34Tier1 from './tier1-features/f34-min-query-length-guard.mjs';
import f35Tier1 from './tier1-features/f35-api-content-search.mjs';
import f36Tier1 from './tier1-features/f36-search-result-grouping.mjs';
import f37Tier1 from './tier1-features/f37-keyboard-list-navigation.mjs';
import f38Tier1 from './tier1-features/f38-search-history-persistence.mjs';
import f39Tier1 from './tier1-features/f39-history-term-deletion.mjs';
import f40Tier1 from './tier1-features/f40-modal-focus-trap-aria.mjs';
import f41Tier1 from './tier1-features/f41-extended-search-route.mjs';
import f42Tier1 from './tier1-features/f42-honeypot-anti-bot.mjs';
import f43Tier1 from './tier1-features/f43-fill-time-guard.mjs';
import f44Tier1 from './tier1-features/f44-localstorage-cooldown.mjs';
import f45Tier1 from './tier1-features/f45-cloudflare-turnstile.mjs';
import f46Tier1 from './tier1-features/f46-backend-rate-limiter.mjs';
import f47Tier1 from './tier1-features/f47-presubmit-confirmation-modal.mjs';
import f48Tier1 from './tier1-features/f48-direct-mailbox-author-links.mjs';
import f49Tier1 from './tier1-features/f49-footer-newsletter-subscription.mjs';
import f50Tier1 from './tier1-features/f50-antiprefetch-web-confirmation.mjs';
import f51Tier1 from './tier1-features/f51-human-action-confirmation.mjs';
import f52Tier1 from './tier1-features/f52-antiprefetch-unsubscription.mjs';
import f53Tier1 from './tier1-features/f53-explicit-human-unsubscription.mjs';
import f54Tier1 from './tier1-features/f54-rfc8058-one-click-unsubscribe.mjs';
import f55Tier1 from './tier1-features/f55-antienumeration-resend.mjs';
import f56Tier1 from './tier1-features/f56-legal-notice-lssi.mjs';
import f57Tier1 from './tier1-features/f57-dual-licensing-framework.mjs';
import f58Tier1 from './tier1-features/f58-privacy-policy-gdpr.mjs';
import f59Tier1 from './tier1-features/f59-cookies-policy-consent.mjs';
import f60Tier1 from './tier1-features/f60-about-us-history.mjs';
import f61Tier1 from './tier1-features/f61-open-source-friends.mjs';
import f62Tier1 from './tier1-features/f62-universal-anticls-engine.mjs';
import f63Tier1 from './tier1-features/f63-standardized-5slot-catalog.mjs';
import f64Tier1 from './tier1-features/f64-development-safe-placeholder.mjs';
import f65Tier1 from './tier1-features/f65-adblocker-exception-handling.mjs';
import f66Tier1 from './tier1-features/f66-master-rss-atom-feeds.mjs';
import f67Tier1 from './tier1-features/f67-granular-category-feeds.mjs';
import f68Tier1 from './tier1-features/f68-rss-directory-hub.mjs';
import f69Tier1 from './tier1-features/f69-head-autodiscovery-links.mjs';
import f70Tier1 from './tier1-features/f70-structured-jsonld-engine.mjs';
import f71Tier1 from './tier1-features/f71-environment-parameterization.mjs';
import f72Tier1 from './tier1-features/f72-theme-palette-switching.mjs';
import f73Tier1 from './tier1-features/f73-squircle-badges-mascots.mjs';
import f74Tier1 from './tier1-features/f74-responsive-breakpoint-nav.mjs';
import f75Tier1 from './tier1-features/f75-legacy-wordpress-redirects.mjs';

// Import Tier 2 Boundary Suites (Milestone 1: F1 to F10)
import f01Tier2 from './tier2-boundaries/f01-envelope-unpacking-boundary.mjs';
import f02Tier2 from './tier2-boundaries/f02-etag-swr-cache-boundary.mjs';
import f03Tier2 from './tier2-boundaries/f03-multi-tenant-param-boundary.mjs';
import f04Tier2 from './tier2-boundaries/f04-rate-limit-parser-boundary.mjs';
import f05Tier2 from './tier2-boundaries/f05-category-explorer-boundary.mjs';
import f06Tier2 from './tier2-boundaries/f06-subcategory-pills-boundary.mjs';
import f07Tier2 from './tier2-boundaries/f07-weighted-tag-cloud-boundary.mjs';
import f08Tier2 from './tier2-boundaries/f08-mega-menu-dropdown-boundary.mjs';
import f09Tier2 from './tier2-boundaries/f09-full-catalog-page-boundary.mjs';
import f10Tier2 from './tier2-boundaries/f10-tag-explorer-page-boundary.mjs';

// Import Tier 2 Boundary Suites (Milestone 2: F11 to F31)
import f11Tier2 from './tier2-boundaries/f11-guide-summary-hero-boundary.mjs';
import f12Tier2 from './tier2-boundaries/f12-guide-toc-steps-boundary.mjs';
import f13Tier2 from './tier2-boundaries/f13-guide-prerequisites-boundary.mjs';
import f14Tier2 from './tier2-boundaries/f14-guide-reader-pages-boundary.mjs';
import f15Tier2 from './tier2-boundaries/f15-guide-step-navigation-boundary.mjs';
import f16Tier2 from './tier2-boundaries/f16-guide-quick-selector-boundary.mjs';
import f17Tier2 from './tier2-boundaries/f17-guide-completion-screen-boundary.mjs';
import f18Tier2 from './tier2-boundaries/f18-terminal-block-styling-boundary.mjs';
import f19Tier2 from './tier2-boundaries/f19-smart-copy-prompt-stripper-boundary.mjs';
import f20Tier2 from './tier2-boundaries/f20-smart-copy-contextual-hash-boundary.mjs';
import f21Tier2 from './tier2-boundaries/f21-destructive-command-detector-boundary.mjs';
import f22Tier2 from './tier2-boundaries/f22-destructive-command-modal-boundary.mjs';
import f23Tier2 from './tier2-boundaries/f23-news-continuous-reader-boundary.mjs';
import f24Tier2 from './tier2-boundaries/f24-news-original-source-box-boundary.mjs';
import f25Tier2 from './tier2-boundaries/f25-news-related-articles-boundary.mjs';
import f26Tier2 from './tier2-boundaries/f26-kernel-watcher-proxy-boundary.mjs';
import f27Tier2 from './tier2-boundaries/f27-kernel-watcher-widget-cache-boundary.mjs';
import f28Tier2 from './tier2-boundaries/f28-cve-critical-alert-banner-boundary.mjs';
import f29Tier2 from './tier2-boundaries/f29-chmod-umask-calculator-boundary.mjs';
import f30Tier2 from './tier2-boundaries/f30-cron-expression-generator-boundary.mjs';
import f31Tier2 from './tier2-boundaries/f31-equivalences-distro-quiz-boundary.mjs';

// Import Tier 2 Boundary Suites (Milestone 3: F32 to F74)
import f32Tier2 from './tier2-boundaries/f32-global-keyboard-shortcut-boundary.mjs';
import f33Tier2 from './tier2-boundaries/f33-reactive-search-debounce-boundary.mjs';
import f34Tier2 from './tier2-boundaries/f34-min-query-length-guard-boundary.mjs';
import f35Tier2 from './tier2-boundaries/f35-api-content-search-boundary.mjs';
import f36Tier2 from './tier2-boundaries/f36-search-result-grouping-boundary.mjs';
import f37Tier2 from './tier2-boundaries/f37-keyboard-list-navigation-boundary.mjs';
import f38Tier2 from './tier2-boundaries/f38-search-history-persistence-boundary.mjs';
import f39Tier2 from './tier2-boundaries/f39-history-term-deletion-boundary.mjs';
import f40Tier2 from './tier2-boundaries/f40-modal-focus-trap-aria-boundary.mjs';
import f41Tier2 from './tier2-boundaries/f41-extended-search-route-boundary.mjs';
import f42Tier2 from './tier2-boundaries/f42-honeypot-anti-bot-boundary.mjs';
import f43Tier2 from './tier2-boundaries/f43-fill-time-guard-boundary.mjs';
import f44Tier2 from './tier2-boundaries/f44-localstorage-cooldown-boundary.mjs';
import f45Tier2 from './tier2-boundaries/f45-cloudflare-turnstile-boundary.mjs';
import f46Tier2 from './tier2-boundaries/f46-backend-rate-limiter-boundary.mjs';
import f47Tier2 from './tier2-boundaries/f47-presubmit-confirmation-modal-boundary.mjs';
import f48Tier2 from './tier2-boundaries/f48-direct-mailbox-author-links-boundary.mjs';
import f49Tier2 from './tier2-boundaries/f49-footer-newsletter-subscription-boundary.mjs';
import f50Tier2 from './tier2-boundaries/f50-antiprefetch-web-confirmation-boundary.mjs';
import f51Tier2 from './tier2-boundaries/f51-human-action-confirmation-boundary.mjs';
import f52Tier2 from './tier2-boundaries/f52-antiprefetch-unsubscription-boundary.mjs';
import f53Tier2 from './tier2-boundaries/f53-explicit-human-unsubscription-boundary.mjs';
import f54Tier2 from './tier2-boundaries/f54-rfc8058-one-click-unsubscribe-boundary.mjs';
import f55Tier2 from './tier2-boundaries/f55-antienumeration-resend-boundary.mjs';
import f56Tier2 from './tier2-boundaries/f56-legal-notice-lssi-boundary.mjs';
import f57Tier2 from './tier2-boundaries/f57-dual-licensing-framework-boundary.mjs';
import f58Tier2 from './tier2-boundaries/f58-privacy-policy-gdpr-boundary.mjs';
import f59Tier2 from './tier2-boundaries/f59-cookies-policy-consent-boundary.mjs';
import f60Tier2 from './tier2-boundaries/f60-about-us-history-boundary.mjs';
import f61Tier2 from './tier2-boundaries/f61-open-source-friends-boundary.mjs';
import f62Tier2 from './tier2-boundaries/f62-universal-anticls-engine-boundary.mjs';
import f63Tier2 from './tier2-boundaries/f63-standardized-5slot-catalog-boundary.mjs';
import f64Tier2 from './tier2-boundaries/f64-development-safe-placeholder-boundary.mjs';
import f65Tier2 from './tier2-boundaries/f65-adblocker-exception-handling-boundary.mjs';
import f66Tier2 from './tier2-boundaries/f66-master-rss-atom-feeds-boundary.mjs';
import f67Tier2 from './tier2-boundaries/f67-granular-category-feeds-boundary.mjs';
import f68Tier2 from './tier2-boundaries/f68-rss-directory-hub-boundary.mjs';
import f69Tier2 from './tier2-boundaries/f69-head-autodiscovery-links-boundary.mjs';
import f70Tier2 from './tier2-boundaries/f70-structured-jsonld-engine-boundary.mjs';
import f71Tier2 from './tier2-boundaries/f71-environment-parameterization-boundary.mjs';
import f72Tier2 from './tier2-boundaries/f72-theme-palette-switching-boundary.mjs';
import f73Tier2 from './tier2-boundaries/f73-squircle-badges-mascots-boundary.mjs';
import f74Tier2 from './tier2-boundaries/f74-responsive-breakpoint-nav-boundary.mjs';
import f75Tier2 from './tier2-boundaries/f75-legacy-wordpress-redirects-boundary.mjs';

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

async function runAllSuites() {
  console.log(`\n${ANSI.bold}${ANSI.cyan}======================================================================${ANSI.reset}`);
  console.log(`${ANSI.bold}${ANSI.cyan}  LA GUÍA LINUX — MASTER E2E TEST RUNNER (ALL FEATURES 1 TO 75)${ANSI.reset}`);
  console.log(`${ANSI.bold}${ANSI.cyan}======================================================================${ANSI.reset}\n`);

  const mockServer = new MockApiServer();
  const baseUrl = await mockServer.start();
  console.log(`${ANSI.gray}Mock API V2 Server active at: ${baseUrl}${ANSI.reset}\n`);

  const tier1Suites = [
    // Milestone 1 (F1–F10)
    f01Tier1, f02Tier1, f03Tier1, f04Tier1, f05Tier1,
    f06Tier1, f07Tier1, f08Tier1, f09Tier1, f10Tier1,
    // Milestone 2 (F11–F31)
    f11Tier1, f12Tier1, f13Tier1, f14Tier1, f15Tier1,
    f16Tier1, f17Tier1, f18Tier1, f19Tier1, f20Tier1,
    f21Tier1, f22Tier1, f23Tier1, f24Tier1, f25Tier1,
    f26Tier1, f27Tier1, f28Tier1, f29Tier1, f30Tier1,
    f31Tier1,
    // Milestone 3 (F32–F75)
    f32Tier1, f33Tier1, f34Tier1, f35Tier1, f36Tier1,
    f37Tier1, f38Tier1, f39Tier1, f40Tier1, f41Tier1,
    f42Tier1, f43Tier1, f44Tier1, f45Tier1, f46Tier1,
    f47Tier1, f48Tier1, f49Tier1, f50Tier1, f51Tier1,
    f52Tier1, f53Tier1, f54Tier1, f55Tier1, f56Tier1,
    f57Tier1, f58Tier1, f59Tier1, f60Tier1, f61Tier1,
    f62Tier1, f63Tier1, f64Tier1, f65Tier1, f66Tier1,
    f67Tier1, f68Tier1, f69Tier1, f70Tier1, f71Tier1,
    f72Tier1, f73Tier1, f74Tier1, f75Tier1
  ];

  const tier2Suites = [
    // Milestone 1 (F1–F10)
    f01Tier2, f02Tier2, f03Tier2, f04Tier2, f05Tier2,
    f06Tier2, f07Tier2, f08Tier2, f09Tier2, f10Tier2,
    // Milestone 2 (F11–F31)
    f11Tier2, f12Tier2, f13Tier2, f14Tier2, f15Tier2,
    f16Tier2, f17Tier2, f18Tier2, f19Tier2, f20Tier2,
    f21Tier2, f22Tier2, f23Tier2, f24Tier2, f25Tier2,
    f26Tier2, f27Tier2, f28Tier2, f29Tier2, f30Tier2,
    f31Tier2,
    // Milestone 3 (F32–F75)
    f32Tier2, f33Tier2, f34Tier2, f35Tier2, f36Tier2,
    f37Tier2, f38Tier2, f39Tier2, f40Tier2, f41Tier2,
    f42Tier2, f43Tier2, f44Tier2, f45Tier2, f46Tier2,
    f47Tier2, f48Tier2, f49Tier2, f50Tier2, f51Tier2,
    f52Tier2, f53Tier2, f54Tier2, f55Tier2, f56Tier2,
    f57Tier2, f58Tier2, f59Tier2, f60Tier2, f61Tier2,
    f62Tier2, f63Tier2, f64Tier2, f65Tier2, f66Tier2,
    f67Tier2, f68Tier2, f69Tier2, f70Tier2, f71Tier2,
    f72Tier2, f73Tier2, f74Tier2, f75Tier2
  ];

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let tier1Passed = 0;
  let tier1Failed = 0;
  let tier2Passed = 0;
  let tier2Failed = 0;
  const failureDetails = [];

  const overallStartTime = performance.now();

  async function executeSuites(suites, tierName) {
    console.log(`${ANSI.bold}${ANSI.magenta}▶ Running ${tierName}...${ANSI.reset}`);

    for (const suite of suites) {
      console.log(`\n  ${ANSI.bold}${suite.feature}${ANSI.reset}`);

      for (const testCase of suite.tests) {
        totalTests++;
        mockServer.reset();
        const client = new ApiClientEngine({ baseUrl, platformSlug: 'laguialinux' });

        const ctx = {
          mockServer,
          client,
          expect,
        };

        const testStart = performance.now();
        try {
          await testCase.run(ctx);
          const duration = Math.round(performance.now() - testStart);
          totalPassed++;
          if (suite.tier === 1) tier1Passed++;
          if (suite.tier === 2) tier2Passed++;

          console.log(`    ${ANSI.green}✔${ANSI.reset} ${testCase.name} ${ANSI.gray}(${duration}ms)${ANSI.reset}`);
        } catch (err) {
          totalFailed++;
          if (suite.tier === 1) tier1Failed++;
          if (suite.tier === 2) tier2Failed++;

          console.log(`    ${ANSI.red}✖ ${testCase.name}${ANSI.reset}`);
          failureDetails.push({
            tier: tierName,
            feature: suite.feature,
            name: testCase.name,
            error: err
          });
        }
      }
    }
    console.log();
  }

  try {
    await executeSuites(tier1Suites, 'Tier 1: Feature Coverage (F1 to F74)');
    await executeSuites(tier2Suites, 'Tier 2: Boundary & Corner Cases (F1 to F74)');
  } finally {
    await mockServer.stop();
  }

  const overallDuration = Math.round(performance.now() - overallStartTime);

  console.log(`${ANSI.bold}${ANSI.cyan}----------------------------------------------------------------------${ANSI.reset}`);
  console.log(`${ANSI.bold}EXECUTION SUMMARY${ANSI.reset}`);
  console.log(`${ANSI.bold}${ANSI.cyan}----------------------------------------------------------------------${ANSI.reset}`);
  console.log(`Total Test Cases   : ${totalTests}`);
  console.log(`Tier 1 Coverage    : ${ANSI.green}${tier1Passed} passed${ANSI.reset}${tier1Failed > 0 ? `, ${ANSI.red}${tier1Failed} failed${ANSI.reset}` : ''} (${tier1Suites.length} features, ${tier1Passed}/${tier1Suites.reduce((acc, s) => acc + s.tests.length, 0)})`);
  console.log(`Tier 2 Boundaries  : ${ANSI.green}${tier2Passed} passed${ANSI.reset}${tier2Failed > 0 ? `, ${ANSI.red}${tier2Failed} failed${ANSI.reset}` : ''} (${tier2Suites.length} features, ${tier2Passed}/${tier2Suites.reduce((acc, s) => acc + s.tests.length, 0)})`);
  console.log(`Total Passed       : ${ANSI.bold}${ANSI.green}${totalPassed}${ANSI.reset}`);
  console.log(`Total Failed       : ${totalFailed > 0 ? `${ANSI.bold}${ANSI.red}${totalFailed}${ANSI.reset}` : '0'}`);
  console.log(`Total Duration     : ${overallDuration}ms\n`);

  if (failureDetails.length > 0) {
    console.log(`${ANSI.bold}${ANSI.red}FAILURES:${ANSI.reset}`);
    for (const fail of failureDetails) {
      console.log(`\n${ANSI.red}• [${fail.tier}] ${fail.feature} -> ${fail.name}:${ANSI.reset}`);
      console.log(`  ${fail.error.stack || fail.error.message}`);
    }
    console.log();
    process.exit(1);
  } else {
    console.log(`${ANSI.bold}${ANSI.green}ALL ${totalPassed} TESTS PASSED CLEANLY! ✨${ANSI.reset}\n`);
    process.exit(0);
  }
}

runAllSuites().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
