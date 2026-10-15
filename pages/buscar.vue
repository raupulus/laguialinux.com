<!--
  pages/buscar.vue - Página de Búsqueda Avanzada y Resultados Globales
  La Guía Linux (laguialinux.com & news.laguialinux.com)
  Licencia: GNU AGPLv3
-->
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlatform } from '~/composables/usePlatform'
import { useApiClient } from '~/composables/useApiClient'
import { SAMPLE_GUIDES, SAMPLE_NEWS } from '~/utils/sampleContentsData'
import type { CategoryResource } from '~/types'

const route = useRoute()
const router = useRouter()
const { platform, isGuides, isNews } = usePlatform()
const { getContents, getCategories } = useApiClient()

// =============================================================================
// Parámetros sincronizados con URL Query
// =============================================================================
const searchQuery = ref<string>((route.query.q as string) || '')
const localInput = ref<string>(searchQuery.value)
const selectedType = ref<string>((route.query.tipo as string) || '')
const selectedCategory = ref<string>((route.query.categoria as string) || '')
const selectedSort = ref<string>((route.query.sort as string) || '-published_at')
const currentPage = ref<number>(parseInt((route.query.page as string) || '1', 10) || 1)

const PER_PAGE = 12
const isLoading = ref(false)
const isOffline = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// =============================================================================
// Metadatos SEO
// =============================================================================
useHead({
  title: computed(() =>
    searchQuery.value
      ? `Búsqueda: "${searchQuery.value}" · ${platform.value.name}`
      : `Buscador Global de Contenidos · ${platform.value.name}`
  ),
  meta: [
    {
      name: 'description',
      content: `Resultados de búsqueda en ${platform.value.name}: guías técnicas, comandos de terminal, tutoriales y noticias de Linux.`,
    },
    { name: 'robots', content: 'noindex, follow' },
  ],
})

// =============================================================================
// Carga de Categorías para el filtro
// =============================================================================
const categories = ref<CategoryResource[]>([])

const fetchCategories = async () => {
  try {
    const res = await getCategories()
    if (res && res.data) {
      categories.value = res.data
    }
  } catch {
    // Si falla, extraer categorías únicas de los datos de muestra
    const uniqueCats = new Map<string, string>()
    SAMPLE_GUIDES.forEach((g) => uniqueCats.set(g.categorySlug, g.categoryName))
    SAMPLE_NEWS.forEach((n) => uniqueCats.set(n.categorySlug, n.categoryName))
    categories.value = Array.from(uniqueCats.entries()).map(([slug, name]) => ({
      id: Math.random(),
      slug,
      name,
      description: null,
      parent_id: null,
      order: 1,
      is_active: true,
      children: [],
    }))
  }
}

// Tipos de contenido según plataforma
const contentTypes = computed(() => [
  { slug: '', name: 'Todos los tipos' },
  { slug: 'guide', name: 'Guías y Tutoriales' },
  { slug: 'command', name: 'Comandos CLI' },
  { slug: 'news', name: 'Noticias' },
  { slug: 'project', name: 'Herramientas y Proyectos' },
])

// =============================================================================
// Sincronización segura de URL
// =============================================================================
const updateUrlQuery = () => {
  const query: Record<string, any> = {}
  if (searchQuery.value.trim()) query.q = searchQuery.value.trim()
  if (selectedType.value) query.tipo = selectedType.value
  if (selectedCategory.value) query.categoria = selectedCategory.value
  if (selectedSort.value && selectedSort.value !== '-published_at') query.sort = selectedSort.value
  if (currentPage.value > 1) query.page = currentPage.value

  router.push({
    path: route.path,
    query,
  })
}

// Control del input con debounce de 300ms
const onSearchInput = (val: string) => {
  localInput.value = val
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    searchQuery.value = val.trim()
    currentPage.value = 1
    updateUrlQuery()
  }, 300)
}

const clearSearch = () => {
  localInput.value = ''
  searchQuery.value = ''
  currentPage.value = 1
  updateUrlQuery()
}

const setCategory = (catSlug: string) => {
  selectedCategory.value = catSlug
  currentPage.value = 1
  updateUrlQuery()
}

const setType = (typeSlug: string) => {
  selectedType.value = typeSlug
  currentPage.value = 1
  updateUrlQuery()
}

