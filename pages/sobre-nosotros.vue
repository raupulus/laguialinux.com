<!-- pages/sobre-nosotros.vue -->
<script setup lang="ts">
const { platform } = usePlatform()

const title = computed(() => `Sobre Nosotros · Historia y Filosofía · ${platform.value.name}`)
const description = 'Historia de La Guía Linux desde 2001 hasta 2026: de apuntes en papel y Debian 3 a la arquitectura moderna desacoplada en Nuxt 4 y GNU AGPLv3.'

useHead({
  title: title.value,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title.value },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
  ],
  link: [
    { rel: 'canonical', href: `https://${platform.value.domain}/sobre-nosotros` },
  ],
})

const timeline = [
  {
    year: '2001',
    subtitle: 'Debian 3 (Woody)',
    badge: 'Los Orígenes',
    title: 'Apuntes en cuadernos y fotocopias compartidas',
    description: 'Siendo estudiante y enfrentándose a un flamante Debian 3 que requería compilar módulos a mano en una época con escasa documentación en español, Raúl Caro Pastorino recopiló sus notas en cuadernos manuscritos. Cada pocas semanas, los compañeros se reunían para fotocopiarse los apuntes y compartir soluciones.',
    accent: 'emerald',
  },
  {
    year: '2003',
    subtitle: 'Intranet Casera',
    badge: 'Redes Comunitarias',
    title: 'Digitalización e Intranet con antenas Wi-Fi artesanales',
    description: 'Los apuntes pasaron a formato digital y nació una intranet privada interconectada mediante antenas Wi-Fi artesanales de largo alcance y carpetas compartidas Samba/NFS, facilitando la sincronización de scripts y documentación técnica entre nodos locales.',
    accent: 'cyan',
  },
  {
    year: '2005',
    subtitle: 'Blogger',
    badge: 'Apertura Global',
    title: 'Llegada a Internet accesible',
    description: 'Con la expansión del ADSL, los apuntes salieron de la red local para publicarse en abierto en Blogger. Lo que nació como una chuleta para recordar comandos de particionado y servidores pasó a recibir visitas y consultas de toda la comunidad hispanohablante.',
    accent: 'amber',
  },
  {
    year: '2009 - 2015',
    subtitle: 'CMS & Foros',
    badge: 'Era Drupal',
    title: 'Consolidación como portal técnico de referencia',
    description: 'Durante 6 años, Drupal estructuró las primeras categorías formales: servidores web Apache, cortafuegos iptables, optimización de memoria swap y reparación de sistemas de ficheros con fsck.',
    accent: 'blue',
  },
  {
    year: '2015 - 2024',
    subtitle: 'Más de 100 Guías',
    badge: 'Era WordPress',
    title: 'Organización exhaustiva de comandos por función',
    description: 'En septiembre de 2015 se relanza el sitio web estructurado alrededor de chuletas rápidas organizadas por áreas: administración, permisos chmod/umask, redes, almacenamiento zero-fill y tablas de equivalencias Windows a Linux. Se incorpora el canal oficial de YouTube con directos y vídeotutoriales prácticos.',
    accent: 'indigo',
  },
  {
    year: '2025 - 2026',
    subtitle: 'Ecosistema Moderno & AGPLv3',
    badge: 'La Nueva Era',
    title: 'Arquitectura desacoplada en subdominios especializados',
    description: 'Evolución completa hacia un ecosistema moderno: portal técnico laguialinux.com (guías y herramientas 100% client-side) y portal de periodismo libre news.laguialinux.com (actualidad, kernel watcher y CVEs). Código auditado, sin dependencias obsoletas y con licencia estricta GNU AGPLv3.',
    accent: 'emerald-active',
  },
]
</script>

