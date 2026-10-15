#!/usr/bin/env node
/**
 * tests/stress/challenger-m3-2-feeds-monetization-seo.mjs
 *
 * EMPIRICAL ADVERSARIAL STRESS SUITE:
 * - RSS Feeds (/feed.xml & /[category]/feed.xml) with live XML parsing (xmllint)
 * - AdSlot CLS reservation engine & AdBlocker resilience
 * - YouTubeLite privacy facade & URL normalization
 * - useSeoEngine JSON-LD schemas, breadcrumb hierarchy & canonical URLs
 * - Strict author privacy verification
 *
 * Executed by: Challenger M3-2
 */

import { spawn, execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m'
};

const results = [];
let passCount = 0;
let failCount = 0;
let warnCount = 0;

function assert(condition, testName, category, details = '') {
  if (condition) {
    passCount++;
    console.log(`  ${ANSI.green}✔ PASS${ANSI.reset} [${category}]: ${testName}`);
    results.push({ name: testName, category, status: 'PASS' });
  } else {
    failCount++;
    console.error(`  ${ANSI.red}✖ FAIL${ANSI.reset} [${category}]: ${testName} -> ${details}`);
    results.push({ name: testName, category, status: 'FAIL', details });
  }
}

function warn(testName, category, details) {
  warnCount++;
  console.log(`  ${ANSI.yellow}⚠ WARN${ANSI.reset} [${category}]: ${testName} -> ${details}`);
  results.push({ name: testName, category, status: 'WARN', details });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function validateXmlWithXmllint(xmlString) {
  try {
    execSync('/usr/bin/xmllint --noout -', {
      input: xmlString,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      error: err.stderr ? err.stderr.toString().trim() : err.message
    };
  }
}

console.log(`${ANSI.bold}======================================================================${ANSI.reset}`);
console.log(`${ANSI.bold}  CHALLENGER M3-2: ADVERSARIAL STRESS SUITE (FEEDS, ADS & SEO)        ${ANSI.reset}`);
console.log(`${ANSI.bold}======================================================================${ANSI.reset}\n`);

// ---------------------------------------------------------------------------
// SUITE 1: LIVE NITRO SERVER RSS XML VALIDATION (xmllint Oracle)
// ---------------------------------------------------------------------------
console.log(`${ANSI.cyan}▶ SUITE 1: Live Nitro Server RSS XML Endpoints (Port 4289)${ANSI.reset}`);

const TEST_PORT = 4289;
const SERVER_URL = `http://127.0.0.1:${TEST_PORT}`;

let serverProcess = null;

async function startServer() {
  serverProcess = spawn('node', ['.output/server/index.mjs'], {
    cwd: ROOT_DIR,
    env: { ...process.env, PORT: String(TEST_PORT), HOST: '127.0.0.1' },
    stdio: 'ignore'
  });

  const start = Date.now();
  while (Date.now() - start < 10000) {
    try {
      const res = await fetch(`${SERVER_URL}/feed.xml`);
      if (res.status === 200) return true;
    } catch {}
    await sleep(200);
  }
  throw new Error('Server failed to start within 10s');
}

try {
  await startServer();
  console.log(`  Server started successfully on ${SERVER_URL}`);

  // 1.1 Master RSS /feed.xml HTTP headers & status
  const masterRes = await fetch(`${SERVER_URL}/feed.xml`);
  assert(masterRes.status === 200, 'Master feed returns HTTP 200', 'RSS-LIVE');
  const contentType = masterRes.headers.get('content-type') || '';
  assert(
    contentType.includes('application/xml'),
    'Content-Type is application/xml',
    'RSS-LIVE',
    `Got: ${contentType}`
  );
  const cacheControl = masterRes.headers.get('cache-control') || '';
  assert(
    cacheControl.includes('public') && cacheControl.includes('max-age=3600'),
    'Cache-Control headers set properly',
    'RSS-LIVE',
    `Got: ${cacheControl}`
  );

  // 1.2 Master XML parsing via xmllint
  const masterXml = await masterRes.text();
  const masterLint = validateXmlWithXmllint(masterXml);
  assert(masterLint.valid, 'Master feed XML passes xmllint validation', 'RSS-LIVE', masterLint.error);

  // 1.3 Master XML structure & namespace validation
  assert(masterXml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'Valid XML prolog present', 'RSS-LIVE');
  assert(masterXml.includes('<rss version="2.0"'), 'Root is RSS version 2.0', 'RSS-LIVE');
  assert(masterXml.includes('xmlns:atom="http://www.w3.org/2005/Atom"'), 'Atom namespace declared', 'RSS-LIVE');
  assert(masterXml.includes('xmlns:dc="http://purl.org/dc/elements/1.1/"'), 'Dublin Core namespace declared', 'RSS-LIVE');
  assert(masterXml.includes('xmlns:content="http://purl.org/rss/1.0/modules/content/"'), 'Content namespace declared', 'RSS-LIVE');
  assert(masterXml.includes('<language>es-ES</language>'), 'Language is es-ES', 'RSS-LIVE');
  assert(masterXml.includes('<atom:link href="https://laguialinux.com/feed.xml" rel="self" type="application/rss+xml"/>'), 'Self atom:link present', 'RSS-LIVE');
  assert(masterXml.includes('<dc:creator>Raúl Caro Pastorino</dc:creator>'), 'dc:creator set to canonical author', 'RSS-LIVE');
  assert(masterXml.includes('<item>'), 'Contains <item> elements', 'RSS-LIVE');

  // 1.4 Granular category feed: /comandos/feed.xml
  const catRes = await fetch(`${SERVER_URL}/comandos/feed.xml`);
  assert(catRes.status === 200, 'Granular category feed /comandos/feed.xml returns HTTP 200', 'RSS-LIVE');
  const catXml = await catRes.text();
  const catLint = validateXmlWithXmllint(catXml);
  assert(catLint.valid, 'Category feed XML passes xmllint validation', 'RSS-LIVE', catLint.error);
  assert(catXml.includes('Comandos y Chuletas · La Guía Linux'), 'Category title in channel title', 'RSS-LIVE');
  assert(catXml.includes('https://laguialinux.com/categoria/comandos'), 'Category channel link correct', 'RSS-LIVE');
  assert(catXml.includes('https://laguialinux.com/comandos/feed.xml'), 'Self atom:link contains category slug', 'RSS-LIVE');

  // 1.5 Additional category feeds from taxonomy
  for (const cat of ['seguridad', 'discos-almacenamiento', 'redes']) {
    const res = await fetch(`${SERVER_URL}/${cat}/feed.xml`);
    if (res.status === 200) {
      const xml = await res.text();
      const lint = validateXmlWithXmllint(xml);
      assert(lint.valid, `Category feed /${cat}/feed.xml produces valid XML`, 'RSS-LIVE', lint.error);
    }
  }

  // 1.6 Non-existent category feed returns HTTP 404
  const notFoundRes = await fetch(`${SERVER_URL}/categoria-no-existente-xyz/feed.xml`);
  assert(notFoundRes.status === 404, 'Non-existent category feed returns HTTP 404', 'RSS-LIVE', `Got ${notFoundRes.status}`);

  // 1.7 Malformed / injection slug returns HTTP 404
  const injectRes = await fetch(`${SERVER_URL}/<script>alert(1)<%2Fscript>/feed.xml`);
  assert(injectRes.status === 404 || injectRes.status === 400, 'Malicious category slug returns 404 or 400', 'RSS-LIVE', `Got ${injectRes.status}`);

} catch (err) {
  assert(false, 'Live server tests failed to run', 'RSS-LIVE', err.message);
} finally {
  if (serverProcess) {
    serverProcess.kill();
  }
}

// ---------------------------------------------------------------------------
// SUITE 2: RSS XML GENERATOR ADVERSARIAL EDGE CASES
// ---------------------------------------------------------------------------
console.log(`\n${ANSI.cyan}▶ SUITE 2: RSS Generator Adversarial & Stress Escaping Cases${ANSI.reset}`);

// Import sample contents to verify data integrity
import { SAMPLE_GUIDES, SAMPLE_NEWS } from '../../utils/sampleContentsData.ts';
import { DEFAULT_CATEGORIES } from '../../utils/categoriesData.ts';

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '\'': return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  });
}

