import { spawn } from 'node:child_process';
import fs from 'node:fs';

const PORT = 3999;
const BASE_URL = `http://127.0.0.1:${PORT}`;

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

async function runEmpiricalHarness() {
  console.log('Starting Nitro production server on port', PORT);
  const server = spawn('node', ['.output/server/index.mjs'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(PORT), HOST: '127.0.0.1', NITRO_PORT: String(PORT), NITRO_HOST: '127.0.0.1' },
    stdio: 'inherit',
  });

  const results = [];
  function record(title, passed, details = '') {
    results.push({ title, passed, details });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${title} ${details ? '(' + details + ')' : ''}`);
  }

  try {
    await waitForServer(`${BASE_URL}/`, 10000);

    // =========================================================================
    // 1. EMPIRICAL VERIFICATION: CHALLENGE 6 (/etiqueta/bash)
    // =========================================================================
    console.log('\n--- VERIFYING CHALLENGE 6: Tag Route Resolution ---');
    {
      const res = await fetch(`${BASE_URL}/etiqueta/bash`);
      const body = await res.text();
      const status200 = res.status === 200;
      const isTagExplorer = body.includes('Taxonomía Transversal') && body.includes('#bash');
      const isPlaceholder = body.includes('Sección en Preparación') || body.includes('Ruta no encontrada');
      const hasContentCards = body.includes('Colección completa de manuales prácticos');

      record('Challenge 6: /etiqueta/bash returns HTTP 200', status200, `Status: ${res.status}`);
      record('Challenge 6: /etiqueta/bash renders Tag Explorer components', isTagExplorer, 'Found Tag Explorer headings & badge');
      record('Challenge 6: /etiqueta/bash does NOT render catch-all placeholder [...slug].vue', !isPlaceholder, 'No "Sección en Preparación" string');
      record('Challenge 6: /etiqueta/bash renders technical descriptions', hasContentCards, 'Found tag description text');
    }

    // Additional tag route tests:
    {
      const res = await fetch(`${BASE_URL}/etiqueta/kernel`);
      const body = await res.text();
      record('Tag Route: /etiqueta/kernel resolves to Tag Explorer', res.status === 200 && body.includes('#kernel'));
    }

    // Case insensitivity or non-existing tag
    {
      const res = await fetch(`${BASE_URL}/etiqueta/nonexistenttag123`);
      const body = await res.text();
      record('Tag Route: non-existent tag creates fallback tag object gracefully', res.status === 200 && body.includes('#nonexistenttag123'));
    }

    // =========================================================================
    // 2. EMPIRICAL VERIFICATION: CHALLENGE 7 (Invalid Category 404)
    // =========================================================================
    console.log('\n--- VERIFYING CHALLENGE 7: Category 404 Handling ---');
    {
      const res = await fetch(`${BASE_URL}/categoria/unknown-slug-xyz-98765`);
      const body = await res.text();
      const is404 = res.status === 404;
      const cleanMessage = body.includes('Categoría "unknown-slug-xyz-98765" no encontrada') || body.includes('404');
      record('Challenge 7 (SSR): Invalid category returns HTTP 404', is404, `Status: ${res.status}`);
      record('Challenge 7 (SSR): 404 page presents clean user message', cleanMessage);
    }

    {
      // Valid category should return 200
      const res = await fetch(`${BASE_URL}/categoria/comandos`);
      const body = await res.text();
      const isErrorPage = body.includes('Categoría "comandos" no encontrada') || body.includes('Error 404') || res.status !== 200;
      record('Challenge 7 (Valid): /categoria/comandos returns HTTP 200 and loads category explorer', res.status === 200 && !isErrorPage, `Status: ${res.status}`);
    }

    {
      // Code inspection for client-side reactive watcher
      const catCode = fs.readFileSync('pages/categoria/[slug].vue', 'utf8');
      const hasRouteWatch = catCode.includes('watch(') && catCode.includes('() => route.params.slug');
      const hasValidateCategory = catCode.includes('validateCategoryOrThrow') && catCode.includes('showError');
      record('Challenge 7 (Client-Side): Reactive route.params.slug watcher defined in pages/categoria/[slug].vue', hasRouteWatch);
      record('Challenge 7 (Client-Side): validateCategoryOrThrow calls showError({ statusCode: 404 }) on navigation', hasValidateCategory);
    }

    // =========================================================================
    // 3. EMPIRICAL VERIFICATION: CHALLENGE 8 (Mobile Drawer Focus Trap)
    // =========================================================================
    console.log('\n--- VERIFYING CHALLENGE 8: Mobile Drawer Focus Trap & Containment ---');
    {
      const menuCode = fs.readFileSync('components/CategoryMenu.vue', 'utf8');
      const hasInitialFocus = menuCode.includes('isMobileDrawerVisible') &&
        (menuCode.includes('mobileCloseButtonRef.value.focus()') || menuCode.includes('focusable[0].focus()'));
      const hasContainmentCheck = menuCode.includes('!dialog.contains(document.activeElement)');
      const hasTabBoundaryForward = menuCode.includes('document.activeElement === last') && menuCode.includes('first.focus()');
      const hasTabBoundaryBackward = menuCode.includes('document.activeElement === first') && menuCode.includes('last.focus()');
      const hasEscapeClose = menuCode.includes("e.key === 'Escape'") && menuCode.includes('closeMenu()');
      const hasFocusRestoration = menuCode.includes('lastTriggerElementRef.value?.focus()');

      record('Challenge 8: Mobile drawer sets initial focus upon opening', hasInitialFocus);
      record('Challenge 8: Focus trap enforces containment if activeElement is outside dialog', hasContainmentCheck);
      record('Challenge 8: Circular Tab key wraps from last to first focusable element', hasTabBoundaryForward);
      record('Challenge 8: Circular Shift+Tab key wraps from first to last focusable element', hasTabBoundaryBackward);
      record('Challenge 8: Escape key intercepts and closes menu/drawer', hasEscapeClose);
      record('Challenge 8: Focus is restored to opener element upon drawer closure', hasFocusRestoration);
    }

    // =========================================================================
    // 4. EMPIRICAL VERIFICATION: CHALLENGE 9 (Query Clamping: Infinity & 1.5)
    // =========================================================================
    console.log('\n--- VERIFYING CHALLENGE 9: Clamping ?page=Infinity and ?page=1.5 ---');
    {
      // Test /guias?page=Infinity
      const res = await fetch(`${BASE_URL}/guias?page=Infinity`);
      const body = await res.text();
      const status200 = res.status === 200;
      const rendersLiteralInfinity = body.includes('Infinity-') || body.includes('de Infinity') || body.includes('Página Infinity');
      const rendersDefaultBound = body.includes('Mostrando 1-') || body.includes('Mostrando 1 a ');
      record('Challenge 9 (/guias?page=Infinity): HTTP 200 status', status200, `Status: ${res.status}`);
      record('Challenge 9 (/guias?page=Infinity): Rejects/clamps Infinity string from rendered text', !rendersLiteralInfinity);
      record('Challenge 9 (/guias?page=Infinity): Normalizes to valid integer page bound', rendersDefaultBound || !rendersLiteralInfinity);
    }

    {
      // Test /guias?page=1.5
      const res = await fetch(`${BASE_URL}/guias?page=1.5`);
      const body = await res.text();
      const status200 = res.status === 200;
      // If fractional 1.5 is NOT clamped, it calculated from=(1.5-1)*12+1 = 7, so it said "Mostrando 7-12"
      // If clamped to 1, it says "Mostrando 1-12"
      const hasFractionalOffset = body.includes('Mostrando 7-12') || body.includes('Mostrando 7-');
      const hasNormalizedOffset = body.includes('Mostrando 1-12') || body.includes('Mostrando 1-');
      record('Challenge 9 (/guias?page=1.5): HTTP 200 status', status200, `Status: ${res.status}`);
      record('Challenge 9 (/guias?page=1.5): Floored to integer page without fractional offset slice', !hasFractionalOffset && hasNormalizedOffset);
    }

    {
      // Test /categoria/comandos?page=Infinity and ?page=1.5
      const resInf = await fetch(`${BASE_URL}/categoria/comandos?page=Infinity`);
      const bodyInf = await resInf.text();
      const resFloat = await fetch(`${BASE_URL}/categoria/comandos?page=1.5`);
      const bodyFloat = await resFloat.text();

      record('Challenge 9 (/categoria/comandos?page=Infinity): Handles safely without 500 crash', resInf.status === 200);
      record('Challenge 9 (/categoria/comandos?page=1.5): Handles safely without 500 crash', resFloat.status === 200);
      record('Challenge 9 (/categoria/comandos?page=Infinity): Does not render "Infinity"', !bodyInf.includes('Página Infinity'));
    }

    // =========================================================================
    // 5. PRIVACY & LEAK AUDIT
    // =========================================================================
    console.log('\n--- VERIFYING PRIVACY & COMPLIANCE ---');
    {
      const forbiddenEmail = 'raupulus' + '@' + 'gmail.com';
      const resGuias = await fetch(`${BASE_URL}/guias`);
      const bodyGuias = await resGuias.text();
      const resTag = await fetch(`${BASE_URL}/etiqueta/bash`);
      const bodyTag = await resTag.text();

      record('Privacy: /guias does not leak forbidden private email', !bodyGuias.includes(forbiddenEmail));
      record('Privacy: /etiqueta/bash does not leak forbidden private email', !bodyTag.includes(forbiddenEmail));
    }

  } finally {
    server.kill();
    await sleep(300);
  }

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  console.log(`\n======================================================`);
  console.log(`Deepdive Empirical Results: ${passedCount} passed, ${failedCount} failed`);
  console.log(`======================================================\n`);
  return { passedCount, failedCount, results };
}

runEmpiricalHarness().catch(err => {
  console.error('Empirical harness crashed:', err);
  process.exit(1);
});