<template>
  <div class="max-w-5xl mx-auto w-full px-4 lg:px-8 py-8 flex-1 space-y-12">
    <!-- HÉROE SOBRE NOSOTROS -->
    <section class="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden">
      <div class="space-y-4 relative z-10 max-w-3xl">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border"
          :class="platform.themeAccent === 'orange'
            ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'"
        >
          <span>🐧</span> El Proyecto · 2001 - 2026
        </div>
        <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight font-heading leading-tight">
          Documentación Libre y Pasión por GNU/Linux
        </h1>
        <p class="text-slate-300 text-base leading-relaxed">
          <strong>La Guía Linux</strong> es una iniciativa técnica comunitaria e independiente dirigida a facilitar la adopción, dominio y administración de sistemas operativos libres basados en Linux, proporcionando recursos rigurosos tanto para recién llegados como para sysadmins veteranos.
        </p>
        <div class="flex flex-wrap items-center gap-3 pt-2">
          <span class="text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-emerald-400">
            ✓ 100% Código Abierto (GNU AGPLv3)
          </span>
          <span class="text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-cyan-400">
            ✓ Cultura Libre (CC BY-SA 4.0)
          </span>
          <span class="text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400">
            ✓ Sin Muros de Pago
          </span>
        </div>
      </div>
    </section>

    <!-- CRONOLOGÍA HISTÓRICA RESCATADA (2001 HASTA HOY) -->
    <section class="space-y-6">
      <div class="border-b border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-black text-white font-heading flex items-center gap-3">
            <span>📜</span> La Evolución: De los orígenes a la plataforma moderna
          </h2>
          <p class="text-xs text-slate-400 mt-1">Una trayectoria ininterrumpida de más de dos décadas documentando tecnología libre.</p>
        </div>
        <span class="text-xs font-mono text-emerald-400 font-bold hidden sm:inline">2001 → 2026</span>
      </div>

      <div class="relative border-l-2 border-emerald-500/30 ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-10">
        <div
          v-for="item in timeline"
          :key="item.year"
          class="relative group"
        >
          <div
            class="absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full bg-slate-950 border-4 transition-transform group-hover:scale-125"
            :class="item.accent === 'emerald-active' ? 'border-emerald-400 shadow-lg shadow-emerald-500/50' : 'border-emerald-500'"
          />
          <div
            class="rounded-2xl p-5 sm:p-6 space-y-2 transition-colors border"
            :class="item.accent === 'emerald-active'
              ? 'bg-gradient-to-r from-slate-900 to-slate-950 border-emerald-500/50'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Año {{ item.year }} — {{ item.badge }}
              </span>
              <span class="text-xs font-mono text-slate-500">{{ item.subtitle }}</span>
            </div>
            <h3 class="text-lg font-bold text-white font-heading">{{ item.title }}</h3>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- EL AUTOR Y EL EQUIPO -->
    <section class="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6">
      <div class="border-b border-slate-800 pb-4">
        <h2 class="text-2xl font-black text-white font-heading flex items-center gap-3">
          <span>👤</span> Quién está detrás del proyecto
        </h2>
        <p class="text-xs text-slate-400 mt-1">Transparencia, autoría y compromiso comunitario.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div class="md:col-span-8 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <h3 class="text-lg font-bold text-white font-heading">
            Raúl Caro Pastorino (<a href="https://raupulus.dev" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:underline">@raupulus</a>)
          </h3>
          <p>
            Creador, administrador general y desarrollador principal del ecosistema. Desarrollador de software y sysadmin radicado en Chipiona (Cádiz, España). Mantiene los servidores, redacta y actualiza la mayoría de las guías y responde personalmente las consultas técnicas en la web y redes sociales.
          </p>
          <div class="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs">
            <a href="https://raupulus.dev" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 hover:border-slate-600 transition-colors">
              🌐 raupulus.dev
            </a>
            <a href="https://github.com/raupulus" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-600 transition-colors">
              🐙 GitHub (@raupulus)
            </a>
            <a href="https://gitlab.com/raupulus" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-orange-400 hover:border-slate-600 transition-colors">
              🦊 GitLab (@raupulus)
            </a>
            <a href="https://www.youtube.com/@raupulus" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-rose-400 hover:border-slate-600 transition-colors">
              📺 YouTube (@raupulus)
            </a>
          </div>
        </div>

        <div class="md:col-span-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div class="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span>👥</span> Colaboradores Históricos
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            En colaboración con este proyecto participan dos compañeros y amigos que aportan revisiones técnicas y pruebas de laboratorio esporádicamente según sus disponibilidades familiares y laborales.
          </p>
          <p class="text-xs text-slate-500 italic">
            Por expresa petición suya y en estricto respeto a su privacidad, figuran en los registros como colaboradores anónimos.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