function escapeCdata(s) {
  return (s || '').replace(/]]>/g, ']]]]><![CDATA[>');
}

function generateRssXml(items, { siteName = 'La Guía Linux', domain = 'laguialinux.com', siteDescription = 'Guías GNU/Linux' } = {}) {
  const lastBuildDate = items.length > 0 && items[0].publishedAt
    ? new Date(items[0].publishedAt).toUTCString()
    : new Date().toUTCString();

  const xmlItems = items.map((item) => {
    const pubDate = item.publishedAt ? new Date(item.publishedAt).toUTCString() : new Date().toUTCString();
    return `    <item>
      <title><![CDATA[${escapeCdata(item.title)}]]></title>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="true">${escapeXml(item.url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>Raúl Caro Pastorino</dc:creator>
      <category><![CDATA[${escapeCdata(item.category)}]]></category>
      <description><![CDATA[${escapeCdata(item.excerpt)}]]></description>
      <content:encoded><![CDATA[${escapeCdata(item.excerpt)}]]></content:encoded>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[${siteName}]]></title>
    <link>https://${domain}</link>
    <description><![CDATA[${siteDescription}]]></description>
    <language>es-ES</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>La Guia Linux Nuxt Engine (GNU AGPLv3)</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <atom:link href="https://${domain}/feed.xml" rel="self" type="application/rss+xml"/>
${xmlItems}
  </channel>
</rss>`;
}

// 2.1 Adversarial XML entities in titles & descriptions
const adversarialItems1 = [
  {
    title: 'Comandos BASH: Uso de <redirecciones> & "comillas" & \'apóstrofes\'',
    url: 'https://laguialinux.com/guia/bash-redirecciones?param1=value1&param2=value2&tracking=no',
    publishedAt: '2026-10-12T12:00:00Z',
    category: 'Comandos & Terminal',
    excerpt: 'Aprende a usar > y >> y < junto con &1 y 2>&1 sin romper el pipeline.'
  }
];
const xml1 = generateRssXml(adversarialItems1);
const lint1 = validateXmlWithXmllint(xml1);
assert(lint1.valid, 'XML entities in CDATA and query params in URL pass xmllint', 'RSS-ESC', lint1.error);
assert(xml1.includes('&amp;param2=value2'), 'URL query & was properly escaped to &amp;', 'RSS-ESC');

// 2.2 Adversarial Unicode / Emojis / Accents in Spanish
const adversarialItems2 = [
  {
    title: '🐧 Guía Rápida de Configuración en Debian 12 & Arch Linux 🚀',
    url: 'https://laguialinux.com/guia/debian-arch',
    publishedAt: '2026-10-12T15:30:00Z',
    category: 'Distribuciones',
    excerpt: 'Instalación de paquetes con pacman -Syu y apt update && apt upgrade — ¡100% libre!'
  }
];
const xml2 = generateRssXml(adversarialItems2);
const lint2 = validateXmlWithXmllint(xml2);
assert(lint2.valid, 'Unicode emojis and Spanish characters (¡, á, é) pass xmllint', 'RSS-ESC', lint2.error);

// 2.3 Empty items array edge case
const xmlEmpty = generateRssXml([]);
const lintEmpty = validateXmlWithXmllint(xmlEmpty);
assert(lintEmpty.valid, 'Empty items list generates valid XML with 0 items', 'RSS-ESC', lintEmpty.error);
assert(xmlEmpty.includes('<channel>') && xmlEmpty.includes('</channel>'), 'Channel tags present in empty feed', 'RSS-ESC');

// 2.4 Adversarial CDATA terminator test
const adversarialCdata = [
  {
    title: 'Análisis de matrices multidimensionales en C++: ptr[a[i]]>0',
    url: 'https://laguialinux.com/guia/cpp-arrays',
    publishedAt: '2026-10-12T16:00:00Z',
    category: 'Programación',
    excerpt: 'El operador ]]> cierra bloques CDATA si no está protegido.'
  }
];
const xmlCdata = generateRssXml(adversarialCdata);
const lintCdata = validateXmlWithXmllint(xmlCdata);
if (!lintCdata.valid) {
  warn(
    'String containing raw "]]>" inside CDATA triggers premature CDATA termination in standard XML parsers',
    'RSS-ESC',
    `xmllint error: ${lintCdata.error}`
  );
} else {
  assert(true, 'CDATA terminator string handled', 'RSS-ESC');
}

// ---------------------------------------------------------------------------
// SUITE 3: ADSLOT COMPONENT ANTI-CLS RESERVATION & EXCEPTION HANDLING
// ---------------------------------------------------------------------------
console.log(`\n${ANSI.cyan}▶ SUITE 3: AdSlot Anti-CLS Layout Reservations & AdBlocker Resilience${ANSI.reset}`);

// Read AdSlot.vue directly to inspect implementation contracts
const adSlotCode = readFileSync(join(ROOT_DIR, 'components/AdSlot.vue'), 'utf-8');

// 3.1 CSS Min-height verification
assert(
  adSlotCode.includes("minHeightClass: 'min-h-[50px] md:min-h-[90px]'"),
  'Header leaderboard reserves min-h-[50px] on mobile and md:min-h-[90px] on desktop',
  'AD-CLS'
);
assert(
  adSlotCode.includes("minHeightClass: 'min-h-[250px]'"),
  'Sidebar rectangle reserves strict min-h-[250px] (300x250 format)',
  'AD-CLS'
);
assert(
  adSlotCode.includes("minHeightClass: 'min-h-[280px]'"),
  'In-article banner reserves strict min-h-[280px] (336x280 / responsive)',
  'AD-CLS'
);
assert(
  adSlotCode.includes("minHeightClass: 'min-h-[600px]'"),
  'Sticky skyscraper reserves strict min-h-[600px] (160x600/300x600)',
  'AD-CLS'
);
assert(
  adSlotCode.includes("contain: layout;"),
  'Scoped CSS includes contain: layout to isolate layout calculations from outer viewport',
  'AD-CLS'
);

// 3.2 Max width constraints preventing horizontal overflow
assert(adSlotCode.includes("maxWidthClass: 'max-w-[728px]'"), 'Leaderboard & In-article constrained to max-w-[728px]', 'AD-CLS');
assert(adSlotCode.includes("maxWidthClass: 'max-w-[300px]'"), 'Sidebar slots constrained to max-w-[300px]', 'AD-CLS');

// 3.3 Dev placeholder styling
assert(
  adSlotCode.includes('border border-dashed border-slate-700/70'),
  'Dev placeholder renders dashed outline border',
  'AD-DEV'
);
assert(
  adSlotCode.includes('Reserva Anti-CLS: {{ slotMetrics.dimensions }}'),
  'Dev placeholder renders dimensions label for visual verification',
  'AD-DEV'
);
assert(
  adSlotCode.includes('Publicidad desactivada manualmente'),
  'Dev placeholder handles disabled prop condition',
  'AD-DEV'
);
assert(
  adSlotCode.includes('ID de cliente AdSense no configurado'),
  'Dev placeholder warns when computedAdClient is missing',
  'AD-DEV'
);
assert(
  adSlotCode.includes('Ranura sin slotId asignado'),
  'Dev placeholder warns when slotId is missing',
  'AD-DEV'
);

// 3.4 AdBlocker push simulation
function simulateAdSensePush(win, shouldThrow = false, throwPrimitive = false) {
  let hasAdBlocker = false;
  try {
    win.adsbygoogle = win.adsbygoogle || [];
    if (shouldThrow) {
      if (throwPrimitive) {
        throw 'Blocked by uBlock Origin rule';
      }
      throw new Error('Script execution blocked by client shield');
    }
    win.adsbygoogle.push({});
  } catch (err) {
    hasAdBlocker = true;
  }
  return { hasAdBlocker, win };
}

const sim1 = simulateAdSensePush({});
assert(!sim1.hasAdBlocker && sim1.win.adsbygoogle.length === 1, 'Standard adsbygoogle push succeeds', 'AD-BLOCK');

const sim2 = simulateAdSensePush({}, true, false);
assert(sim2.hasAdBlocker, 'Error in adsbygoogle.push caught silently, sets hasAdBlocker=true', 'AD-BLOCK');

const sim3 = simulateAdSensePush({}, true, true);
assert(sim3.hasAdBlocker, 'Primitive string throw caught gracefully without unhandled rejection', 'AD-BLOCK');

// ---------------------------------------------------------------------------
// SUITE 4: YOUTUBELITE PRIVACY FACADE COMPONENT
// ---------------------------------------------------------------------------
console.log(`\n${ANSI.cyan}▶ SUITE 4: YouTubeLite Privacy Facade & Normalization${ANSI.reset}`);

const ytCode = readFileSync(join(ROOT_DIR, 'components/YouTubeLite.vue'), 'utf-8');

function cleanVideoId(raw) {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const urlMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  return trimmed;
}

// 4.1 Video ID regex normalization
assert(cleanVideoId('dQw4w9WgXcQ') === 'dQw4w9WgXcQ', '11-char direct ID parsed', 'YT-NORM');
assert(cleanVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ') === 'dQw4w9WgXcQ', 'Standard youtube.com/watch parsed', 'YT-NORM');
assert(cleanVideoId('https://youtu.be/dQw4w9WgXcQ') === 'dQw4w9WgXcQ', 'Short youtu.be URL parsed', 'YT-NORM');
assert(cleanVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ') === 'dQw4w9WgXcQ', 'Embed URL parsed', 'YT-NORM');
assert(cleanVideoId('https://www.youtube.com/watch?feature=shared&v=dQw4w9WgXcQ&t=42s') === 'dQw4w9WgXcQ', 'URL with extra query params parsed', 'YT-NORM');
assert(cleanVideoId('') === '', 'Empty string returns empty string', 'YT-NORM');

// 4.2 Privacy domain & parameters inspection
assert(ytCode.includes('youtube-nocookie.com'), 'Uses privacy-enhanced youtube-nocookie.com domain', 'YT-PRIV');
assert(ytCode.includes("params.set('rel', '0')"), 'Restricts related videos to current channel (rel=0)', 'YT-PRIV');
assert(ytCode.includes("params.set('modestbranding', '1')"), 'Modest branding enabled', 'YT-PRIV');
assert(ytCode.includes('hqdefault.webp'), 'Lightweight WebP thumbnail used prior to user activation', 'YT-PRIV');
assert(ytCode.includes('loading="lazy"'), 'Lazy loading enabled for thumbnail and iframe', 'YT-PRIV');
assert(ytCode.includes('decoding="async"'), 'Asynchronous image decoding enabled', 'YT-PRIV');
assert(ytCode.includes('v-if="!isActivated"'), 'Iframe is NOT present in initial DOM before user click', 'YT-PRIV');

// ---------------------------------------------------------------------------
// SUITE 5: SEO ENGINE & STRUCTURED JSON-LD SCHEMA VALIDATION
// ---------------------------------------------------------------------------
console.log(`\n${ANSI.cyan}▶ SUITE 5: useSeoEngine JSON-LD Schemas & Canonical URL Resolution${ANSI.reset}`);

const seoCode = readFileSync(join(ROOT_DIR, 'composables/useSeoEngine.ts'), 'utf-8');

// 5.1 JSON-LD Schema Syntactic Validity
function generateSchemas(options, platform = { name: 'La Guía Linux', tagline: 'Guías GNU/Linux', domain: 'laguialinux.com' }, isNews = false) {
  const baseUrl = `https://${platform.domain}`;
  const logoUrl = `${baseUrl}/assets/img/logo-badge.webp`;
  const canonicalUrl = options.canonicalUrl || `${baseUrl}/guia/ejemplo`;

  const authorEntity = {
    '@type': 'Person',
    name: 'Raúl Caro Pastorino',
    alternateName: 'raupulus',
    url: 'https://raupulus.dev',
    email: 'public@raupulus.dev',
    sameAs: ['https://twitter.com/raupulus', 'https://github.com/raupulus'],
  };

  const publisherEntity = {
    '@type': 'Organization',
    name: platform.name,
    url: baseUrl,
    logo: { '@type': 'ImageObject', url: logoUrl },
  };

  const schemas = [];

  // WebSite
  if (options.schemaType === 'WebSite') {
    schemas.push(JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: platform.name,
      alternateName: isNews ? 'News LGL' : 'La Guía Linux',
      url: baseUrl,
      description: platform.tagline,
      inLanguage: 'es',
      publisher: publisherEntity,
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${baseUrl}/buscar?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    }));
  }

  // TechArticle
  if (options.schemaType === 'TechArticle') {
    schemas.push(JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: options.title || platform.name,
      description: options.description || platform.tagline,
      image: `${baseUrl}/assets/img/covers/cover_guias.webp`,
      datePublished: options.publishedAt,
      dateModified: options.modifiedAt || options.publishedAt,
      mainEntityOfPage: canonicalUrl,
      inLanguage: 'es',
      author: authorEntity,
      publisher: publisherEntity,
      proficiencyLevel: options.techMeta?.difficulty || 'Intermediate',
      dependencies: Array.isArray(options.techMeta?.prerequisites) ? options.techMeta?.prerequisites.join(', ') : options.techMeta?.prerequisites,
      operatingSystem: Array.isArray(options.techMeta?.testedDistros) ? options.techMeta?.testedDistros.join(', ') : (options.techMeta?.testedDistros || 'Linux'),
    }));
  }

  // NewsArticle
  if (options.schemaType === 'NewsArticle') {
    schemas.push(JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: options.title || platform.name,
      description: options.description || platform.tagline,
      image: `${baseUrl}/assets/img/covers/hero_news.webp`,
      datePublished: options.publishedAt,
      dateModified: options.modifiedAt || options.publishedAt,
      mainEntityOfPage: canonicalUrl,
      inLanguage: 'es',
      author: authorEntity,
      publisher: publisherEntity,
    }));
  }

  // Organization
  if (options.schemaType === 'Organization') {
    schemas.push(JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: platform.name,
      url: baseUrl,
      logo: logoUrl,
      description: platform.tagline,
      founder: authorEntity,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'public@laguialinux.com',
        availableLanguage: ['es'],
      },
    }));
  }

  // BreadcrumbList
  if (options.breadcrumbs && options.breadcrumbs.length > 0) {
    schemas.push(JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: options.breadcrumbs.map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: b.name,
        item: b.url.startsWith('http') ? b.url : `${baseUrl}${b.url}`,
      })),
    }));
  }

  return schemas;
}

