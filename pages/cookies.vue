<!-- pages/cookies.vue -->
<script setup lang="ts">
const { platform } = usePlatform()

const title = computed(() => `Política de Cookies y Almacenamiento · ${platform.value.name}`)
const description = 'Política de cookies y almacenamiento local conforme a la directiva ePrivacy y Google Consent Mode v2. Centro interactivo de preferencias de privacidad.'

useHead({
  title: title.value,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title.value },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
  ],
  link: [
    { rel: 'canonical', href: `https://${platform.value.domain}/cookies` },
  ],
})

// Estado reactivo del Centro de Preferencias
const adsenseEnabled = ref(true)
const savedFeedback = ref(false)

onMounted(() => {
  const consent = localStorage.getItem('lgl_cookie_consent')
  if (consent) {
    try {
      const parsed = JSON.parse(consent)
      adsenseEnabled.value = parsed.adsense !== false
    } catch {
      adsenseEnabled.value = true
    }
  }
})

function savePreferences() {
  const payload = {
    technical: true,
    adsense: adsenseEnabled.value,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem('lgl_cookie_consent', JSON.stringify(payload))
  savedFeedback.value = true
  setTimeout(() => {
    savedFeedback.value = false
  }, 3500)
}
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
        <span>🍪</span> Directiva ePrivacy & Guía de la AEPD
      </div>
      <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight font-heading">
        Política de Cookies y Almacenamiento
      </h1>
      <p class="text-slate-400 text-sm leading-relaxed max-w-3xl">
        Información detallada, clara y accesible sobre el uso de cookies HTTP, almacenamiento local (<code class="text-slate-200">localStorage</code>), sistemas de protección de integridad y publicidad de <strong class="text-slate-200">Google AdSense</strong>.
      </p>
      <div class="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 pt-2 border-t border-slate-800/80">
        <span>Cumplimiento ePrivacy 2009/136/CE</span>
        <span>·</span>
        <span>Consent Mode v2 / IAB TCF v2.2</span>
      </div>
    </header>

    <!-- PANEL INTERACTIVO DE PREFERENCIAS DE COOKIES -->
    <section class="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 mb-12 shadow-2xl space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 class="text-xl font-bold text-white font-heading flex items-center gap-2">
            <span>⚙️</span> Centro de Preferencias de Privacidad
          </h2>
          <p class="text-xs text-slate-400 mt-1">Configura qué tecnologías permites en tu navegador. Tus preferencias se guardan de forma local.</p>
        </div>
        <div class="flex items-center gap-3">
          <span v-if="savedFeedback" class="text-xs font-mono text-emerald-400 animate-pulse">✓ ¡Guardado!</span>
          <button
            type="button"
            class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
            @click="savePreferences"
          >
            Guardar Configuración
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- TECNOLOGÍAS TÉCNICAS (OBLIGATORIAS) -->
        <div class="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 class="font-bold text-white text-sm">Técnicas y Funcionales</h3>
            </div>
            <span class="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">Siempre Activas</span>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            Esenciales para la navegación, accesibilidad de pestañas en guías, temporizadores anti-spam de formularios y seguridad perimetral.
          </p>
          <div class="text-[11px] font-mono text-slate-500">
            Almacenamiento: <code class="text-slate-400">localStorage (lgl_theme, lgl_cooldown)</code>
          </div>
        </div>

        <!-- PUBLICIDAD / ADSENSE -->
        <div class="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 class="font-bold text-white text-sm">Publicidad Sostenible (AdSense)</h3>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="adsenseEnabled" type="checkbox" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            Permite mostrar anuncios no intrusivos que sufragan los servidores, dominios y ancho de banda del proyecto. Puedes optar por desactivarlos.
          </p>
          <div class="text-[11px] font-mono" :class="adsenseEnabled ? 'text-emerald-400' : 'text-slate-500'">
            {{ adsenseEnabled ? '✓ Anuncios habilitados para sostenimiento del proyecto libre' : '✕ Anuncios deshabilitados' }}
          </div>
        </div>
      </div>
    </section>

    <!-- CUERPO DE LA POLÍTICA -->
    <div class="space-y-10 text-slate-300 text-sm leading-relaxed">
      <!-- 01: DEFINICIÓN -->
      <section class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 class="text-xl sm:text-2xl font-bold text-white font-heading flex items-center gap-3">
          <span class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-sm font-bold border border-emerald-500/20">01</span>
          ¿Qué son las Cookies y el Almacenamiento Local?
        </h2>
        <p>
          Una <strong>cookie</strong> es un pequeño fichero de texto que un sitio web descarga en tu navegador para recordar información entre visitas o mantener viva una sesión técnica.
        </p>
        <p>
          Además de cookies, utilizamos tecnologías modernas de almacenamiento local como <strong><code class="text-emerald-400">localStorage</code></strong> y <strong><code class="text-cyan-400">sessionStorage</code></strong>. A diferencia de las cookies tradicionales, los datos de <code class="text-slate-300">localStorage</code> no se transmiten automáticamente al servidor en cada petición HTTP, lo que reduce el consumo de ancho de banda y mejora la privacidad.
        </p>
      </section>

      <!-- 02: TABLA DE COOKIES -->
      <section class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 class="text-xl sm:text-2xl font-bold text-white font-heading flex items-center gap-3">
          <span class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-sm font-bold border border-emerald-500/20">02</span>
          Tabla de Cookies y Elementos Técnicos Utilizados
        </h2>
        <p class="text-xs text-slate-400">
          Inventario auditado de todos los identificadores que pueden almacenarse en tu cliente web:
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden font-mono">
            <thead class="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th class="p-3">Clave / Nombre</th>
                <th class="p-3">Proveedor</th>
                <th class="p-3">Finalidad</th>
                <th class="p-3">Tipo</th>
                <th class="p-3">Caducidad</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/80 bg-slate-900/40">
              <tr>
                <td class="p-3 font-bold text-emerald-400">lgl_theme</td>
                <td class="p-3 text-slate-300 font-sans">Propio</td>
                <td class="p-3 text-slate-300 font-sans">Preferencia de tema visual (oscuro/claro)</td>
                <td class="p-3 text-slate-400">localStorage</td>
                <td class="p-3 text-slate-400">Persistente</td>
              </tr>
              <tr>
                <td class="p-3 font-bold text-emerald-400">lgl_cookie_consent</td>
                <td class="p-3 text-slate-300 font-sans">Propio</td>
                <td class="p-3 text-slate-300 font-sans">Almacena el estado de consentimiento de cookies</td>
                <td class="p-3 text-slate-400">localStorage</td>
                <td class="p-3 text-slate-400">Persistente</td>
              </tr>
              <tr>
                <td class="p-3 font-bold text-emerald-400">lgl_contact_cooldown_timestamp</td>
                <td class="p-3 text-slate-300 font-sans">Propio</td>
                <td class="p-3 text-slate-300 font-sans">Temporizador anti-abuso de 5 min para formularios</td>
                <td class="p-3 text-slate-400">localStorage</td>
                <td class="p-3 text-slate-400">5 minutos</td>
              </tr>
              <tr>
                <td class="p-3 font-bold text-cyan-400">cf_clearance</td>
                <td class="p-3 text-slate-300 font-sans">Cloudflare Turnstile</td>
                <td class="p-3 text-slate-300 font-sans">Acredita superación del desafío anti-bot</td>
                <td class="p-3 text-slate-400">Cookie Técnica</td>
                <td class="p-3 text-slate-400">30 - 120 min</td>
              </tr>
              <tr>
                <td class="p-3 font-bold text-amber-400">__gads / __gpi</td>
                <td class="p-3 text-slate-300 font-sans">Google AdSense</td>
                <td class="p-3 text-slate-300 font-sans">Medición publicitaria y prevención de fraude</td>
                <td class="p-3 text-slate-400">Cookie Publicitaria</td>
                <td class="p-3 text-slate-400">13 meses</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 03: GESTIÓN EN NAVEGADORES -->
      <section class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 class="text-xl sm:text-2xl font-bold text-white font-heading flex items-center gap-3">
          <span class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-sm font-bold border border-emerald-500/20">03</span>
          Cómo Revocar o Bloquear Cookies en tu Navegador
        </h2>
        <p>
          Puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo mediante la configuración de las opciones de tu navegador web:
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <strong class="text-white block mb-1">Mozilla Firefox:</strong>
            Ajustes → Privacidad y seguridad → Cookies y datos del sitio.
          </div>
          <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <strong class="text-white block mb-1">Google Chrome / Chromium:</strong>
            Configuración → Privacidad y seguridad → Cookies de terceros.
          </div>
          <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <strong class="text-white block mb-1">Brave:</strong>
            Escudos de Brave → Bloqueo avanzado de cookies y rastreadores.
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
