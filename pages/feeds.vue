<!-- pages/feeds.vue -->
<script setup lang="ts">
const { platform, isGuides, isNews } = usePlatform()

const title = computed(() => `Directorio de Canales RSS 2.0 y Atom 1.0 · ${platform.value.name}`)
const description = 'Sindicación abierta y descentralizada sin algoritmos. Copia los canales RSS globales y por categoría para tu agregador (Newsboat, Thunderbird, FreshRSS, Feedly).'

useHead({
  title: title.value,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title.value },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
  ],
  link: [
    { rel: 'canonical', href: `https://${platform.value.domain}/feeds` },
  ],
})

// Feed Channels List
interface FeedCard {
  id: string
  title: string
  badge: string
  format: string
  description: string
  path: string
}

const guidesFeeds: FeedCard[] = [
  {
    id: 'global',
    title: 'Todas las Guías y Tutoriales',
    badge: 'Principal',
    format: 'RSS 2.0 + Atom',
    description: 'El canal maestro que recopila absolutamente todas las nuevas guías, chuletas y artículos técnicos publicados.',
    path: '/feed.xml',
  },
  {
    id: 'comandos',
    title: 'Comandos y Chuletas CLI',
    badge: 'Temático',
    format: 'RSS 2.0',
    description: 'Nuevas referencias rápidas de comandos esenciales, sintaxis de herramientas GNU y tablas de uso de terminal.',
    path: '/comandos/feed.xml',
  },
  {
    id: 'almacenamiento',
    title: 'Discos y Almacenamiento',
    badge: 'Temático',
    format: 'RSS 2.0',
    description: 'Formateo seguro, particionado con fdisk/gdisk, LVM y reparación con e2fsck/badblocks.',
    path: '/almacenamiento/feed.xml',
  },
  {
    id: 'seguridad',
    title: 'Seguridad y Hardening',
    badge: 'Temático',
    format: 'RSS 2.0',
    description: 'SSH sin clave, auditoría con Nmap, cifrado LUKS, cortafuegos iptables/nftables y bastionado.',
    path: '/seguridad/feed.xml',
  },
  {
    id: 'redes',
    title: 'Redes y Servidores',
    badge: 'Temático',
    format: 'RSS 2.0',
    description: 'Configuración de interfaces, DNS, DHCP, WireGuard VPN, servidores Nginx y sockets.',
    path: '/redes/feed.xml',
  },
]

const newsFeeds: FeedCard[] = [
  {
    id: 'global-news',
    title: 'Todas las Noticias de Linux',
    badge: 'Principal News',
    format: 'RSS 2.0',
    description: 'Toda la actualidad en vivo: comunicados del kernel, lanzamientos de distribuciones, hardware y seguridad.',
    path: '/feed.xml',
  },
  {
    id: 'kernel',
    title: 'Kernel Watcher & Versiones',
    badge: 'Especializado',
    format: 'RSS 2.0',
    description: 'Avisos ante cada nueva versión Release Candidate, Mainline o actualización LTS en Kernel.org.',
    path: '/kernel-linux/feed.xml',
  },
  {
    id: 'cve',
    title: 'Alertas de Ciberseguridad y CVE',
    badge: 'Alertas CVE',
    format: 'RSS 2.0',
    description: 'Avisos críticos de seguridad en paquetes base de Linux, puntuaciones CVSS y soluciones de mitigación.',
    path: '/ciberseguridad/feed.xml',
  },
  {
    id: 'distros',
    title: 'Distribuciones GNU/Linux',
    badge: 'Temático',
    format: 'RSS 2.0',
    description: 'Lanzamientos y novedades de Debian, Arch, Fedora, Ubuntu, openSUSE y proyectos derivados.',
    path: '/distribuciones/feed.xml',
  },
]

// Interactive clipboard copy with feedback
const copiedFeedId = ref<string | null>(null)