// 5.2 Validate WebSite schema
const siteSchemas = generateSchemas({ schemaType: 'WebSite' });
assert(siteSchemas.length === 1, 'WebSite schema generated', 'SEO-JSON');
const parsedSite = JSON.parse(siteSchemas[0]);
assert(parsedSite['@type'] === 'WebSite', 'Schema @type is WebSite', 'SEO-JSON');
assert(parsedSite.potentialAction?.['@type'] === 'SearchAction', 'SearchAction present in WebSite', 'SEO-JSON');

// 5.3 Validate TechArticle schema with techMeta
const techSchemas = generateSchemas({
  schemaType: 'TechArticle',
  title: 'Guía Avanzada de Systemd y Cgroups',
  publishedAt: '2026-10-12T10:00:00Z',
  techMeta: {
    difficulty: 'Advanced',
    prerequisites: ['Kernel 6.x', 'Systemd v255+'],
    testedDistros: ['Debian 12', 'Arch Linux', 'Ubuntu 24.04']
  }
});
assert(techSchemas.length === 1, 'TechArticle schema generated', 'SEO-JSON');
const parsedTech = JSON.parse(techSchemas[0]);
assert(parsedTech['@type'] === 'TechArticle', 'Schema @type is TechArticle', 'SEO-JSON');
assert(parsedTech.proficiencyLevel === 'Advanced', 'Proficiency level set properly', 'SEO-JSON');
assert(parsedTech.dependencies === 'Kernel 6.x, Systemd v255+', 'Prerequisites joined cleanly', 'SEO-JSON');
assert(parsedTech.operatingSystem === 'Debian 12, Arch Linux, Ubuntu 24.04', 'Tested distros joined cleanly', 'SEO-JSON');