const setSort = (sortVal: string) => {
  selectedSort.value = sortVal
  currentPage.value = 1
  updateUrlQuery()
}

const setPage = (pageNum: number) => {
  if (pageNum < 1 || pageNum > totalPages.value) return
  currentPage.value = pageNum
  updateUrlQuery()
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const resetAllFilters = () => {
  localInput.value = ''
  searchQuery.value = ''
  selectedType.value = ''
  selectedCategory.value = ''
  selectedSort.value = '-published_at'
  currentPage.value = 1
  updateUrlQuery()
}

// =============================================================================
// Motor de Búsqueda y Resultados (API con Fallback Offline)
// =============================================================================
const totalItems = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / PER_PAGE)))

const searchResults = ref<Array<{
  id: number
  title: string
  slug: string
  excerpt: string
  type: string
  typeSlug: string
  categorySlug: string
  categoryName: string
  published_at?: string
  views_count?: number
  readingTime?: string
  commandSnippet?: string
  url: string
  tagsList?: string[]
}>>([])

const executeQuery = async () => {
  isLoading.value = true
  isOffline.value = false

  try {
    const params: Record<string, any> = {
      page: currentPage.value,
      per_page: PER_PAGE,
      sort: selectedSort.value,
    }
    if (searchQuery.value) params.q = searchQuery.value
    if (selectedCategory.value) params.category = selectedCategory.value
    if (selectedType.value) params.type = selectedType.value

    const res = await getContents(params)

    if (res && res.data) {
      searchResults.value = res.data.map((item: any) => {
        const typeSlug = item.type?.slug || (isNews.value ? 'news' : 'guide')
        const isNewsItem = typeSlug === 'news' || platform.value.slug === 'news'
        const targetUrl = isNewsItem ? `/noticia/${item.slug}` : `/guia/${item.slug}`

        return {
          id: item.id,
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt || '',
          type: item.type?.name || (isNewsItem ? 'Noticia' : 'Guía'),
          typeSlug,
          categorySlug: item.category?.slug || 'general',
          categoryName: item.category?.name || 'General',
          published_at: item.published_at,
          views_count: item.views_count,
          readingTime: item.readingTime || '5 min',
          commandSnippet: item.commandSnippet,
          url: targetUrl,
          tagsList: item.tagsList || [],
        }
      })
      totalItems.value = res.meta?.total ?? res.data.length
    } else {
      executeLocalSearch()
    }
  } catch {
    isOffline.value = true
    executeLocalSearch()
  } finally {
    isLoading.value = false
  }
}

// Búsqueda en memoria de muestra
const executeLocalSearch = () => {
  const q = searchQuery.value.toLowerCase()
  let pool: any[] = []

  // Combinar guías y noticias
  pool = [
    ...SAMPLE_GUIDES.map((g) => ({
      ...g,
      typeSlug: g.type?.slug || 'guide',
      url: `/guia/${g.slug}`,
    })),
    ...SAMPLE_NEWS.map((n) => ({
      ...n,
      typeSlug: 'news',
      type: { name: 'Noticia', slug: 'news' },
      url: `/noticia/${n.slug}`,
      tagsList: [n.categorySlug],
    })),
  ]

  // Filtro de texto
  if (q) {
    pool = pool.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q)
      const matchExcerpt = (item.excerpt || '').toLowerCase().includes(q)
      const matchCategory = item.categoryName.toLowerCase().includes(q)
      const matchTags = (item.tagsList || []).some((t: string) => t.toLowerCase().includes(q))
      const matchCmd = (item.commandSnippet || '').toLowerCase().includes(q)
      return matchTitle || matchExcerpt || matchCategory || matchTags || matchCmd
    })
  }

  // Filtro de Tipo
  if (selectedType.value) {
    pool = pool.filter((item) => item.typeSlug === selectedType.value)
  }

  // Filtro de Categoría
  if (selectedCategory.value) {
    pool = pool.filter((item) => item.categorySlug === selectedCategory.value)
  }

  // Ordenación
  if (selectedSort.value === '-published_at') {
    pool.sort((a, b) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime())
  } else if (selectedSort.value === '-views_count') {
    pool.sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
  } else if (selectedSort.value === 'title') {
    pool.sort((a, b) => a.title.localeCompare(b.title))
  }

  totalItems.value = pool.length
  const start = (currentPage.value - 1) * PER_PAGE
  searchResults.value = pool.slice(start, start + PER_PAGE).map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt || '',
    type: item.type?.name || (item.typeSlug === 'news' ? 'Noticia' : 'Guía'),
    typeSlug: item.typeSlug,
    categorySlug: item.categorySlug,
    categoryName: item.categoryName,
    published_at: item.published_at,
    views_count: item.views_count,
    readingTime: item.readingTime || '5 min',
    commandSnippet: item.commandSnippet,
    url: item.url,
    tagsList: item.tagsList || [],
  }))
}

