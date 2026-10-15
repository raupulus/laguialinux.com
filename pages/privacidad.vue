<!-- pages/privacidad.vue -->
<script setup lang="ts">
const { platform } = usePlatform()

const title = computed(() => `Política de Privacidad y RGPD · ${platform.value.name}`)
const description = 'Política de privacidad conforme al RGPD (UE 2016/679) y LOPDGDD 3/2018. Principio de minimización, navegación libre sin registro y ejercicio de derechos ARCO+.'

useHead({
  title: title.value,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title.value },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@raupulus' },
    { name: 'twitter:creator', content: '@raupulus' },
  ],
  link: [
    { rel: 'canonical', href: `https://${platform.value.domain}/privacidad` },
  ],
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title.value,
        description,
        url: `https://${platform.value.domain}/privacidad`,
      }),
    },
  ],
})

const sections = [
  { id: 'responsable', num: '01', title: 'Responsable del Tratamiento' },
  { id: 'principios', num: '02', title: 'Principio de Minimización' },
  { id: 'tratamientos', num: '03', title: 'Datos Tratados y Finalidades' },
  { id: 'turnstile', num: '04', title: 'Protección Anti-Bot Ética' },
  { id: 'conservacion', num: '05', title: 'Plazos de Conservación' },
  { id: 'derechos', num: '06', title: 'Tus Derechos ARCO+' },
  { id: 'seguridad', num: '07', title: 'Medidas de Seguridad' },
]
</script>