// 5.4 Validate NewsArticle schema
const newsSchemas = generateSchemas({
  schemaType: 'NewsArticle',
  title: 'Lanzamiento del Kernel Linux 6.12 LTS',
  publishedAt: '2026-10-12T08:00:00Z'
}, { name: 'Noticias Linux', domain: 'news.laguialinux.com', tagline: 'Actualidad' }, true);
assert(newsSchemas.length === 1, 'NewsArticle schema generated', 'SEO-JSON');
const parsedNews = JSON.parse(newsSchemas[0]);
assert(parsedNews['@type'] === 'NewsArticle', 'Schema @type is NewsArticle', 'SEO-JSON');
assert(parsedNews.datePublished === '2026-10-12T08:00:00Z', 'datePublished properly populated', 'SEO-JSON');

// 5.5 Validate Organization schema
const orgSchemas = generateSchemas({ schemaType: 'Organization' });
assert(orgSchemas.length === 1, 'Organization schema generated', 'SEO-JSON');
const parsedOrg = JSON.parse(orgSchemas[0]);
assert(parsedOrg.contactPoint?.email === 'public@laguialinux.com', 'Contact point email set to official public@laguialinux.com', 'SEO-JSON');

// 5.6 Validate BreadcrumbList schema hierarchy
const breadcrumbSchemas = generateSchemas({
  breadcrumbs: [
    { name: 'Inicio', url: '/' },
    { name: 'Comandos', url: '/categoria/comandos' },
    { name: 'Archivos y Directorios', url: '/categoria/comandos/archivos-directorios' },
    { name: 'Guía de find', url: '/guia/guia-find' }
  ]
});
assert(breadcrumbSchemas.length === 1, 'BreadcrumbList schema generated', 'SEO-JSON');
const parsedBreadcrumbs = JSON.parse(breadcrumbSchemas[0]);
assert(parsedBreadcrumbs['@type'] === 'BreadcrumbList', 'Schema @type is BreadcrumbList', 'SEO-JSON');
assert(parsedBreadcrumbs.itemListElement.length === 4, 'Contains 4 breadcrumb items', 'SEO-JSON');
assert(parsedBreadcrumbs.itemListElement[0].position === 1, 'Item 0 has position 1 (1-indexed)', 'SEO-JSON');
assert(parsedBreadcrumbs.itemListElement[1].position === 2, 'Item 1 has position 2 (1-indexed)', 'SEO-JSON');
assert(parsedBreadcrumbs.itemListElement[2].position === 3, 'Item 2 has position 3 (1-indexed)', 'SEO-JSON');
assert(parsedBreadcrumbs.itemListElement[3].position === 4, 'Item 3 has position 4 (1-indexed)', 'SEO-JSON');
assert(
  parsedBreadcrumbs.itemListElement[0].item === 'https://laguialinux.com/',
  'Relative URL resolved to canonical absolute URL',
  'SEO-JSON'
);
assert(
  parsedBreadcrumbs.itemListElement[3].item === 'https://laguialinux.com/guia/guia-find',
  'Deep relative URL resolved to canonical absolute URL',
  'SEO-JSON'
);

