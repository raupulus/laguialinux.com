<!-- pages/amigos.vue -->
<script setup lang="ts">
const { platform } = usePlatform()

const title = computed(() => `Enlaces Amigos del Open Source · Directorio Comunitario · ${platform.value.name}`)
const description = 'Directorio seleccionado de 18 proyectos amigos: blogs técnicos, podcasts libres, canales de difusión y asociaciones del software libre y Linux en español.'

useHead({
  title: title.value,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title.value },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
  ],
  link: [
    { rel: 'canonical', href: `https://${platform.value.domain}/amigos` },
  ],
})

interface FriendProject {
  id: number
  title: string
  category: 'blogs' | 'podcasts' | 'youtube' | 'comunidades' | 'lugs' | 'distros'
  categoryLabel: string
  badge: string
  badgeColor: string
  domain: string
  url: string
  description: string
  tags: string[]
  keywords: string
}

const allProjects: FriendProject[] = [
  // 1. Blogs
  {
    id: 1,
    title: 'DesdeLinux',
    category: 'blogs',
    categoryLabel: 'Blog & Portal',
    badge: 'Español',
    badgeColor: 'emerald',
    domain: 'desdelinux.net',
    url: 'https://blog.desdelinux.net',
    description: 'Uno de los portales más veteranos y activos sobre GNU/Linux en español. Tutoriales, noticias de distribuciones, personalización y chuletas de terminal.',
    tags: ['#tutoriales', '#noticias', '#distros'],
    keywords: 'desdelinux blog noticias tutoriales linux software libre',
  },
  {
    id: 2,
    title: 'MuyLinux',
    category: 'blogs',
    categoryLabel: 'Blog & Actualidad',
    badge: 'Español',
    badgeColor: 'emerald',
    domain: 'muylinux.com',
    url: 'https://www.muylinux.com',
    description: 'Cobertura exhaustiva de la actualidad del mundo Linux, análisis de nuevos lanzamientos de Ubuntu, Fedora, Debian, novedades del kernel y debates.',
    tags: ['#actualidad', '#kernel', '#lanzamientos'],
    keywords: 'muylinux actualidad lanzamientos kernel noticias opensource',
  },
  {
    id: 3,
    title: 'Salmorejo Geek',
    category: 'blogs',
    categoryLabel: 'Blog & Opinión',
    badge: 'Yoyo Fernández',
    badgeColor: 'emerald',
    domain: 'salmorejogeek.com',
    url: 'https://salmorejogeek.com',
    description: 'Bitácora personal y podcast de divulgación sobre el escritorio GNU/Linux, Arch Linux, software libre, reflexiones de actualidad y vivencias geek.',
    tags: ['#archlinux', '#opinion', '#podcast'],
    keywords: 'salmorejo geek yoyo fernandez arch podcast linux',
  },
  {
    id: 4,
    title: 'Victorhck in the Free World',
    category: 'blogs',
    categoryLabel: 'Blog Técnico',
    badge: 'openSUSE / GNU',
    badgeColor: 'emerald',
    domain: 'victorhckinthefreeworld.com',
    url: 'https://victorhckinthefreeworld.com',
    description: 'Publicación comprometida con la filosofía del software libre, openSUSE, herramientas de privacidad, guías prácticas y difusión ética de la tecnología.',
    tags: ['#opensuse', '#privacidad', '#culturalibre'],
    keywords: 'victorhck opensuse gnu linux software libre privacidad',
  },

  // 2. Podcasts
  {
    id: 5,
    title: 'Batería 2x100',
    category: 'podcasts',
    categoryLabel: 'Podcast Audio',
    badge: 'Semanal',
    badgeColor: 'amber',
    domain: 'iVoox / RSS',
    url: 'https://www.ivoox.com/podcast-bateria-2x100_sq_f1110034_1.html',
    description: 'Podcast decano de software libre y tecnología donde se debate de forma desenfadada sobre novedades en Linux, movilidad, servidores y hardware abierto.',
    tags: ['#podcast', '#tecnologia', '#linux'],
    keywords: 'bateria 2x100 podcast audio linux tecnologia software libre',
  },
  {
    id: 6,
    title: 'El MosqueteroWeb',
    category: 'podcasts',
    categoryLabel: 'Podcast Sysadmin',
    badge: 'Homelab & Cloud',
    badgeColor: 'amber',
    domain: 'mosqueteroweb.es',
    url: 'https://mosquetero.web',
    description: 'Podcast especializado en administración de servidores caseros (homelab), virtualización con Proxmox, contenedores Docker, redes, NAS y servicios auto-alojados.',
    tags: ['#homelab', '#docker', '#proxmox'],
    keywords: 'mosqueteroweb podcast sysadmin homelab docker proxmox servidores',
  },
  {
    id: 7,
    title: 'Atareao con Linux',
    category: 'podcasts',
    categoryLabel: 'Podcast & Scripts',
    badge: 'Lorenzo Carbonell',
    badgeColor: 'amber',
    domain: 'atareao.es',
    url: 'https://atareao.es',
    description: 'Extensa enciclopedia de scripts en Bash, Python, Rust, automatización en terminal, herramientas de productividad, bots de Telegram y episodios diarios.',
    tags: ['#bash', '#automatizacion', '#podcast'],
    keywords: 'atareao lorenzo podcast scripts bash automatizacion',
  },

  // 3. YouTube & Streaming
  {
    id: 8,
    title: 'Raúl Caro Pastorino (@raupulus)',
    category: 'youtube',
    categoryLabel: 'Canal del Autor',
    badge: 'Oficial',
    badgeColor: 'rose',
    domain: 'youtube.com/@raupulus',
    url: 'https://www.youtube.com/@raupulus',
    description: 'Canal oficial del creador de La Guía Linux con directos técnicos, montajes de servidores caseros, tutoriales de comandos, desarrollo web de código abierto y laboratorio.',
    tags: ['#videotutoriales', '#directos', '#terminal'],
    keywords: 'raupulus raul caro pastorino canal youtube directos tutoriales sysadmin',
  },
  {
    id: 9,
    title: 'Locos por Linux',
    category: 'youtube',
    categoryLabel: 'YouTube Divulgación',
    badge: 'Tutoriales',
    badgeColor: 'rose',
    domain: 'youtube.com',
    url: 'https://www.youtube.com/@LocosporLinux',
    description: 'Canal de referencia conducido por Nicolás, centrado en instalaciones paso a paso, Debian, optimizaciones para ordenadores antiguos y filosofía del software libre.',
    tags: ['#debian', '#hardwareantiguo', '#optimizar'],
    keywords: 'locos por linux nicolas youtube tutoriales distros terminal debian',
  },
  {
    id: 10,
    title: 'El Pingüino Tech',
    category: 'youtube',
    categoryLabel: 'Canal YouTube',
    badge: 'Reviews & UI',
    badgeColor: 'rose',
    domain: 'youtube.com',
    url: 'https://www.youtube.com',
    description: 'Análisis visuales de entornos de escritorio (GNOME, KDE Plasma, XFCE), revisiones de distribuciones emergentes y comparativas de rendimiento para usuarios.',
    tags: ['#escritorios', '#kde', '#gnome'],
    keywords: 'el pinguino tech youtube reviews escritorios linux software',
  },

  // 4. Comunidades
  {
    id: 11,
    title: 'Comunidad La Guía Linux',
    category: 'comunidades',
    categoryLabel: 'Grupo Oficial',
    badge: 'Telegram',
    badgeColor: 'cyan',
    domain: 't.me/raupulus',
    url: 'https://t.me/raupulus',
    description: 'Grupo abierto de debate y soporte mutuo para usuarios de GNU/Linux. Resolución colectiva de dudas de comandos, servidores, scripts y novedades técnicas en tiempo real.',
    tags: ['#soporte', '#comunidad', '#sysadmin'],
    keywords: 'telegram comunidad grupo laguialinux chat dudas terminal soporte',
  },
  {
    id: 12,
    title: 'Debian España',
    category: 'comunidades',
    categoryLabel: 'Comunidad Distro',
    badge: 'Telegram',
    badgeColor: 'cyan',
    domain: 't.me/debian_es',
    url: 'https://t.me/debian_es',
    description: 'Punto de encuentro hispano para administradores y usuarios de «El Sistema Operativo Universal». Discusión técnica sobre ramas stable, testing y sid, paquetería y servidores.',
    tags: ['#debian', '#apt', '#servidores'],
    keywords: 'debian espana telegram grupo usuarios debianitas paqueteria apt',
  },
  {
    id: 13,
    title: 'Arch Linux ES',
    category: 'comunidades',
    categoryLabel: 'Comunidad Rolling',
    badge: 'Telegram',
    badgeColor: 'cyan',
    domain: 't.me/archlinux_es',
    url: 'https://t.me/archlinux_es',
    description: 'Comunidad hispana de usuarios de Arch Linux y distribuciones basadas en Pacman y AUR. Soporte técnico, configuración de dotfiles y noticias de actualización continua.',
    tags: ['#archlinux', '#pacman', '#aur'],
    keywords: 'arch linux es telegram comunidad rolling pacman aur',
  },

  // 5. Asociaciones & LUGs
  {
    id: 14,
    title: 'Hispalinux',
    category: 'lugs',
    categoryLabel: 'Asociación Histórica',
    badge: 'España',
    badgeColor: 'emerald',
    domain: 'hispalinux.es',
    url: 'https://hispalinux.es',
    description: 'La asociación pionera de usuarios españoles de Linux fundada en 1997. Promoción institucional del software libre, defensa de estándares abiertos y divulgación de la cultura hacker.',
    tags: ['#lug', '#estandares', '#defensa'],
    keywords: 'hispalinux asociacion lug espana usuarios software libre historia',
  },
  {
    id: 15,
    title: 'GNU/Linux Valencia',
    category: 'lugs',
    categoryLabel: 'LUG Activo',
    badge: 'Valencia',
    badgeColor: 'emerald',
    domain: 'gnulinuxvalencia.org',
    url: 'https://gnulinuxvalencia.org',
    description: 'Asociación comunitaria sumamente activa que organiza talleres presenciales y online, jornadas de instalación (install parties), podcast mensual y hardware libre.',
    tags: ['#talleres', '#eventos', '#comunidad'],
    keywords: 'gnulinux valencia lug asociacion talleres podcast eventos',
  },

  // 6. Distribuciones & Fundaciones
  {
    id: 16,
    title: 'The Debian Project',
    category: 'distros',
    categoryLabel: 'Distribución Madre',
    badge: 'Global',
    badgeColor: 'emerald',
    domain: 'debian.org',
    url: 'https://www.debian.org',
    description: 'El sistema operativo universal basado 100% en voluntariado libre y gobernanza democrática. Cimiento fundamental sobre el que nació la primera versión de La Guía Linux en 2001.',
    tags: ['#debian', '#contratosocial', '#upstream'],
    keywords: 'debian proyecto universal free software contract dmsg apt',
  },
  {
    id: 17,
    title: 'Free Software Foundation (FSF)',
    category: 'distros',
    categoryLabel: 'Fundación Libre',
    badge: 'Filosofía',
    badgeColor: 'emerald',
    domain: 'fsf.org',
    url: 'https://www.fsf.org',
    description: 'Organización dedicada a defender las cuatro libertades fundamentales del software informático y promover las licencias copyleft GNU GPL y GNU AGPLv3 bajo las que opera este proyecto.',
    tags: ['#gnu', '#agplv3', '#libertades'],
    keywords: 'fsf free software foundation gnu gpl agpl libertad 4 libertades',
  },
  {
    id: 18,
    title: 'The Linux Kernel (kernel.org)',
    category: 'distros',
    categoryLabel: 'Repositorio Oficial',
    badge: 'Kernel Core',
    badgeColor: 'emerald',
    domain: 'kernel.org',
    url: 'https://www.kernel.org',
    description: 'La fuente principal del código del núcleo Linux, ramas mainline, stable y LTS monitorizadas activamente por el subsistema Kernel Watcher en nuestro portal de noticias.',
    tags: ['#kernel', '#upstream', '#cve'],
    keywords: 'kernel org torvalds mainline lts linux parches cve',
  },
]

