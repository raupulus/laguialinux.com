<script setup lang="ts">
const { platform } = usePlatform()

const tickerItems = [
  'Linux Kernel 6.12 lanzado oficialmente con soporte en tiempo real (PREEMPT_RT)',
  'Debian 13 "Trixie" entra en fase de congelamiento con base de kernel 6.12',
  'Alerta de seguridad: Detectada vulnerabilidad de severidad alta en librerías de red',
]

const recentNews = [
  {
    id: 1,
    title: 'Raspberry Pi Foundation presenta la Raspberry Pi 5 con 2GB de RAM a precio reducido',
    slug: 'raspberry-pi-5-2gb-ram',
    excerpt: 'El nuevo modelo optimiza el proceso de fabricación del chip BCM2712D0 para ofrecer la potencia de la Pi 5 desde solo 50 dólares.',
    category: 'Hardware',
    date: 'Hace 3 horas',
    readTime: '3 min',
    image: '/img/covers/hero_news.webp',
  },
  {
    id: 2,
    title: 'Vulnerabilidad crítica en CUPS: resumen de impacto y mitigación inmediata en Debian y RHEL',
    slug: 'vulnerabilidad-cups-mitigacion',
    excerpt: 'Análisis detallado de la cadena de fallos en el subsistema de impresión de red y las instrucciones para deshabilitar cups-browsed.',
    category: 'Ciberseguridad',
    date: 'Hace 6 horas',
    readTime: '5 min',
    image: '/img/covers/hero_news.webp',
  },
  {
    id: 3,
    title: 'GNOME 47 "Denver" ya está disponible: ventanas flotantes, acentos de color y mejor soporte Wayland',
    slug: 'gnome-47-denver-disponible',
    excerpt: 'La nueva versión del entorno de escritorio insignia llega con mejoras sustanciales en rendimiento gráfico y diálogos adaptativos.',
    category: 'Escritorio',
    date: 'Ayer',
    readTime: '4 min',
    image: '/img/covers/hero_news.webp',
  },
]

const trendingNews = [
  {
    rank: '01',
    title: 'Cómo configurar Secure Boot con certificados propios en Arch Linux',
    views: '3.4k',
    slug: 'secure-boot-arch-linux',
  },
  {
    rank: '02',
    title: 'Comparativa de rendimiento en servidores: Btrfs vs ZFS vs XFS en 2026',
    views: '2.8k',
    slug: 'btrfs-vs-zfs-vs-xfs',
  },
  {
    rank: '03',
    title: 'Novedades de systemd 256: run0 reemplaza a sudo para elevación segura',
    views: '2.1k',
    slug: 'systemd-256-run0',
  },
]
</script>