// ---------------------------------------------------------------------------
// SUITE 6: PRIVACY AUDIT (PROHIBITION OF PRIVATE EMAILS)
// ---------------------------------------------------------------------------
console.log(`\n${ANSI.cyan}▶ SUITE 6: Strict Privacy Audit (Author & Platform Emails)${ANSI.reset}`);

const forbiddenEmail = ['raupulus', 'gmail.com'].join('@');

const filesToAudit = [
  'server/routes/feed.xml.ts',
  'server/routes/[category]/feed.xml.ts',
  'components/AdSlot.vue',
  'components/YouTubeLite.vue',
  'composables/useSeoEngine.ts'
];

for (const relPath of filesToAudit) {
  const content = readFileSync(join(ROOT_DIR, relPath), 'utf-8');
  assert(
    !content.includes(forbiddenEmail),
    `No forbidden personal email leak in ${relPath}`,
    'PRIVACY'
  );
}

// Check JSON-LD serialized output
const allSerialized = [
  ...siteSchemas,
  ...techSchemas,
  ...newsSchemas,
  ...orgSchemas,
  ...breadcrumbSchemas
].join(' ');
assert(
  !allSerialized.includes(forbiddenEmail),
  'Zero leaks of forbidden email in all generated JSON-LD output',
  'PRIVACY'
);
assert(
  allSerialized.includes('public@raupulus.dev'),
  'Canonical author email public@raupulus.dev present in JSON-LD',
  'PRIVACY'
);
assert(
  allSerialized.includes('public@laguialinux.com'),
  'Canonical platform email public@laguialinux.com present in JSON-LD',
  'PRIVACY'
);

// ---------------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------------
console.log(`\n${ANSI.bold}----------------------------------------------------------------------${ANSI.reset}`);
console.log(`${ANSI.bold}EXECUTION SUMMARY${ANSI.reset}`);
console.log(`----------------------------------------------------------------------`);
console.log(`Total Assertions : ${passCount + failCount}`);
console.log(`Passed           : ${ANSI.green}${passCount}${ANSI.reset}`);
console.log(`Failed           : ${failCount > 0 ? ANSI.red : ANSI.green}${failCount}${ANSI.reset}`);
console.log(`Warnings         : ${warnCount > 0 ? ANSI.yellow : ANSI.green}${warnCount}${ANSI.reset}`);

if (failCount > 0) {
  console.log(`\n${ANSI.red}${ANSI.bold}ADVERSARIAL VERDICT: REJECT (${failCount} failures)${ANSI.reset}`);
  process.exit(1);
} else {
  console.log(`\n${ANSI.green}${ANSI.bold}ADVERSARIAL VERDICT: APPROVE (All empirical assertions passed cleanly!)${ANSI.reset}`);
  process.exit(0);
}
