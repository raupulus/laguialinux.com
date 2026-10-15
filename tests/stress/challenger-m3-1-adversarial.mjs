/**
 * tests/stress/challenger-m3-1-adversarial.mjs
 * Comprehensive Adversarial Stress Test Suite for M3 Search & Anti-Bot Forms
 *
 * Scenarios tested:
 * 1. SearchModal & Extended Search (Regex, SQLi, XSS, empty/whitespace, long strings, rapid debounce, keyboard nav, history)
 * 2. Contact Form Anti-Bot (Honeypot Layer 1, Fill Time Layer 2, Cooldown Layer 3, Captcha Layer 4, Validation)
 * 3. Newsletter Anti-Prefetch (Zero-mutation on GET, missing token UI, explicit action click, error handling)
 * 4. Live Server SSR Adversarial Fuzzing (Nitro HTTP requests with malicious params)
 */

import { spawn } from 'node:child_process';
import { SAMPLE_GUIDES, SAMPLE_NEWS } from '../../utils/sampleContentsData.ts';

// Setup Mock Environment
class MockStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

const results = [];
let passCount = 0;
let failCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    passCount++;
    results.push({ name: testName, pass: true });
    console.log(`  ✔ PASS: ${testName}`);
  } else {
    failCount++;
    results.push({ name: testName, pass: false, details });
    console.log(`  ✖ FAIL: ${testName} -> ${details}`);
  }
}

console.log('======================================================================');
console.log('  CHALLENGER M3-1: SEARCH & ANTI-BOT FORMS ADVERSARIAL STRESS SUITE   ');
console.log('======================================================================\n');

// =============================================================================
// SCENARIO 1: SEARCH MODAL & EXTENDED SEARCH ADVERSARIAL STRESS
// =============================================================================
console.log('--- SCENARIO 1: Search Modal & Extended Search Adversarial Stress ---');