const escapeHtml = (str: string) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Resaltador visual de coincidencia
const highlightMatch = (text: string, query: string) => {
  if (!text) return ''
  const escapedText = escapeHtml(text)
  if (!query || !query.trim()) return escapedText
  const cleanQ = escapeHtml(query.trim()).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${cleanQ})`, 'gi')
  const accentClass = isNews.value
    ? 'bg-orange-500/30 text-orange-200 font-bold px-0.5 rounded'
    : 'bg-emerald-500/30 text-emerald-200 font-bold px-0.5 rounded'
  return escapedText.replace(regex, `<mark class="${accentClass}">$1</mark>`)
}

// Observar cambios en parámetros de ruta
watch(
  () => route.query,
  () => {
    searchQuery.value = (route.query.q as string) || ''
    localInput.value = searchQuery.value
    selectedType.value = (route.query.tipo as string) || ''
    selectedCategory.value = (route.query.categoria as string) || ''
    selectedSort.value = (route.query.sort as string) || '-published_at'
    currentPage.value = parseInt((route.query.page as string) || '1', 10) || 1
    executeQuery()
  }
)

onMounted(() => {
  fetchCategories()
  executeQuery()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">

    <!-- 1. BREADCRUMBS -->
    <nav class="flex items-center gap-2 text-xs font-mono text-slate-400" aria-label="Miga de pan">
      <NuxtLink to="/" class="hover:text-white transition-colors">Inicio</NuxtLink>
      <span>/</span>
      <span class="text-slate-200 font-semibold">Búsqueda global</span>
      <span v-if="searchQuery" class="text-slate-500 font-normal">/ "{{ searchQuery }}"</span>
    </nav>

    <!-- 2. HERO BUSCADOR PRINCIPAL -->
    <section class="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-10 shadow-xl space-y-6">
      <div class="space-y-2 max-w-3xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border"
          :class="isNews
            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'"
        >
          <Icon name="lucide:search" class="w-3.5 h-3.5" />
          <span>Motor de Búsqueda de La Guía Linux</span>
        </div>

        <h1 class="text-2xl sm:text-4xl font-black font-heading text-white tracking-tight">
          Explora comandos, tutoriales y noticias
        </h1>
        <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Encuentra soluciones inmediatas para administración de sistemas Linux, seguridad, optimización y almacenamiento.
        </p>
      </div>

      <!-- INPUT PRINCIPAL GRANDE -->
      <div class="relative max-w-3xl">
        <div class="relative flex items-center">
          <Icon
            name="lucide:search"
            class="absolute left-4 w-5 h-5 text-slate-500"
            :class="isNews ? 'text-orange-400' : 'text-emerald-400'"
          />
          <input
            v-model="localInput"
            type="text"
            placeholder="Escribe lo que necesitas (ej. chmod, particionar disco, kernel 6.12, systemd)..."
            class="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 pl-12 pr-12 text-sm sm:text-base text-slate-100 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
            :class="isNews
              ? 'focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
              : 'focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'"
            @input="onSearchInput(($event.target as HTMLInputElement).value)"
          />

          <!-- BOTÓN LIMPIAR O SPINNER -->
          <div class="absolute right-3.5 flex items-center">
            <Icon
              v-if="isLoading"
              name="lucide:loader-2"
              class="w-5 h-5 animate-spin"
              :class="isNews ? 'text-orange-400' : 'text-emerald-400'"
            />
            <button
              v-else-if="localInput"
              type="button"
              @click="clearSearch"
              class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Borrar texto"
            >
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. BARRA DE FILTROS Y FACETAS -->
    <section class="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4 shadow-xl backdrop-blur-sm">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <!-- FACETA 1: TIPO DE CONTENIDO -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full">
          <button
            v-for="t in contentTypes"
            :key="t.slug"
            type="button"
            @click="setType(t.slug)"
            class="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer"
            :class="selectedType === t.slug
              ? (isNews ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20' : 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20')
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'"
          >
            {{ t.name }}
          </button>
        </div>

        <!-- SELECTORES: CATEGORÍA Y ORDENACIÓN -->
        <div class="flex items-center gap-3 ml-auto">
          <!-- SELECT CATEGORÍA -->
          <div class="flex items-center gap-1.5">
            <label for="cat-filter" class="text-xs font-mono text-slate-400 hidden sm:inline">Categoría:</label>
            <select
              id="cat-filter"
              v-model="selectedCategory"
              @change="setCategory(selectedCategory)"
              class="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Todas las categorías</option>
              <option v-for="c in categories" :key="c.slug" :value="c.slug">
                {{ c.name }}
              </option>
            </select>
          </div>

          <!-- SELECT ORDENACIÓN -->
          <div class="flex items-center gap-1.5">
            <label for="sort-filter" class="text-xs font-mono text-slate-400 hidden sm:inline">Ordenar:</label>
            <select
              id="sort-filter"
              v-model="selectedSort"
              @change="setSort(selectedSort)"
              class="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="-published_at">Más recientes</option>
              <option value="-views_count">Más vistos</option>
              <option value="title">Título (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- PÍLDORAS ACTIVAS DE FILTRADO -->
      <div v-if="selectedCategory || selectedType || searchQuery" class="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
        <span class="text-slate-500 font-mono text-[11px]">Filtros activos:</span>

        <span v-if="searchQuery" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-300 font-mono">
          Texto: "{{ searchQuery }}"
          <button type="button" @click="clearSearch" class="hover:text-white p-0.5">✕</button>
        </span>

        <span v-if="selectedType" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 font-mono">
          Tipo: {{ contentTypes.find(t => t.slug === selectedType)?.name }}
          <button type="button" @click="setType('')" class="hover:text-white p-0.5">✕</button>
        </span>

        <span v-if="selectedCategory" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border font-mono"
          :class="isNews ? 'border-orange-500/30 bg-orange-500/10 text-orange-300' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'"
        >
          Categoría: {{ categories.find(c => c.slug === selectedCategory)?.name || selectedCategory }}
          <button type="button" @click="setCategory('')" class="hover:text-white p-0.5">✕</button>
        </span>

        <button
          type="button"
          @click="resetAllFilters"
          class="text-xs font-mono text-slate-400 hover:text-white underline ml-2 transition-colors cursor-pointer"
        >
          Limpiar filtros
        </button>
      </div>
    </section>

    <!-- 5. LISTADO DE RESULTADOS -->
    <section aria-label="Resultados de búsqueda">
      <!-- RECUENTO -->
      <div class="flex items-center justify-between pb-4 text-xs font-mono text-slate-400">
        <span>Se encontraron <strong>{{ totalItems }}</strong> publicaciones</span>
        <span>Página {{ currentPage }} de {{ totalPages }}</span>
      </div>

      <!-- SKELETON LOADING -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4 animate-pulse">
          <div class="flex justify-between">
            <div class="h-4 w-20 bg-slate-800 rounded"></div>
            <div class="h-4 w-16 bg-slate-800 rounded"></div>
          </div>
          <div class="h-6 w-3/4 bg-slate-800 rounded"></div>
          <div class="h-16 w-full bg-slate-800 rounded"></div>
          <div class="h-8 w-full bg-slate-800 rounded"></div>
        </div>
      </div>

      <!-- ESTADO VACÍO (SIN RESULTADOS) -->
      <div
        v-else-if="searchResults.length === 0"
        class="rounded-3xl border border-slate-800 bg-slate-950 p-12 text-center space-y-5 shadow-xl"
      >
        <div class="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-3xl flex items-center justify-center mx-auto text-slate-400">
          🔍
        </div>
        <h2 class="font-heading text-xl font-bold text-white">
          No se encontraron publicaciones
        </h2>
        <p class="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          No hay contenidos que coincidan con los términos y filtros indicados. Prueba buscando con otros sinónimos o restablece los filtros.
        </p>

        <div class="pt-2 flex flex-wrap justify-center gap-2">
          <span class="text-xs text-slate-500 font-mono w-full block">Sugerencias recomendadas:</span>
          <button
            v-for="sug in (isNews ? ['kernel', 'debian', 'openssh', 'wayland', 'fedora'] : ['chmod', 'systemd', 'fdisk', 'rsync', 'iptables', 'badblocks'])"
            :key="sug"
            type="button"
            @click="onSearchInput(sug)"
            class="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            {{ sug }}
          </button>
        </div>

        <div class="pt-4">
          <button
            type="button"
            @click="resetAllFilters"
            class="px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            :class="isNews ? 'bg-orange-500 hover:bg-orange-400 text-black' : 'bg-emerald-500 hover:bg-emerald-400 text-black'"
          >
            Restablecer todos los filtros
          </button>
        </div>
      </div>

      <!-- GRID DE TARJETAS DE RESULTADOS -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <article
          v-for="content in searchResults"
          :key="content.id"
          class="group rounded-2xl border border-slate-800 bg-slate-950/80 p-6 flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/20"
          :class="{ 'hover:border-orange-500/50 hover:shadow-orange-950/20': isNews }"
        >
          <div class="space-y-3">
            <!-- INSIGNIAS Y METADATOS -->
            <div class="flex items-center justify-between gap-2 text-xs">
              <span
                class="px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold border"
                :class="content.type === 'Noticia'
                  ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'"
              >
                {{ content.type }}
              </span>

              <span class="text-slate-400 font-mono text-[11px] truncate">
                {{ content.categoryName }}
              </span>
            </div>

            <!-- TÍTULO -->
            <h2
              class="font-heading text-lg font-bold text-white transition-colors leading-snug line-clamp-2"
              :class="isNews ? 'group-hover:text-orange-400' : 'group-hover:text-emerald-400'"
            >
              <NuxtLink :to="content.url" v-html="highlightMatch(content.title, searchQuery)"></NuxtLink>
            </h2>

            <!-- EXTRACTO -->
            <p
              class="text-xs text-slate-400 leading-relaxed line-clamp-3"
              v-html="highlightMatch(content.excerpt, searchQuery)"
            ></p>

            <!-- SNIPPET DE COMANDO -->
            <div
              v-if="content.commandSnippet"
              class="rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 font-mono text-xs text-slate-300 flex items-center justify-between"
            >
              <code class="truncate text-emerald-400 font-bold">
                $ {{ content.commandSnippet }}
              </code>
              <span class="text-[9px] text-slate-500 uppercase shrink-0 ml-2">CLI</span>
            </div>
          </div>

          <!-- PIE DE TARJETA CON ETIQUETAS Y ENLACE -->
          <div class="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
            <span class="text-slate-500 font-mono text-[11px]">
              ⏱ {{ content.readingTime }}
            </span>

            <NuxtLink
              :to="content.url"
              class="inline-flex items-center gap-1 font-mono font-bold transition-colors"
              :class="isNews ? 'text-orange-400 hover:text-orange-300' : 'text-emerald-400 hover:text-emerald-300'"
            >
              <span>Leer publicación</span>
              <span>→</span>
            </NuxtLink>
          </div>
        </article>
      </div>

      <!-- 6. PAGINACIÓN EXTENDIDA -->
      <div v-if="totalPages > 1" class="pt-8 flex items-center justify-center gap-2">
        <button
          type="button"
          :disabled="currentPage <= 1"
          @click="setPage(currentPage - 1)"
          class="px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-mono text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          ← Anterior
        </button>

        <div class="flex items-center gap-1 font-mono text-xs">
          <button
            v-for="p in totalPages"
            :key="p"
            type="button"
            @click="setPage(p)"
            class="w-8 h-8 rounded-xl font-bold flex items-center justify-center transition-all"
            :class="currentPage === p
              ? (isNews ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20' : 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20')
              : 'border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'"
          >
            {{ p }}
          </button>
        </div>

        <button
          type="button"
          :disabled="currentPage >= totalPages"
          @click="setPage(currentPage + 1)"
          class="px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-mono text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          Siguiente →
        </button>
      </div>

    </section>

  </div>
</template>