<template>
  <div class="max-w-5xl mx-auto w-full px-4 lg:px-8 py-8 flex-1">
    <!-- CABECERA -->
    <header class="mb-10 space-y-3">
      <div
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border"
        :class="platform.themeAccent === 'orange'
          ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'"
      >
        <span>🛡️</span> Privacidad por Diseño y Minimización
      </div>
      <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight font-heading">
        Política de Privacidad y RGPD
      </h1>
      <p class="text-slate-400 text-sm leading-relaxed max-w-3xl">
        Compromiso estricto con el <strong>Reglamento General de Protección de Datos (RGPD UE 2016/679)</strong> y la <strong>LOPDGDD 3/2018</strong>. Respetamos tu privacidad: navegación libre sin perfiles, sin venta de datos y protección anti-bot no invasiva.
      </p>
      <div class="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 pt-2 border-t border-slate-800/80">
        <span>Canal oficial de privacidad: <a href="mailto:public@laguialinux.com" class="text-emerald-400 hover:underline">public@laguialinux.com</a></span>
        <span>·</span>
        <span>Ámbito: <code class="text-slate-300">{{ platform.domain }}</code></span>
      </div>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- ÍNDICE LATERAL -->
      <aside class="hidden lg:block lg:col-span-4">
        <div class="sticky top-24 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div class="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>📑</span> Secciones de Privacidad
          </div>
          <nav class="space-y-1.5 text-xs">
            <a
              v-for="item in sections"
              :key="item.id"
              :href="`#${item.id}`"
              class="block py-1.5 px-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {{ item.num }}. {{ item.title }}
            </a>
          </nav>
          <div class="pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            Ejercicio de derechos mediante email a <a href="mailto:public@laguialinux.com" class="text-emerald-400 hover:underline">public@laguialinux.com</a>
          </div>
        </div>
      </aside>

      <!-- ARTÍCULOS PRINCIPALES -->
      <main class="lg:col-span-8 space-y-10 text-slate-300 text-sm leading-relaxed">
        <!-- 01: RESPONSABLE -->
        <section id="responsable" class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <h2 class="text-xl sm:text-2xl font-bold text-white font-heading flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-sm font-bold border border-emerald-500/20">01</span>
            Responsable del Tratamiento
          </h2>
          <p>
            El responsable del tratamiento de los datos personales recabados en los portales del ecosistema es:
          </p>
          <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2">
            <div><span class="text-slate-500">Identidad:</span> <strong class="text-white">Raúl Caro Pastorino (@raupulus)</strong></div>
            <div><span class="text-slate-500">Sitio Web:</span> <a href="https://raupulus.dev" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:underline">https://raupulus.dev</a></div>
            <div><span class="text-slate-500">Email Privacidad & Plataforma:</span> <code class="text-emerald-400">public@laguialinux.com</code></div>
            <div><span class="text-slate-500">Email Personal del Autor:</span> <code class="text-slate-300">public@raupulus.dev</code></div>
            <div><span class="text-slate-500">Ubicación:</span> Andalucía, España (Unión Europea)</div>
          </div>
        </section>

        <!-- 02: MINIMIZACIÓN -->
        <section id="principios" class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <h2 class="text-xl sm:text-2xl font-bold text-white font-heading flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-sm font-bold border border-emerald-500/20">02</span>
            Principio Fundamental de Minimización
          </h2>
          <div class="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-200 leading-relaxed">
            <strong class="text-white font-bold block mb-1">Cero barreras de acceso:</strong>
            La lectura de guías, tutoriales, chuletas de comandos y noticias técnicas es completamente libre. <strong>No requerimos crear cuenta, ni iniciar sesión, ni proporcionar datos personales</strong> para acceder al 100% del conocimiento publicado.
          </div>
          <p>
            Solo recabamos información en los momentos estrictamente indispensables en los que el usuario interactúa activamente (al remitir un mensaje de contacto voluntario o al solicitar la suscripción a la newsletter técnica).
          </p>
        </section>

        <!-- 03: TRATAMIENTOS -->
        <section id="tratamientos" class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 sm:p-8 space-y-6 scroll-mt-24">
          <h2 class="text-xl sm:text-2xl font-bold text-white font-heading flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-sm font-bold border border-emerald-500/20">03</span>
            Datos Tratados, Finalidades y Base Legal
          </h2>
          <div class="space-y-4">
            <!-- A: Contacto -->
            <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-2">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-white text-base flex items-center gap-2">
                  <span>✉️</span> A. Formulario de Contacto y Sugerencias
                </h3>
                <span class="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">Art. 6.1.a RGPD</span>
              </div>
              <p class="text-xs text-slate-400">
                <strong>Datos recabados:</strong> Nombre o alias voluntario, dirección de correo electrónico, asunto y mensaje.
              </p>
              <p class="text-xs text-slate-400">
                <strong>Finalidad:</strong> Responder a tu consulta, reporte de errata técnica o propuesta de colaboración.
              </p>
              <p class="text-xs text-slate-400">
                <strong>Base legal:</strong> Tu consentimiento expreso al pulsar el botón de envío.
              </p>
            </div>

            <!-- B: Newsletter -->
            <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-2">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-white text-base flex items-center gap-2">
                  <span>📬</span> B. Suscripción a la Newsletter (Doble Opt-In)
                </h3>
                <span class="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Doble Consentimiento</span>
              </div>
              <p class="text-xs text-slate-400">
                <strong>Datos recabados:</strong> Correo electrónico y plataforma elegida.
              </p>
              <p class="text-xs text-slate-400">
                <strong>Confirmación segura:</strong> La activación requiere confirmación manual en la web tras el enlace recibido, previniendo activaciones involuntarias por filtros automatizados de correo.
              </p>
              <p class="text-xs text-slate-400">
                <strong>Baja inmediata (RFC 8058):</strong> Cada correo incluye cabecera de baja en un clic y enlace a nuestra página de desuscripción voluntaria.
              </p>
            </div>

            <!-- C: Logs de Servidor -->
            <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-2">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-white text-base flex items-center gap-2">
                  <span>🖥️</span> C. Registros Técnicos de Acceso y Rate Limiting
                </h3>
                <span class="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">Art. 6.1.f Interés Legítimo</span>
              </div>
              <p class="text-xs text-slate-400">
                <strong>Datos:</strong> Dirección IP truncada, fecha, hora, método HTTP, URI solicitada y User-Agent.
              </p>
              <p class="text-xs text-slate-400">
                <strong>Finalidad:</strong> Seguridad perimetral del servidor, prevención de ataques DDoS y control de cuotas de velocidad del servicio web.
              </p>
            </div>
          </div>
        </section>

        <!-- 04: TURNSTILE -->
        <section id="turnstile" class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <h2 class="text-xl sm:text-2xl font-bold text-white font-heading flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-sm font-bold border border-emerald-500/20">04</span>
            Defensa Anti-Bot Ética: Cloudflare Turnstile
          </h2>
          <p>
            Para proteger nuestros formularios contra el spam automatizado, utilizamos <strong>Cloudflare Turnstile</strong> como alternativa respetuosa con la privacidad frente a reCAPTCHA.
          </p>
          <ul class="space-y-2 list-disc list-inside text-xs text-slate-300">
            <li><strong>Sin rastreo publicitario:</strong> No utiliza cookies para elaborar perfiles ni vincula la navegación con fines comerciales.</li>
            <li><strong>Comprobación técnica no interactiva:</strong> Desafíos en tiempo de ejecución del navegador sin resolver imágenes borrosas.</li>
            <li><strong>Conformidad con RGPD:</strong> Telemetría técnica procesada bajo el marco UE-EE.UU. con cláusulas contractuales tipo.</li>
          </ul>
        </section>

        <!-- 05: CONSERVACIÓN -->
        <section id="conservacion" class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <h2 class="text-xl sm:text-2xl font-bold text-white font-heading flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-sm font-bold border border-emerald-500/20">05</span>
            Plazos de Conservación de los Datos
          </h2>
          <ul class="space-y-2 list-disc list-inside text-xs text-slate-300">
            <li><strong>Mensajes de Contacto:</strong> Se conservan durante el tiempo necesario para resolver la consulta (máximo 6 meses tras su tramitación).</li>
            <li><strong>Suscripciones de Newsletter:</strong> Se conservan activas hasta que el suscriptor solicite su baja o ejerza su derecho de supresión. Los tokens temporales caducan a las 48 horas.</li>
            <li><strong>Logs Técnicos de Acceso:</strong> Se rotan y eliminan de forma automática cada 14 a 30 días.</li>
          </ul>
        </section>

        <!-- 06: DERECHOS ARCO -->
        <section id="derechos" class="bg-slate-900/60 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <h2 class="text-xl sm:text-2xl font-bold text-cyan-400 font-heading flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono text-sm font-bold border border-cyan-500/20">06</span>
            Tus Derechos ARCO+ y Cómo Ejercerlos
          </h2>
          <p>Como titular de los datos personales, el RGPD te reconoce los siguientes derechos plenos:</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
              <strong class="text-white block mb-0.5">Acceso:</strong>
              Conocer qué datos personales tuyos estamos tratando.
            </div>
            <div class="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
              <strong class="text-white block mb-0.5">Rectificación:</strong>
              Corregir datos inexactos o incompletos.
            </div>
            <div class="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
              <strong class="text-white block mb-0.5">Supresión («Olvido»):</strong>
              Solicitar la eliminación total de tus datos.
            </div>
            <div class="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
              <strong class="text-white block mb-0.5">Limitación y Oposición:</strong>
              Restringir u oponerte a determinados tratamientos.
            </div>
          </div>
          <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
            <p><strong>Procedimiento sencillo y directo:</strong></p>
            <p>
              Para ejercer cualquiera de estos derechos, envía un correo a <a href="mailto:public@laguialinux.com" class="text-emerald-400 font-mono font-bold hover:underline">public@laguialinux.com</a> indicando en el asunto «Protección de Datos / RGPD» y detallando tu petición.
            </p>
            <p class="text-slate-400">
              Asimismo, puedes presentar una reclamación ante la autoridad de control: la <strong>Agencia Española de Protección de Datos (AEPD)</strong> en <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:underline">www.aepd.es</a>.
            </p>
          </div>
        </section>

        <!-- 07: SEGURIDAD -->
        <section id="seguridad" class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <h2 class="text-xl sm:text-2xl font-bold text-white font-heading flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-sm font-bold border border-emerald-500/20">07</span>
            Medidas de Seguridad de la Información
          </h2>
          <p>
            Conforme al artículo 32 del RGPD, aplicamos medidas técnicas y organizativas rigurosas: cifrado TLS 1.3 en todas las comunicaciones, cabeceras HSTS activas, principio de mínimo privilegio en servidores y copias de seguridad aisladas.
          </p>
        </section>
      </main>
    </div>
  </div>
</template>