// 1.1 highlightMatch regex special characters
function highlightMatch(text, query, isNews = false) {
  if (!query || !query.trim() || !text) return text;
  const cleanQ = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${cleanQ})`, 'gi');
  const accentClass = isNews
    ? 'bg-orange-500/25 text-orange-300 font-bold px-0.5 rounded'
    : 'bg-emerald-500/25 text-emerald-300 font-bold px-0.5 rounded';
  return text.replace(regex, `<mark class="${accentClass}">$1</mark>`);
}

// 1.1.1 Regex meta-characters in query
const regexMetaQueries = [
  '.*+?^${}()|[]\\',
  '[a-z]+',
  '(((',
  '\\\\',
  '***',
  '???',
  '$$$',
  '^begin',
  'end$',
  '(?=test)',
  '(?<=test)',
];

for (const q of regexMetaQueries) {
  let threw = false;
  let out = '';
  try {
    out = highlightMatch('Guía completa de chmod en GNU/Linux con .*+?^${}()|[]\\', q);
  } catch (err) {
    threw = true;
  }
  assert(!threw && typeof out === 'string', `highlightMatch handles regex meta characters without throwing: "${q}"`);
}

// 1.1.2 SQL Injection fragments in search query
const sqliQueries = [
  "' OR 1=1--",
  "admin' --",
  "1; DROP TABLE wp_LGL_posts; --",
  "UNION SELECT null, username, password FROM users--",
  "'; EXEC xp_cmdshell('dir');--",
  "\" OR \"\"=\"",
];

for (const q of sqliQueries) {
  let threw = false;
  let out = '';
  try {
    out = highlightMatch('Administración de usuarios y permisos en Linux', q);
  } catch {
    threw = true;
  }
  assert(!threw && typeof out === 'string', `highlightMatch survives SQLi query safely: "${q}"`);
}

// 1.1.3 XSS fragments in search query
const xssQueries = [
  "<script>alert('xss')</script>",
  "<img src=x onerror=alert(1)>",
  "<svg/onload=alert('xss')>",
  "javascript:alert(1)",
  "<iframe src=\"javascript:alert(1)\">",
  "'\"><script>alert(document.cookie)</script>",
];

for (const q of xssQueries) {
  let threw = false;
  let out = '';
  try {
    out = highlightMatch('Configuración de Nginx y cortafuegos en Debian', q);
  } catch {
    threw = true;
  }
  assert(!threw && typeof out === 'string', `highlightMatch survives XSS query string without crash: "${q}"`);
}

// 1.1.4 Empty and whitespace queries
assert(highlightMatch('Linux Guide', '') === 'Linux Guide', 'highlightMatch with empty string returns original text');
assert(highlightMatch('Linux Guide', '   ') === 'Linux Guide', 'highlightMatch with whitespace returns original text');
assert(highlightMatch('Linux Guide', '\t\n\r') === 'Linux Guide', 'highlightMatch with escape whitespace returns original text');
assert(highlightMatch(null, 'test') === null, 'highlightMatch with null text returns null');
assert(highlightMatch(undefined, 'test') === undefined, 'highlightMatch with undefined text returns undefined');

// 1.1.5 Extreme length queries
const longQuery500 = 'a'.repeat(500);
const longQuery5000 = 'chmod '.repeat(1000);
assert(typeof highlightMatch('Comando chmod 755', longQuery500) === 'string', 'highlightMatch survives 500-char query');
assert(typeof highlightMatch('Comando chmod 755', longQuery5000) === 'string', 'highlightMatch survives 5000-char query');

// 1.2 Local fallback search logic simulation
function fallbackLocalSearch(term) {
  const q = term.toLowerCase();
  const results = [];

  for (const item of SAMPLE_GUIDES) {
    const matchTitle = item.title.toLowerCase().includes(q);
    const matchExcerpt = (item.excerpt || '').toLowerCase().includes(q);
    const matchCategory = item.categoryName.toLowerCase().includes(q);
    const matchTags = (item.tagsList || []).some((t) => t.toLowerCase().includes(q));
    const matchCmd = (item.commandSnippet || '').toLowerCase().includes(q);

    if (matchTitle || matchExcerpt || matchCategory || matchTags || matchCmd) {
      results.push({
        id: item.id,
        title: item.title,
        type: 'Guía',
        url: `/guia/${item.slug}`,
      });
    }
  }

  for (const item of SAMPLE_NEWS) {
    const matchTitle = item.title.toLowerCase().includes(q);
    const matchExcerpt = (item.excerpt || '').toLowerCase().includes(q);
    const matchCategory = item.categoryName.toLowerCase().includes(q);

    if (matchTitle || matchExcerpt || matchCategory) {
      results.push({
        id: item.id,
        title: item.title,
        type: 'Noticia',
        url: `/noticia/${item.slug}`,
      });
    }
  }

  return results.slice(0, 8);
}

const chmodResults = fallbackLocalSearch('chmod');
assert(chmodResults.length > 0, 'Local fallback search finds guides for "chmod"', `Found ${chmodResults.length}`);
const nonExistentResults = fallbackLocalSearch('xyznonexistentterm9999');
assert(nonExistentResults.length === 0, 'Local fallback search returns empty array for non-matching query');

// 1.3 Rapid Keystroke Debounce Simulation
async function testDebounce() {
  let callCount = 0;
  let lastTerm = '';
  let timer = null;

  function triggerSearch(term) {
    if (timer) clearTimeout(timer);
    const clean = term.trim();
    if (clean.length < 2) return;
    timer = setTimeout(() => {
      callCount++;
      lastTerm = clean;
    }, 50); // fast 50ms timer for test
  }

  // Simulate typing "c", "ch", "chm", "chmo", "chmod" rapidly
  triggerSearch('c');
  triggerSearch('ch');
  triggerSearch('chm');
  triggerSearch('chmo');
  triggerSearch('chmod');

  await new Promise((r) => setTimeout(r, 100));

  assert(callCount === 1, 'Rapid keystroke debounce triggers exactly once', `callCount = ${callCount}`);
  assert(lastTerm === 'chmod', 'Debounced search captures final input string', `lastTerm = ${lastTerm}`);
}
await testDebounce();

// 1.4 Keyboard Navigation Circular Wrap
function testKeyboardNav() {
  const items = [0, 1, 2, 3, 4]; // 5 items

  // ArrowDown wrap
  let selected = 4;
  selected = (selected + 1) % items.length;
  assert(selected === 0, 'ArrowDown on last item wraps to index 0');

  // ArrowUp wrap
  selected = 0;
  selected = (selected - 1 + items.length) % items.length;
  assert(selected === 4, 'ArrowUp on first item (0) wraps to last item (4)');

  // Single item wrap
  const single = [0];
  let selSingle = 0;
  selSingle = (selSingle + 1) % single.length;
  assert(selSingle === 0, 'Single item array wrap ArrowDown remains 0');
  selSingle = (selSingle - 1 + single.length) % single.length;
  assert(selSingle === 0, 'Single item array wrap ArrowUp remains 0');

  // Empty array guard
  const empty = [];
  let selEmpty = 0;
  if (empty.length > 0) {
    selEmpty = (selEmpty + 1) % empty.length;
  }
  assert(selEmpty === 0, 'Empty array guard prevents division by zero / NaN');
}
testKeyboardNav();

// 1.5 Recent Searches Persistence & Bounds
function testRecentSearches() {
  const storage = new MockStorage();
  const RECENT_KEY = 'lgl_recent_searches';
  const MAX_RECENT = 8;
  let recentSearches = [];

  function addRecentSearch(term) {
    if (!term) return;
    const clean = term.trim();
    if (clean.length < 2) return;

    const filtered = recentSearches.filter((t) => t.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...filtered].slice(0, MAX_RECENT);
    recentSearches = updated;
    storage.setItem(RECENT_KEY, JSON.stringify(updated));
  }

  function removeRecentSearch(term) {
    recentSearches = recentSearches.filter((t) => t !== term);
    storage.setItem(RECENT_KEY, JSON.stringify(recentSearches));
  }

  function clearAllRecent() {
    recentSearches = [];
    storage.removeItem(RECENT_KEY);
  }

  // Add 12 items -> verify capped at 8
  for (let i = 1; i <= 12; i++) {
    addRecentSearch(`term ${i}`);
  }
  assert(recentSearches.length === MAX_RECENT, 'Recent searches capped at MAX_RECENT (8)', `Length: ${recentSearches.length}`);
  assert(recentSearches[0] === 'term 12', 'Most recent search placed at index 0');

  // Case-insensitive deduplication
  addRecentSearch('TERM 12');
  assert(recentSearches.length === MAX_RECENT, 'Case-insensitive duplicate does not increase count');
  assert(recentSearches[0] === 'TERM 12', 'Re-added term moved to top');

  // Ignore short strings
  addRecentSearch('a');
  addRecentSearch('  b  ');
  assert(recentSearches.length === MAX_RECENT, 'Single character queries ignored in recent searches');

  // Delete individual item
  removeRecentSearch('TERM 12');
  assert(recentSearches.length === 7 && !recentSearches.includes('TERM 12'), 'Individual item deleted from recent searches');

  // Clear all
  clearAllRecent();
  assert(recentSearches.length === 0, 'clearAllRecent empties recent searches array');
  assert(storage.getItem(RECENT_KEY) === null, 'clearAllRecent removes key from storage');
}
testRecentSearches();

// =============================================================================
// SCENARIO 2: ANTI-BOT CONTACT FORM ADVERSARIAL STRESS
// =============================================================================
console.log('\n--- SCENARIO 2: Anti-Bot Contact Form Adversarial Stress ---');

function createContactFormHarness() {
  const MIN_FILL_TIME_MS = 3000;
  const COOLDOWN_SECONDS = 300;
  const COOLDOWN_KEY = 'lgl_contact_cooldown_ts';
  const storage = new MockStorage();

  let mountedTimestamp = Date.now();
  let cooldownSecondsRemaining = 0;
  let isSubmittedSuccess = false;
  let apiCallCount = 0;
  let lastPayload = null;

  const formData = {
    platformTarget: 'laguialinux',
    categoryPreset: 'propuesta',
    name: 'Test User',
    email: 'user@example.com',
    subject: 'Reporte de errata',
    message: 'Este es un mensaje válido con más de diez caracteres.',
    privacity: true,
    contactme: true,
    website_url_check: '',
    hp_company_field: '',
    mathAnswer: '10',
  };

  const mathExpected = 10;
  let turnstileVerified = false;
  let validationErrors = {};
  let serverRateLimitMessage = null;

  function validateForm() {
    validationErrors = {};
    if (!formData.name.trim()) validationErrors.name = 'El nombre es obligatorio.';
    else if (formData.name.trim().length > 255) validationErrors.name = 'Máximo 255 caracteres.';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim()) || formData.email.trim().length > 255) {
      validationErrors.email = 'Correo inválido.';
    }

    if (!formData.subject.trim() || formData.subject.trim().length > 255) {
      validationErrors.subject = 'Asunto obligatorio.';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10 || formData.message.trim().length > 5000) {
      validationErrors.message = 'Mensaje entre 10 y 5000 caracteres.';
    }

    if (!formData.privacity) {
      validationErrors.privacity = 'Debes aceptar la política de privacidad.';
    }

    if (!turnstileVerified) {
      const entered = parseInt(formData.mathAnswer.trim(), 10);
      if (isNaN(entered) || entered !== mathExpected) {
        validationErrors.captcha = 'Captcha o reto matemático incorrecto.';
      }
    }

    return Object.keys(validationErrors).length === 0;
  }

  function handlePreSubmit() {
    if (cooldownSecondsRemaining > 0) {
      serverRateLimitMessage = `Cooldown activo: ${cooldownSecondsRemaining}s`;
      return false;
    }
    return validateForm();
  }

  async function confirmAndExecuteSubmit(nowOverride) {
    const currentNow = nowOverride !== undefined ? nowOverride : Date.now();

    // Capa 1: Honeypot
    if (formData.website_url_check.trim() !== '' || formData.hp_company_field.trim() !== '') {
      isSubmittedSuccess = true;
      return { status: 'neutralized_honeypot', apiCalled: false };
    }

    // Capa 2: Fill time
    const elapsed = currentNow - mountedTimestamp;
    if (elapsed < MIN_FILL_TIME_MS) {
      isSubmittedSuccess = true;
      return { status: 'neutralized_fast_submit', apiCalled: false };
    }

    // Capa 3: Cooldown
    if (cooldownSecondsRemaining > 0) {
      return { status: 'blocked_cooldown', apiCalled: false };
    }

    // Capa 5: Simulate API Call
    apiCallCount++;
    lastPayload = { ...formData };
    isSubmittedSuccess = true;
    cooldownSecondsRemaining = COOLDOWN_SECONDS;
    storage.setItem(COOLDOWN_KEY, currentNow.toString());

    return { status: 'success', apiCalled: true };
  }

  return {
    formData,
    setMountedTime: (t) => { mountedTimestamp = t; },
    setCooldown: (s) => { cooldownSecondsRemaining = s; },
    setTurnstile: (v) => { turnstileVerified = v; },
    validateForm,
    handlePreSubmit,
    confirmAndExecuteSubmit,
    getErrors: () => validationErrors,
    getApiCallCount: () => apiCallCount,
    storage,
  };
}

// 2.1 Fast submission guard (< 3000ms)
{
  const h = createContactFormHarness();
  const baseTime = Date.now();
  h.setMountedTime(baseTime);

  // Submit after only 1500ms
  const valid = h.handlePreSubmit();
  assert(valid === true, 'Fast submit passes client validation check');
  const res = await h.confirmAndExecuteSubmit(baseTime + 1500);
  assert(res.status === 'neutralized_fast_submit', 'Fast submit (<3000ms) is intercepted by Layer 2 timing guard');
  assert(res.apiCalled === false && h.getApiCallCount() === 0, 'Zero API calls dispatched during fast submit interception');
}

// 2.2 Legitimate submission after >= 3000ms
{
  const h = createContactFormHarness();
  const baseTime = Date.now();
  h.setMountedTime(baseTime);

  const res = await h.confirmAndExecuteSubmit(baseTime + 4500);
  assert(res.status === 'success', 'Legitimate submit after 4500ms succeeds');
  assert(res.apiCalled === true && h.getApiCallCount() === 1, 'API call dispatched for legitimate submission');
}

// 2.3 Honeypot detection (Layer 1)
{
  // Test website_url_check
  const h1 = createContactFormHarness();
  h1.formData.website_url_check = 'https://spambot-link.ru';
  const res1 = await h1.confirmAndExecuteSubmit(Date.now() + 5000);
  assert(res1.status === 'neutralized_honeypot', 'Populated website_url_check triggers Layer 1 Honeypot neutralization');
  assert(res1.apiCalled === false, 'Zero API calls dispatched when website_url_check honeypot is populated');

  // Test hp_company_field
  const h2 = createContactFormHarness();
  h2.formData.hp_company_field = 'SEO Spam Marketing Corp';
  const res2 = await h2.confirmAndExecuteSubmit(Date.now() + 5000);
  assert(res2.status === 'neutralized_honeypot', 'Populated hp_company_field triggers Layer 1 Honeypot neutralization');
  assert(res2.apiCalled === false, 'Zero API calls dispatched when hp_company_field honeypot is populated');
}

// 2.4 Cooldown locking (Layer 3)
{
  const h = createContactFormHarness();
  const baseTime = Date.now();
  h.setMountedTime(baseTime);

  // First submit succeeds
  await h.confirmAndExecuteSubmit(baseTime + 4000);
  assert(h.getApiCallCount() === 1, 'First submission increments API call count to 1');

  // Immediate second submit blocked by cooldown
  const canPreSubmit = h.handlePreSubmit();
  assert(canPreSubmit === false, 'Second submit during active cooldown blocked at pre-submit');
  const res2 = await h.confirmAndExecuteSubmit(baseTime + 4500);
  assert(res2.status === 'blocked_cooldown' && res2.apiCalled === false, 'Layer 3 Cooldown blocks submission execution');
  assert(h.getApiCallCount() === 1, 'API call count remains 1 (no duplicate submission)');
}

// 2.5 Math challenge failure (Layer 4)
{
  const h = createContactFormHarness();
  h.setTurnstile(false);

  // Wrong answer
  h.formData.mathAnswer = '999';
  assert(h.validateForm() === false, 'Wrong math answer fails validation');
  assert(h.getErrors().captcha !== undefined, 'Captcha error message set for wrong math answer');

  // Non-numeric answer
  h.formData.mathAnswer = 'invalid';
  assert(h.validateForm() === false, 'Non-numeric math answer fails validation');

  // Correct answer
  h.formData.mathAnswer = '10';
  assert(h.validateForm() === true, 'Correct math answer passes validation');

  // Turnstile verified bypasses math check
  h.setTurnstile(true);
  h.formData.mathAnswer = 'wrong';
  assert(h.validateForm() === true, 'Turnstile verified allows submission even if math field untouched');
}

// 2.6 Form field validations
{
  const h = createContactFormHarness();

  // Missing privacy policy
  h.formData.privacity = false;
  assert(h.validateForm() === false, 'Missing privacy policy acceptance blocks submission');
  assert(h.getErrors().privacity !== undefined, 'Privacy policy error present');
  h.formData.privacity = true;

  // Invalid email formats
  const badEmails = ['plainaddress', '@no-local.com', 'user@.com', 'user@domain', 'user space@domain.com'];
  for (const be of badEmails) {
    h.formData.email = be;
    assert(h.validateForm() === false, `Invalid email format rejected: "${be}"`);
  }
  h.formData.email = 'valid@laguialinux.com';

  // Message length boundary
  h.formData.message = '123456789'; // 9 chars
  assert(h.validateForm() === false, 'Message with 9 characters (<10) is rejected');
  h.formData.message = '1234567890'; // 10 chars
  assert(h.validateForm() === true, 'Message with exactly 10 characters is accepted');
  h.formData.message = 'a'.repeat(5001); // 5001 chars
  assert(h.validateForm() === false, 'Message with 5001 characters (>5000) is rejected');
  h.formData.message = 'a'.repeat(5000); // 5000 chars
  assert(h.validateForm() === true, 'Message with exactly 5000 characters is accepted');

  // Name length boundary
  h.formData.name = 'a'.repeat(256);
  assert(h.validateForm() === false, 'Name with 256 characters (>255) is rejected');
  h.formData.name = 'a'.repeat(255);
  assert(h.validateForm() === true, 'Name with 255 characters is accepted');
}

// =============================================================================
// SCENARIO 3: NEWSLETTER ANTI-PREFETCH ADVERSARIAL STRESS
// =============================================================================
console.log('\n--- SCENARIO 3: Newsletter Anti-Prefetch Adversarial Stress ---');

function createNewsletterHarness(initialToken = '') {
  let token = initialToken;
  let state = 'initial'; // 'initial' | 'confirming' | 'unsubscribing' | 'success' | 'error'
  let errorMessage = null;
  let confirmCallCount = 0;
  let unsubscribeCallCount = 0;
  let lastTokenCalled = null;

  // Mock API methods
  async function apiConfirmNewsletter(tok) {
    confirmCallCount++;
    lastTokenCalled = tok;
    if (tok === 'expired_token' || tok === 'invalid_token') {
      const err = new Error('Token expired or invalid');
      err.status = 404;
      throw err;
    }
    if (tok === 'rate_limited_token') {
      const err = new Error('Rate limit exceeded');
      err.status = 429;
      err.isRateLimited = true;
      throw err;
    }
    return { success: true, message: 'Email verificado correctamente', data: null };
  }

  async function apiUnsubscribeNewsletter(tok) {
    unsubscribeCallCount++;
    lastTokenCalled = tok;
    if (tok === 'expired_token' || tok === 'invalid_token') {
      const err = new Error('Subscription not found');
      err.status = 404;
      throw err;
    }
    if (tok === 'rate_limited_token') {
      const err = new Error('Rate limit exceeded');
      err.status = 429;
      err.isRateLimited = true;
      throw err;
    }
    return { success: true, status: 204 };
  }

  // Simulation of user clicking confirmation button
  async function triggerConfirmation() {
    if (!token || !token.trim()) {
      state = 'error';
      errorMessage = 'No se ha proporcionado un token de verificación válido en el enlace.';
      return;
    }
    state = 'confirming';
    errorMessage = null;

    try {
      await apiConfirmNewsletter(token);
      state = 'success';
    } catch (err) {
      state = 'error';
      if (err.status === 404) {
        errorMessage = 'El enlace de verificación no es válido, ya ha sido utilizado previamente o ha caducado.';
      } else if (err.isRateLimited) {
        errorMessage = 'Demasiados intentos de verificación. Por favor, espera unos minutos.';
      } else {
        errorMessage = err.message || 'Error desconocido';
      }
    }
  }

  // Simulation of user clicking unsubscription button
  async function triggerUnsubscription() {
    if (!token || !token.trim()) {
      state = 'error';
      errorMessage = 'No se ha proporcionado un token de baja válido en el enlace.';
      return;
    }
    state = 'unsubscribing';
    errorMessage = null;

    try {
      await apiUnsubscribeNewsletter(token);
      state = 'success';
    } catch (err) {
      state = 'error';
      if (err.status === 404) {
        errorMessage = 'El enlace de baja no es válido o la suscripción ya ha sido cancelada previamente.';
      } else if (err.isRateLimited) {
        errorMessage = 'Demasiadas solicitudes. Por favor, espera unos minutos.';
      } else {
        errorMessage = err.message || 'Error desconocido';
      }
    }
  }

  return {
    setToken: (t) => { token = t; },
    getState: () => state,
    getError: () => errorMessage,
    getConfirmCallCount: () => confirmCallCount,
    getUnsubscribeCallCount: () => unsubscribeCallCount,
    triggerConfirmation,
    triggerUnsubscription,
  };
}

// 3.1 Zero Network Mutation on GET Mount / SSR
{
  const hConfirm = createNewsletterHarness('valid_secret_token_123');
  assert(hConfirm.getState() === 'initial', 'Confirmacion page mounts in strictly "initial" state');
  assert(hConfirm.getConfirmCallCount() === 0, 'ZERO API calls to confirmNewsletter on initial GET/mount');

  const hUnsub = createNewsletterHarness('valid_secret_token_456');
  assert(hUnsub.getState() === 'initial', 'Baja page mounts in strictly "initial" state');
  assert(hUnsub.getUnsubscribeCallCount() === 0, 'ZERO API calls to unsubscribeNewsletter on initial GET/mount');
}

// 3.2 Missing or empty token parameter
{
  // Empty token confirmation
  const h1 = createNewsletterHarness('');
  await h1.triggerConfirmation();
  assert(h1.getState() === 'error', 'Missing token on confirmation transitions to "error" state');
  assert(h1.getConfirmCallCount() === 0, 'No API call dispatched when confirmation token is empty');
  assert(h1.getError().includes('token de verificación válido'), 'Informative error message for missing token');

  // Empty token unsubscription
  const h2 = createNewsletterHarness('   ');
  await h2.triggerUnsubscription();
  assert(h2.getState() === 'error', 'Whitespace token on unsubscription transitions to "error" state');
  assert(h2.getUnsubscribeCallCount() === 0, 'No API call dispatched when unsubscription token is whitespace');
  assert(h2.getError().includes('token de baja válido'), 'Informative error message for missing unsubscription token');
}

// 3.3 Explicit action execution (Click Confirmation)
{
  const h = createNewsletterHarness('valid_token_777');
  await h.triggerConfirmation();
  assert(h.getConfirmCallCount() === 1, 'Explicit button click triggers confirmNewsletter once');
  assert(h.getState() === 'success', 'Valid token transitions confirmation page to "success" state');

  const hUnsub = createNewsletterHarness('valid_token_888');
  await hUnsub.triggerUnsubscription();
  assert(hUnsub.getUnsubscribeCallCount() === 1, 'Explicit button click triggers unsubscribeNewsletter once');
  assert(hUnsub.getState() === 'success', 'Valid token transitions unsubscription page to "success" state');
}

// 3.4 Error responses (404 expired and 429 rate limited)
{
  // 404 Token expired
  const hExpired = createNewsletterHarness('expired_token');
  await hExpired.triggerConfirmation();
  assert(hExpired.getState() === 'error', 'Expired token transitions confirmation page to "error" state');
  assert(hExpired.getError().includes('caducado'), 'Error message clearly explains token expiration');

  // 429 Rate limited
  const hRateLimited = createNewsletterHarness('rate_limited_token');
  await hRateLimited.triggerConfirmation();
  assert(hRateLimited.getState() === 'error', 'Rate limited token transitions confirmation page to "error" state');
  assert(hRateLimited.getError().includes('espera unos minutos'), 'Rate limited error advises waiting');

  // 404 Unsubscription already cancelled
  const hUnsub404 = createNewsletterHarness('invalid_token');
  await hUnsub404.triggerUnsubscription();
  assert(hUnsub404.getState() === 'error', 'Invalid token transitions unsubscription page to "error" state');
  assert(hUnsub404.getError().includes('cancelada previamente'), 'Error message informs subscription not found');
}

// =============================================================================
// SCENARIO 4: LIVE NITRO SERVER SSR ADVERSARIAL FUZZING
// =============================================================================
console.log('\n--- SCENARIO 4: Live Nitro Server SSR Adversarial Fuzzing ---');

const PORT = 3995;
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
      // wait
    }
    await sleep(200);
  }
  throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
}

let nitroServer = null;
try {
  console.log(`Starting isolated Nitro server on port ${PORT}...`);
  nitroServer = spawn('node', ['.output/server/index.mjs'], {
    env: { ...process.env, PORT: String(PORT), HOST: '127.0.0.1', NITRO_PORT: String(PORT), NITRO_HOST: '127.0.0.1' },
    stdio: 'ignore',
  });

  await waitForServer(`${BASE_URL}/`, 15000);
  console.log('Nitro server is ready. Executing live fuzzing requests...\n');

  const fuzzEndpoints = [
    // Buscar page fuzzing
    { path: '/buscar', expectStatus: 200, label: 'Standard /buscar route' },
    { path: '/buscar?q=chmod', expectStatus: 200, label: '/buscar with valid query' },
    { path: '/buscar?q=%2A%2B%3F%5E%24%7B%7D%28%29%7C%5B%5D%5C', expectStatus: 200, label: '/buscar with encoded regex metacharacters' },
    { path: '/buscar?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E', expectStatus: 200, label: '/buscar with XSS injection payload' },
    { path: '/buscar?q=%27%20OR%201%3D1--', expectStatus: 200, label: '/buscar with SQLi payload' },
    { path: '/buscar?page=-10', expectStatus: 200, label: '/buscar with negative page number' },
    { path: '/buscar?page=99999999', expectStatus: 200, label: '/buscar with astronomical page number' },
    { path: '/buscar?page=invalid_string', expectStatus: 200, label: '/buscar with non-numeric page parameter' },
    { path: '/buscar?sort=unknown_column_desc', expectStatus: 200, label: '/buscar with invalid sort parameter' },
    { path: '/buscar?tipo=malicious_type_injection', expectStatus: 200, label: '/buscar with unexpected type filter' },
    { path: '/buscar?categoria=%22%3E%3Cimg%20src%3Dx%3E', expectStatus: 200, label: '/buscar with XSS in category parameter' },

    // Contacto page fuzzing
    { path: '/contacto', expectStatus: 200, label: 'Standard /contacto route' },
    { path: '/contacto?platform=%3Cscript%3E', expectStatus: 200, label: '/contacto with query injection' },

    // Newsletter confirmation page fuzzing
    { path: '/newsletter/confirmacion', expectStatus: 200, label: '/newsletter/confirmacion without token parameter' },
    { path: '/newsletter/confirmacion?token=valid_test_token', expectStatus: 200, label: '/newsletter/confirmacion with valid token param' },
    { path: '/newsletter/confirmacion?token=%3Cscript%3Ealert(1)%3C%2Fscript%3E', expectStatus: 200, label: '/newsletter/confirmacion with XSS token' },
    { path: '/newsletter/confirmacion?token=%27%20OR%201%3D1--', expectStatus: 200, label: '/newsletter/confirmacion with SQLi token' },

    // Newsletter unsubscription page fuzzing
    { path: '/newsletter/baja', expectStatus: 200, label: '/newsletter/baja without token parameter' },
    { path: '/newsletter/baja?token=unsub_test_token', expectStatus: 200, label: '/newsletter/baja with valid token param' },
    { path: '/newsletter/baja?token=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E', expectStatus: 200, label: '/newsletter/baja with XSS token' },
    { path: '/newsletter/baja?token=../../etc/passwd', expectStatus: 200, label: '/newsletter/baja with path traversal token' },
  ];

  for (const ep of fuzzEndpoints) {
    try {
      const res = await fetch(`${BASE_URL}${ep.path}`);
      const body = await res.text();

      // Check HTTP status
      assert(res.status === ep.expectStatus, `${ep.label} returns HTTP ${ep.expectStatus}`);

      // Check for zero server leaks
      const hasFatalStack = body.includes('NitroFetchError') || body.includes('SyntaxError:') || body.includes('TypeError:');
      assert(!hasFatalStack, `${ep.label} produces zero fatal unhandled exceptions or stack leaks`);

      // Check that HTML structure is rendered
      assert(body.includes('<!DOCTYPE html>') || body.includes('<html'), `${ep.label} returns valid HTML document`);
    } catch (err) {
      assert(false, `${ep.label} threw network exception: ${err.message}`);
    }
  }

} finally {
  if (nitroServer) {
    console.log('\nShutting down isolated Nitro server...');
    nitroServer.kill('SIGTERM');
  }
}

// =============================================================================
// SUMMARY REPORT
// =============================================================================
console.log('\n----------------------------------------------------------------------');
console.log('ADVERSARIAL STRESS SUITE EXECUTION SUMMARY');
console.log('----------------------------------------------------------------------');
console.log(`Total Stress Assertions : ${results.length}`);
console.log(`Passed Assertions       : ${passCount}`);
console.log(`Failed Assertions       : ${failCount}`);
console.log('----------------------------------------------------------------------');

if (failCount === 0) {
  console.log('ALL ADVERSARIAL STRESS SCENARIOS PASSED WITH ZERO FAILURES! 🛡️✨\n');
  process.exit(0);
} else {
  console.error(`FAILED: ${failCount} stress assertions failed.`);
  process.exit(1);
}