function copyFeedUrl(id: string, url: string) {
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(url)
    copiedFeedId.value = id
    setTimeout(() => {
      copiedFeedId.value = null
    }, 2500)
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto w-full px-4 lg:px-8 py-8 flex-1 space-y-12">
    <!-- CABECERA -->
    <header class="space-y-4">
      <div
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border"
        :class="platform.themeAccent === 'orange'
          ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'"
      >
        <span>📡</span> Sindicación Abierta y Descentralizada
      </div>
      <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight font-heading">
        Directorio de Canales RSS 2.0 y Atom 1.0
      </h1>
      <p class="text-slate-400 text-sm leading-relaxed max-w-3xl">
        Sin algoritmos de recomendación opacos, sin rastreo invasivo y sin depender de redes sociales propietarias. Añade nuestros canales a tu lector de feeds preferido y mantente informado al instante cada vez que publiquemos una nueva guía o noticia técnica.
      </p>
    </header>

    <!-- SECCIÓN 1: CANALES DEL PORTAL ACTIVO -->
    <section class="space-y-6">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center gap-3">
          <span
            class="w-3 h-3 rounded-full"
            :class="platform.themeAccent === 'orange' ? 'bg-orange-500' : 'bg-emerald-500'"
          />
          <h2 class="text-xl font-bold text-white font-heading">
            Canales de {{ platform.name }} ({{ platform.domain }})
          </h2>
        </div>
        <span
          class="text-xs font-mono px-2.5 py-1 rounded border font-bold"
          :class="platform.themeAccent === 'orange'
            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'"
        >
          {{ isNews ? 'Actualidad & Alertas' : 'Guías & Sysadmin' }}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="feed in (isNews ? newsFeeds : guidesFeeds)"
          :key="feed.id"
          class="bg-slate-900/80 rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-4 border transition-colors"
          :class="feed.badge.includes('Principal')
            ? (platform.themeAccent === 'orange' ? 'border-orange-500/40' : 'border-emerald-500/40')
            : 'border-slate-800 hover:border-slate-700'"
        >
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span
                class="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded"
                :class="feed.badge.includes('Principal')
                  ? (platform.themeAccent === 'orange' ? 'bg-orange-500/20 text-orange-300' : 'bg-emerald-500/20 text-emerald-300')
                  : 'bg-slate-800 text-slate-400'"
              >
                {{ feed.badge }}
              </span>
              <span class="text-xs text-slate-500 font-mono">{{ feed.format }}</span>
            </div>
            <h3 class="text-base font-bold text-white">{{ feed.title }}</h3>
            <p class="text-xs text-slate-400 leading-relaxed">{{ feed.description }}</p>
          </div>

          <div class="space-y-2 pt-2 border-t border-slate-800 font-mono text-xs">
            <div class="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800 min-w-0 gap-2">
              <code class="text-slate-300 truncate text-[11px] min-w-0 flex-1">
                https://{{ platform.domain }}{{ feed.path }}
              </code>
              <button
                type="button"
                class="shrink-0 ml-2 px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer"
                :class="copiedFeedId === feed.id
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'"
                @click="copyFeedUrl(feed.id, `https://${platform.domain}${feed.path}`)"
              >
                {{ copiedFeedId === feed.id ? '✓ ¡Copiado!' : 'Copiar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECCIÓN 2: ENLACE AL PORTAL HERMANO -->
    <section class="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div class="space-y-1 text-center sm:text-left">
        <h3 class="text-base font-bold text-white font-heading">
          {{ isNews ? '¿Buscas las guías y chuletas de comandos?' : '¿Buscas noticias y alertas de ciberseguridad?' }}
        </h3>
        <p class="text-xs text-slate-400">
          {{ isNews
            ? 'Descubre los canales de sindicación técnica en laguialinux.com/feeds'
            : 'Accede a los canales de noticias en tiempo real en news.laguialinux.com/feeds'
          }}
        </p>
      </div>
      <a
        :href="isNews ? 'https://laguialinux.com/feeds' : 'https://news.laguialinux.com/feeds'"
        target="_blank"
        rel="noopener noreferrer"
        class="shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border"
        :class="isNews
          ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/40'
          : 'bg-orange-600 hover:bg-orange-500 text-white border-orange-500/40'"
      >
        <span>Ver Feeds en {{ isNews ? 'laguialinux.com' : 'news.laguialinux.com' }} ↗</span>
      </a>
    </section>

    <!-- SECCIÓN 3: GUÍA DE LECTORES RECOMENDADOS -->
    <section class="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6">
      <div class="space-y-1">
        <h3 class="text-xl font-bold text-white font-heading">
          Cómo añadir los feeds a tu lector de RSS favorito
        </h3>
        <p class="text-xs text-slate-400">
          Recomendaciones de clientes de código abierto para leer contenidos cómodamente:
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div class="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
          <div class="font-bold text-white flex items-center gap-2">
            <span class="text-emerald-400 font-mono">>_</span>
            <span>Newsboat (CLI)</span>
          </div>
          <p class="text-slate-400 text-[11px] leading-relaxed">
            Lector en consola para terminal Linux. Añade la URL directamente a tu fichero <code class="text-slate-300">~/.newsboat/urls</code>.
          </p>
        </div>

        <div class="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
          <div class="font-bold text-white flex items-center gap-2">
            <span>🐦</span>
            <span>Mozilla Thunderbird</span>
          </div>
          <p class="text-slate-400 text-[11px] leading-relaxed">
            Cliente de correo y RSS de escritorio. Crea una cuenta de «Canales de noticias / Blogs» y pega el enlace del feed.
          </p>
        </div>

        <div class="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
          <div class="font-bold text-white flex items-center gap-2">
            <span>🏠</span>
            <span>FreshRSS / Miniflux</span>
          </div>
          <p class="text-slate-400 text-[11px] leading-relaxed">
            Servidores auto-alojados en tu propio VPS o Raspberry Pi. Sincronización instantánea con aplicaciones móviles abiertas.
          </p>
        </div>

        <div class="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
          <div class="font-bold text-white flex items-center gap-2">
            <span>🌐</span>
            <span>Feedly / Inoreader</span>
          </div>
          <p class="text-slate-400 text-[11px] leading-relaxed">
            Agregadores web multiplataforma. Pega la URL en la barra de búsqueda de suscripciones para añadir el canal a tu biblioteca.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