<template>
  <div class="space-y-12 py-6">
    
    <!-- 1. TICKER DE ÚLTIMA HORA -->
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-3 overflow-hidden rounded-xl border border-orange-500/30 bg-orange-950/20 px-3 py-2 text-xs">
        <span class="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-orange-500 px-2 py-0.5 font-heading text-[11px] font-extrabold uppercase tracking-wider text-black">
          <Icon name="lucide:flame" class="h-3.5 w-3.5" />
          Última Hora
        </span>
        <div class="truncate text-slate-300 font-medium">
          {{ tickerItems[0] }}
        </div>
      </div>
    </div>

    <!-- 2. KERNEL WATCHER WIDGET -->
    <div v-if="platform.features.kernelWatcher" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="rounded-xl border border-slate-800 bg-[#0b0f17] p-4 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Icon name="lucide:cpu" class="h-5 w-5" />
          </div>
          <div>
            <div class="text-xs font-bold text-white">Kernel Watcher Live</div>
            <div class="text-[11px] text-slate-400">Monitor en tiempo real del árbol de desarrollo kernel.org</div>
          </div>
        </div>

        <div class="flex items-center gap-4 text-xs font-mono">
          <div class="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1 text-slate-300">
            <span class="text-slate-500">Estable:</span> <strong class="text-orange-400">6.12.1</strong>
          </div>
          <div class="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1 text-slate-300">
            <span class="text-slate-500">LTS:</span> <strong class="text-emerald-400">6.6.65</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. HERO NOTICIA PRINCIPAL -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center rounded-2xl border border-slate-800 bg-[#0b0f17] p-6 lg:p-8">
        
        <!-- Imagen Destacada -->
        <div class="lg:col-span-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <img
            src="/img/covers/hero_news.webp"
            width="640"
            height="360"
            alt="Linux Kernel 6.12"
            class="w-full object-cover transition-transform duration-500 hover:scale-105"
          >
        </div>

        <!-- Contenido Noticia -->
        <div class="lg:col-span-6 space-y-4">
          <div class="flex items-center gap-3 text-xs">
            <span class="rounded-full bg-orange-500/10 px-2.5 py-0.5 font-medium text-orange-400 border border-orange-500/30">
              #Kernel & Hardware
            </span>
            <span class="text-slate-400">Hoy · 4 min de lectura</span>
          </div>

          <h1 class="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Linux Kernel 6.12 lanzado oficialmente con soporte PREEMPT_RT en tiempo real
          </h1>

          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Tras dos décadas de desarrollo independiente como parche externo, la rama principal de Linux absorbe el soporte formal para sistemas de tiempo real estricto, junto a mejoras clave para arquitecturas ARM y x86_64.
          </p>

          <div class="pt-2">
            <NuxtLink
              to="/noticia/linux-kernel-6-12-lanzamiento"
              class="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 px-5 py-2.5 text-xs font-bold text-black transition-colors"
            >
              Leer Noticia Completa
              <Icon name="lucide:arrow-right" class="h-4 w-4" />
            </NuxtLink>
          </div>
        </div>

      </div>
    </section>

    <!-- 4. PARRILLA DE NOTICIAS + SIDEBAR TENDENCIAS -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        <!-- Columna Noticias Recientes (8 cols) -->
        <div class="lg:col-span-8 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 class="font-heading text-lg font-bold text-white flex items-center gap-2">
              <Icon name="lucide:newspaper" class="h-5 w-5 text-orange-500" />
              Últimas Noticias de la Comunidad
            </h2>
            <NuxtLink to="/archivo" class="text-xs text-orange-400 hover:underline">
              Ver archivo
            </NuxtLink>
          </div>

          <div class="space-y-4">
            <article
              v-for="item in recentNews"
              :key="item.id"
              class="group flex flex-col sm:flex-row gap-4 rounded-xl border border-slate-800 bg-[#0b0f17] p-4 transition-all hover:border-orange-500/40 hover:bg-slate-900/60"
            >
              <div class="sm:w-44 shrink-0 overflow-hidden rounded-lg bg-slate-900 border border-slate-800">
                <img
                  :src="item.image"
                  width="200"
                  height="120"
                  :alt="item.title"
                  class="h-full w-full object-cover group-hover:scale-105 transition-transform"
                >
              </div>

              <div class="flex flex-col justify-between space-y-2">
                <div>
                  <div class="flex items-center gap-2 text-[11px] text-slate-400">
                    <span class="text-orange-400 font-semibold">{{ item.category }}</span>
                    <span>&middot;</span>
                    <span>{{ item.date }}</span>
                    <span>&middot;</span>
                    <span>{{ item.readTime }}</span>
                  </div>
                  <h3 class="font-heading text-sm sm:text-base font-bold text-white group-hover:text-orange-400 transition-colors mt-1">
                    {{ item.title }}
                  </h3>
                  <p class="text-xs text-slate-400 line-clamp-2 mt-1">
                    {{ item.excerpt }}
                  </p>
                </div>

                <div class="pt-1">
                  <NuxtLink
                    :to="`/noticia/${item.slug}`"
                    class="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300"
                  >
                    Leer más
                    <Icon name="lucide:chevron-right" class="h-3.5 w-3.5" />
                  </NuxtLink>
                </div>
              </div>
            </article>
          </div>
        </div>

        <!-- Sidebar Tendencias (4 cols) -->
        <aside class="lg:col-span-4 space-y-6">
          <div class="rounded-2xl border border-slate-800 bg-[#0b0f17] p-5">
            <h3 class="font-heading text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Icon name="lucide:flame" class="h-4 w-4 text-orange-400" />
              Tendencias en 72 Horas
            </h3>

            <div class="space-y-4">
              <div
                v-for="trend in trendingNews"
                :key="trend.rank"
                class="flex items-start gap-3 border-b border-slate-800/80 pb-3 last:border-0 last:pb-0"
              >
                <span class="font-mono text-lg font-black text-orange-500/60 shrink-0">
                  {{ trend.rank }}
                </span>
                <div>
                  <NuxtLink
                    :to="`/noticia/${trend.slug}`"
                    class="text-xs font-semibold text-slate-200 hover:text-orange-400 transition-colors line-clamp-2"
                  >
                    {{ trend.title }}
                  </NuxtLink>
                  <span class="text-[10px] text-slate-500 font-mono mt-1 block">
                    {{ trend.views }} lecturas
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- BANNER CROSS-SITE: PORTAL DE GUÍAS -->
          <div class="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-[#0b0f17] p-5 space-y-3">
            <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              <Icon name="lucide:terminal" class="h-3 w-3" />
              Guías y Chuletas
            </span>
            <h4 class="font-heading text-sm font-bold text-white">
              ¿Necesitas configurar un servidor o reparar un disco?
            </h4>
            <p class="text-xs text-slate-400">
              Consulta nuestra biblioteca de manuales y chuletas en <strong class="text-emerald-400">laguialinux.com</strong>.
            </p>
            <a
              href="https://laguialinux.com"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:underline pt-1"
            >
              Ir a La Guía Linux
              <Icon name="lucide:external-link" class="h-3 w-3" />
            </a>
          </div>
        </aside>

      </div>
    </section>

  </div>
</template>