const searchQuery = ref('')
const selectedCategory = ref<string>('all')

const categoriesList = [
  { id: 'all', label: 'Todos', count: 18 },
  { id: 'blogs', label: '📰 Blogs & Portales', count: 4 },
  { id: 'podcasts', label: '🎙️ Podcasts Libres', count: 3 },
  { id: 'youtube', label: '📺 Canales & Streaming', count: 3 },
  { id: 'comunidades', label: '💬 Comunidades Telegram / Matrix', count: 3 },
  { id: 'lugs', label: '🏛️ Asociaciones & LUGs', count: 2 },
  { id: 'distros', label: '🐧 Distribuciones & Fundaciones', count: 3 },
]

const filteredProjects = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  return allProjects.filter((p) => {
    const matchCategory = selectedCategory.value === 'all' || p.category === selectedCategory.value
    const matchSearch = !q
      || p.title.toLowerCase().includes(q)
      || p.description.toLowerCase().includes(q)
      || p.keywords.toLowerCase().includes(q)
      || p.tags.some(t => t.toLowerCase().includes(q))
    return matchCategory && matchSearch
  })
})
</script>

<template>
  <div class="max-w-6xl mx-auto w-full px-4 lg:px-8 py-8 flex-1 space-y-8">
    <!-- CABECERA -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
      <div class="space-y-3 max-w-3xl">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border"
          :class="platform.themeAccent === 'orange'
            ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'"
        >
          <span>🤝</span> Ecosistema Comunitario y Red Libre
        </div>
        <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight font-heading">
          Enlaces Amigos del Open Source
        </h1>
        <p class="text-slate-400 text-sm leading-relaxed">
          Un directorio curado y vivo de blogs de referencia, podcasts de software libre, canales divulgativos de YouTube, comunidades de mensajería y grupos de usuarios (LUGs) que hacen grande a la comunidad hispanohablante de GNU/Linux.
        </p>
      </div>

      <div class="shrink-0">
        <NuxtLink
          to="/contacto"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
        >
          <Icon name="lucide:plus" class="w-4 h-4" />
          <span>Proponer un Proyecto Amigo</span>
        </NuxtLink>
      </div>
    </div>

    <!-- BARRA DE CONTROL: BUSCADOR REACTIVO + PÍLDORAS -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div class="relative w-full sm:w-80">
          <Icon name="lucide:search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre, tema o tecnología..."
            class="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors font-sans"
          >
        </div>

        <div class="text-xs font-mono text-slate-400 self-end sm:self-center">
          Mostrando <span class="font-bold text-emerald-400">{{ filteredProjects.length }}</span> proyectos recomendados
        </div>
      </div>

      <!-- PÍLDORAS DE CATEGORÍA -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="cat in categoriesList"
          :key="cat.id"
          type="button"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          :class="selectedCategory === cat.id
            ? 'bg-emerald-500 text-slate-950 shadow font-bold'
            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'"
          @click="selectedCategory = cat.id"
        >
          {{ cat.label }} ({{ cat.count }})
        </button>
      </div>
    </div>

    <!-- PARRILLA DE ENLACES AMIGOS -->
    <div v-if="filteredProjects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="proj in filteredProjects"
        :key="proj.id"
        class="bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg"
      >
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
              {{ proj.categoryLabel }}
            </span>
            <span class="text-[11px] text-slate-500 font-mono">{{ proj.badge }}</span>
          </div>
          <h3 class="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
            {{ proj.title }}
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            {{ proj.description }}
          </p>
          <div class="flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-400">
            <span v-for="tag in proj.tags" :key="tag" class="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {{ tag }}
            </span>
          </div>
        </div>
        <div class="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
          <span class="text-xs font-mono text-slate-500">{{ proj.domain }}</span>
          <a
            :href="proj.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Visitar Sitio</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    </div>

    <!-- ESTADO VACÍO -->
    <div v-else class="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-3">
      <div class="text-3xl">🔍</div>
      <h3 class="text-base font-bold text-white">No se han encontrado proyectos que coincidan</h3>
      <p class="text-xs text-slate-400 max-w-md mx-auto">
        Prueba a buscar con otro término o pulsa «Todos» en el selector superior de categorías.
      </p>
      <button
        type="button"
        class="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl transition-colors cursor-pointer"
        @click="searchQuery = ''; selectedCategory = 'all'"
      >
        Limpiar Filtros
      </button>
    </div>

    <!-- CTA PARA PROPONER NUEVOS PROYECTOS -->
    <section class="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
      <div class="space-y-2 max-w-2xl text-center md:text-left">
        <h3 class="text-xl font-bold text-white font-heading">¿Gestionas un proyecto libre o un blog comunitario?</h3>
        <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Nos encanta dar visibilidad a creadores técnicos, podcasts independientes y LUGs de la comunidad hispana. Escríbenos y añadiremos tu enlace amigo sin ningún coste ni compromiso recíproco.
        </p>
      </div>
      <NuxtLink
        to="/contacto"
        class="shrink-0 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
      >
        Proponer Proyecto en Contacto →
      </NuxtLink>
    </section>
  </div>
</template>
