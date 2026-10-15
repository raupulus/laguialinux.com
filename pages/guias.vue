<script setup lang="ts">
import type { CategoryResource, CollectionQueryParams, ContentResource } from '~/types'
import { DEFAULT_CATEGORIES } from '~/utils/categoriesData'
import { formatDate } from '~/utils/formatters'
import { SAMPLE_GUIDES } from '~/utils/sampleContentsData'

const route = useRoute()
const router = useRouter()
const { platform, isGuides, isNews } = usePlatform()
const api = useApiClient()

// =============================================================================
// Estado reactivo sincronizado con la URL (Query Params)
// =============================================================================
// Sanitización estricta del parámetro ?page de la URL (bloquea Infinity, NaN, negativos y valores fraccionarios)
const sanitizedQueryPage = computed(() => {
  const raw = Number(route.query.page)
  if (!Number.isFinite(raw) || isNaN(raw)) return 1
  const intVal = Math.floor(raw)
  return intVal >= 1 ? intVal : 1
})

const selectedCategory = computed(() => (route.query.categoria as string) || '')
const selectedType = computed(() => (route.query.tipo as string) || '')
const selectedSort = computed(() => (route.query.sort as string) || '-published_at')
const searchQuery = computed(() => (route.query.q as string) || '')

// Entrada local del buscador para debounce
const localSearchInput = ref(searchQuery.value)
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (newVal) => {
  if (newVal !== localSearchInput.value) {
    localSearchInput.value = newVal
  }
})

const handleSearchInput = (value: string) => {
  localSearchInput.value = value
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    updateQuery({ q: value.trim() || undefined, page: 1 })
  }, 300)
}

const clearSearch = () => {
  localSearchInput.value = ''
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  updateQuery({ q: undefined, page: 1 })
}

// Actualizador seguro de parámetros de ruta
const updateQuery = (newParams: Record<string, any>) => {
  const current = { ...route.query }
  const merged: Record<string, any> = { ...current, ...newParams }

  // Limpiar valores vacíos o por defecto para mantener URLs limpias
  if (!merged.page || merged.page === 1) delete merged.page
  if (!merged.categoria) delete merged.categoria
  if (!merged.tipo) delete merged.tipo
  if (!merged.q) delete merged.q
  if (merged.sort === '-published_at') delete merged.sort

  router.push({
    path: route.path,
    query: merged,
  })
}

const setCategory = (slug: string) => {
  updateQuery({ categoria: slug || undefined, page: 1 })
}

const setType = (typeSlug: string) => {
  updateQuery({ tipo: typeSlug || undefined, page: 1 })
}

const setSort = (sortVal: string) => {
  updateQuery({ sort: sortVal, page: 1 })
}

const setPage = (pageNumber: number) => {
  if (pageNumber < 1) return
  const sanitized = Math.max(1, Math.min(totalPages.value, Math.floor(Number(pageNumber) || 1)))
  updateQuery({ page: sanitized })
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const resetAllFilters = () => {
  localSearchInput.value = ''
  router.push({ path: route.path, query: {} })
}

// =============================================================================
// Carga de Categorías (para el selector/filtros)
// =============================================================================
const { data: categoriesResponse } = await useAsyncData(
  `catalog-categories-${platform.value.slug}`,
  async () => {
    try {
      return await api.getCategories()
    } catch {
      return null
    }
  }
)

const categories = computed<CategoryResource[]>(() => {
  if (categoriesResponse.value?.data && categoriesResponse.value.data.length > 0) {
    return categoriesResponse.value.data
  }
  return DEFAULT_CATEGORIES[platform.value.slug] || DEFAULT_CATEGORIES.laguialinux || []
})

// Tipos de contenido disponibles para filtrado
const contentTypes = [
  { slug: '', name: 'Todos los tipos' },
  { slug: 'guide', name: 'Guías paso a paso' },
  { slug: 'command', name: 'Chuletas y Comandos' },
  { slug: 'article', name: 'Artículos de referencia' },
]

// =============================================================================
// Carga de Contenidos Paginados (API V2 con fallback offline)
// =============================================================================
const isOffline = ref(false)

const queryParams = computed<CollectionQueryParams>(() => {
  const p: CollectionQueryParams = {
    page: sanitizedQueryPage.value,
    per_page: 12,
    sort: selectedSort.value,
  }
  if (selectedCategory.value) p.category = selectedCategory.value
  if (selectedType.value) p.type = selectedType.value
  if (searchQuery.value) p.q = searchQuery.value
  return p
})

const {
  data: apiContentsResponse,
  status,
  error: apiError,
  refresh,
} = await useAsyncData(
  () => `catalog-contents-${platform.value.slug}-${route.fullPath}`,
  async () => {
    try {
      const res = await api.getContents(queryParams.value)
      isOffline.value = false
      return res
    } catch (err) {
      isOffline.value = true
      // En caso de fallo de red, retornamos null para activar el dataset mock local
      return null
    }
  },
  {
    watch: [() => route.fullPath],
  }
)

// Computado de contenidos con fallback local si la API no está disponible
const displayedContents = computed<ContentResource[]>(() => {
  if (apiContentsResponse.value?.data && Array.isArray(apiContentsResponse.value.data)) {
    return apiContentsResponse.value.data
  }

  // MOCK FALLBACK: Filtrar localmente el dataset de muestra
  let local = [...SAMPLE_GUIDES]

  if (selectedCategory.value) {
    local = local.filter(
      item =>
        item.categorySlug === selectedCategory.value ||
        item.subcategorySlug === selectedCategory.value
    )
  }

  if (selectedType.value) {
    local = local.filter(item => item.type?.slug === selectedType.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    local = local.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(q)
      const matchExcerpt = (item.excerpt || '').toLowerCase().includes(q)
      const matchTags = item.tagsList.some(t => t.toLowerCase().includes(q))
      const matchCmd = (item.commandSnippet || '').toLowerCase().includes(q)
      return matchTitle || matchExcerpt || matchTags || matchCmd
    })
  }

  // Ordenación local
  if (selectedSort.value === '-published_at') {
    local.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
  } else if (selectedSort.value === '-views_count') {
    local.sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
  } else if (selectedSort.value === 'title') {
    local.sort((a, b) => a.title.localeCompare(b.title))
  }

  // Paginación local
  const perPage = 12
  const start = (currentPage.value - 1) * perPage
  return local.slice(start, start + perPage)
})

// Recuento total de páginas disponibles (calculado para fallback y acotación segura)
const totalPages = computed(() => {
  if (apiContentsResponse.value?.meta?.last_page) {
    return Math.max(1, apiContentsResponse.value.meta.last_page)
  }

  // Meta simulada para el fallback
  let totalCount = SAMPLE_GUIDES.length
  if (selectedCategory.value) {
    totalCount = SAMPLE_GUIDES.filter(
      item =>
        item.categorySlug === selectedCategory.value ||
        item.subcategorySlug === selectedCategory.value
    ).length
  }
  const perPage = 12
  return Math.max(1, Math.ceil(totalCount / perPage))
})

// Página activa acotada estrictamente entre 1 y totalPages
const currentPage = computed(() => {
  return Math.max(1, Math.min(totalPages.value, sanitizedQueryPage.value))
})

const paginationMeta = computed(() => {
  if (apiContentsResponse.value?.meta) {
    const meta = apiContentsResponse.value.meta
    const last = Math.max(1, meta.last_page || 1)
    const current = Math.max(1, Math.min(last, currentPage.value))
    return {
      total: meta.total,
      per_page: meta.per_page,
      current_page: current,
      last_page: last,
      from: meta.total === 0 ? 0 : (current - 1) * meta.per_page + 1,
      to: Math.min(meta.total, current * meta.per_page),
    }
  }

  // Meta simulada para el fallback
  let totalCount = SAMPLE_GUIDES.length
  if (selectedCategory.value) {
    totalCount = SAMPLE_GUIDES.filter(
      item =>
        item.categorySlug === selectedCategory.value ||
        item.subcategorySlug === selectedCategory.value
    ).length
  }
  const perPage = 12
  const lastPage = totalPages.value
  const current = currentPage.value

  return {
    total: totalCount,
    per_page: perPage,
    current_page: current,
    last_page: lastPage,
    from: totalCount === 0 ? 0 : (current - 1) * perPage + 1,
    to: Math.min(totalCount, current * perPage),
  }
})

// Generador de páginas con elipsis
const visiblePageNumbers = computed(() => {
  const current = paginationMeta.value.current_page
  const last = paginationMeta.value.last_page
  const delta = 2
  const range: (number | string)[] = []

  for (let i = Math.max(2, current - delta); i <= Math.min(last - 1, current + delta); i++) {
    range.push(i)
  }

  if (current - delta > 2) {
    range.unshift('...')
  }
  if (current + delta < last - 1) {
    range.push('...')
  }

  range.unshift(1)
  if (last > 1) {
    range.push(last)
  }

  return range
})

// Metadatos SEO dinámicos
useSeoMeta({
  title: 'Catálogo General de Guías y Tutoriales · La Guía Linux',
  description: 'Explora el catálogo completo de guías técnicas, manuales paso a paso y chuletas de comandos para la administración de sistemas GNU/Linux.',
  ogTitle: 'Catálogo General de Guías y Tutoriales · La Guía Linux',
  ogDescription: 'Explora el catálogo completo de guías técnicas y chuletas de comandos.',
  ogImage: '/assets/img/covers/cover_guias.webp',
})
</script>

<template>
  <div class="min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4 lg:px-8 space-y-8">

      <!-- ===================================================================== -->
      <!-- 1. HERO CABECERA DEL CATÁLOGO -->
      <!-- ===================================================================== -->
      <section class="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl">
        <div class="absolute -right-8 -bottom-8 opacity-5 font-mono text-9xl font-black select-none pointer-events-none text-emerald-400">
          #
        </div>

        <div class="relative z-10 max-w-3xl space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold"
            :class="isNews ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'"
          >
            <span>📚</span> Catálogo Completo &bull; Referencia Técnica
          </div>

          <h1 class="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Catálogo General de
            <span class="text-transparent bg-clip-text bg-gradient-to-r"
              :class="isNews ? 'from-orange-400 via-amber-300 to-yellow-400' : 'from-emerald-400 via-teal-300 to-cyan-400'"
            >
              Guías y Manuales
            </span>
          </h1>

          <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
            Explora más de 100 guías prácticas organizadas por área funcional: chuletas de comandos, administración de almacenamiento y discos, bastionado de seguridad, redes y mantenimiento.
          </p>

          <!-- BUSCADOR CON DEBOUNCE -->
          <div class="pt-2 max-w-xl">
            <div class="relative">
              <input
                type="text"
                :value="localSearchInput"
                @input="handleSearchInput(($event.target as HTMLInputElement).value)"
                placeholder="Filtrar por comando, título o concepto... (ej: find, ssh, fdisk)"
                class="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 pl-11 pr-10 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
                :class="isNews ? 'focus:border-orange-500 focus:ring-1 focus:ring-orange-500' : 'focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'"
              />
              <Icon name="lucide:search" class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <button
                v-if="localSearchInput"
                type="button"
                @click="clearSearch"
                class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded"
                title="Limpiar búsqueda"
              >
                <Icon name="lucide:x" class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ===================================================================== -->
      <!-- 2. BARRA DE FILTRADO MULTI-CRITERIO Y CONTROLES -->
      <!-- ===================================================================== -->
      <section class="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-5 shadow-xl backdrop-blur-sm" aria-label="Filtros del catálogo">

        <!-- 2.1. PÍLDORAS DE CATEGORÍAS (SCROLL HORIZONTAL) -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            <span class="flex items-center gap-2">
              <Icon name="lucide:folder" class="h-3.5 w-3.5 text-emerald-400" />
              Filtrar por Categoría
            </span>
            <span class="text-[11px] text-slate-500 font-normal">
              {{ categories.length }} áreas disponibles
            </span>
          </div>

          <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <!-- Botón Todas -->
            <button
              type="button"
              @click="setCategory('')"
              class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer"
              :class="!selectedCategory
                ? (isNews ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20' : 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20')
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'"
            >
              <span>Todas</span>
            </button>

            <!-- Categorías individuales -->
            <button
              v-for="cat in categories"
              :key="cat.slug"
              type="button"
              @click="setCategory(cat.slug)"
              class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer"
              :class="selectedCategory === cat.slug
                ? (isNews ? 'bg-orange-500/20 border border-orange-500/60 text-orange-300 shadow-sm' : 'bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 shadow-sm')
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'"
            >
              <span>{{ cat.name }}</span>
              <span
                class="px-1.5 py-0.2 rounded-full text-[10px] font-mono"
                :class="selectedCategory === cat.slug
                  ? (isNews ? 'bg-orange-500/30 text-orange-200' : 'bg-emerald-500/30 text-emerald-200')
                  : 'bg-slate-950 text-slate-500'"
              >
                {{ cat.contents_count }}
              </span>
            </button>
          </div>
        </div>

        <!-- 2.2. PÍLDORAS DE TIPO & TOOLBAR DE ORDENACIÓN -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
          <!-- Filtro por Tipo -->
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="text-xs font-mono text-slate-400 mr-1.5">Tipo:</span>
            <button
              v-for="t in contentTypes"
              :key="t.slug"
              type="button"
              @click="setType(t.slug)"
              class="px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer"
              :class="selectedType === t.slug
                ? 'bg-slate-800 text-white font-bold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'"
            >
              {{ t.name }}
            </button>
          </div>

          <!-- Selector de Ordenación y Contador -->
          <div class="flex items-center gap-3 self-end sm:self-center">
            <span class="text-xs font-mono text-slate-400">
              Mostrando {{ paginationMeta.from }}-{{ paginationMeta.to }} de {{ paginationMeta.total }}
            </span>
            <div class="relative">
              <select
                :value="selectedSort"
                @change="setSort(($event.target as HTMLSelectElement).value)"
                class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 pr-8 text-xs text-slate-200 focus:outline-none appearance-none cursor-pointer font-medium"
                :class="isNews ? 'focus:border-orange-500' : 'focus:border-emerald-500'"
              >
                <option value="-published_at">Más recientes</option>
                <option value="-views_count">Más leídos / Populares</option>
                <option value="title">Alfabético (A-Z)</option>
              </select>
              <Icon name="lucide:chevron-down" class="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <!-- 2.3. FILTROS ACTIVOS CON BOTÓN DE LIMPIAR -->
        <div v-if="selectedCategory || selectedType || searchQuery" class="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/60">
          <span class="text-[11px] font-mono uppercase text-slate-400">Filtros activos:</span>

          <span v-if="selectedCategory" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-xs font-mono"
            :class="isNews ? 'border-orange-500/30 bg-orange-500/10 text-orange-300' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'"
          >
            Categoría: {{ categories.find(c => c.slug === selectedCategory)?.name || selectedCategory }}
            <button type="button" @click="setCategory('')" class="hover:text-white p-0.5 cursor-pointer">✕</button>
          </span>

          <span v-if="selectedType" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-mono text-slate-200">
            Tipo: {{ contentTypes.find(t => t.slug === selectedType)?.name }}
            <button type="button" @click="setType('')" class="hover:text-white p-0.5 cursor-pointer">✕</button>
          </span>

          <span v-if="searchQuery" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border border-sky-500/30 bg-sky-500/10 text-xs font-mono text-sky-300">
            Búsqueda: "{{ searchQuery }}"
            <button type="button" @click="clearSearch" class="hover:text-white p-0.5 cursor-pointer">✕</button>
          </span>

          <button
            type="button"
            @click="resetAllFilters"
            class="text-xs font-mono text-slate-400 hover:text-white underline ml-2 transition-colors cursor-pointer"
          >
            Limpiar todo
          </button>
        </div>

      </section>

      <!-- ===================================================================== -->
      <!-- 3. GRID DE TARJETAS DE CONTENIDOS -->
      <!-- ===================================================================== -->
      <section aria-label="Listado de guías y tutoriales">

        <!-- SKELETON LOADING -->
        <div v-if="status === 'pending'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="i in 6"
            :key="i"
            class="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4 animate-pulse"
          >
            <div class="flex justify-between">
              <div class="h-4 w-24 bg-slate-800 rounded"></div>
              <div class="h-4 w-16 bg-slate-800 rounded"></div>
            </div>
            <div class="h-6 w-3/4 bg-slate-800 rounded"></div>
            <div class="h-16 w-full bg-slate-800 rounded"></div>
            <div class="h-8 w-full bg-slate-800 rounded"></div>
            <div class="h-4 w-1/3 bg-slate-800 rounded"></div>
          </div>
        </div>

        <!-- ESTADO VACÍO -->
        <div
          v-else-if="displayedContents.length === 0"
          class="rounded-3xl border border-slate-800 bg-slate-950 p-12 text-center space-y-4 shadow-xl"
        >
          <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-3xl">
            🔍
          </div>
          <h2 class="font-heading text-xl font-bold text-white">
            No se encontraron guías
          </h2>
          <p class="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            No hay publicaciones que coincidan con los criterios de filtrado seleccionados. Prueba a buscar con otros términos o restablece los filtros.
          </p>
          <button
            type="button"
            @click="resetAllFilters"
            class="px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            :class="isNews ? 'bg-orange-500 hover:bg-orange-400 text-black' : 'bg-emerald-500 hover:bg-emerald-400 text-black'"
          >
            Restablecer todos los filtros
          </button>
        </div>

        <!-- GRID DE TARJETAS -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="content in displayedContents"
            :key="content.id"
            class="group rounded-2xl border border-slate-800 bg-slate-950/80 p-6 flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/20"
            :class="{ 'hover:border-orange-500/50 hover:shadow-orange-950/20': isNews }"
          >
            <div class="space-y-3">
              <!-- METADATOS SUPERIORES -->
              <div class="flex items-center justify-between gap-2 text-xs">
                <span class="px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold border"
                  :class="isNews
                    ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'"
                >
                  {{ (content as any).subcategoryName || (content as any).categoryName || content.type?.name || 'Guía' }}
                </span>

                <div class="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                  <span>⏱ {{ (content as any).readingTime || '6 min' }}</span>
                  <span>&bull;</span>
                  <span>📑 {{ content.pages_count || 1 }} pág.</span>
                </div>
              </div>

              <!-- TÍTULO -->
              <h2 class="font-heading text-lg font-bold text-white transition-colors leading-snug line-clamp-2"
                :class="isNews ? 'group-hover:text-orange-400' : 'group-hover:text-emerald-400'"
              >
                <NuxtLink :to="`/guia/${content.slug}`">
                  {{ content.title }}
                </NuxtLink>
              </h2>

              <!-- EXTRACTO -->
              <p class="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {{ content.excerpt }}
              </p>

              <!-- COMANDO CLAVE (SI EXISTE) -->
              <div
                v-if="(content as any).commandSnippet"
                class="rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 font-mono text-xs text-slate-300 flex items-center justify-between"
              >
                <code class="truncate text-emerald-400 font-bold">
                  $ {{ (content as any).commandSnippet }}
                </code>
                <span class="text-[9px] text-slate-500 uppercase shrink-0 ml-2">CLI</span>
              </div>
            </div>

            <!-- PIE DE TARJETA CON ETIQUETAS Y BOTÓN -->
            <div class="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div class="flex flex-wrap gap-1 max-w-[65%]">
                <span
                  v-for="tag in ((content as any).tagsList || []).slice(0, 3)"
                  :key="tag"
                  class="text-[10px] font-mono text-slate-400 hover:text-white"
                >
                  #{{ tag }}
                </span>
              </div>

              <NuxtLink
                :to="`/guia/${content.slug}`"
                class="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                :class="isNews ? 'text-orange-400 hover:text-orange-300' : 'text-emerald-400 hover:text-emerald-300'"
              >
                <span>Leer</span>
                <Icon name="lucide:arrow-right" class="h-3.5 w-3.5" />
              </NuxtLink>
            </div>
          </article>
        </div>

      </section>

      <!-- ===================================================================== -->
      <!-- 4. CONTROLES DE PAGINACIÓN -->
      <!-- ===================================================================== -->
      <nav
        v-if="paginationMeta.last_page > 1"
        aria-label="Paginación de resultados"
        class="flex items-center justify-center gap-1.5 pt-6 pb-12"
      >
        <!-- Página Anterior -->
        <button
          type="button"
          :disabled="paginationMeta.current_page <= 1"
          @click="setPage(paginationMeta.current_page - 1)"
          class="px-3 py-2 rounded-xl border text-xs font-mono font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          :class="paginationMeta.current_page <= 1
            ? 'border-slate-800 text-slate-600'
            : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'"
        >
          &larr; Anterior
        </button>

        <!-- Botones Numéricos -->
        <template v-for="(pageNum, idx) in visiblePageNumbers" :key="idx">
          <span
            v-if="pageNum === '...'"
            class="px-2 text-slate-600 font-mono text-xs"
          >
            &hellip;
          </span>
          <button
            v-else
            type="button"
            @click="setPage(Number(pageNum))"
            class="min-w-[36px] h-9 px-3 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer"
            :class="pageNum === paginationMeta.current_page
              ? (isNews ? 'bg-orange-500 text-black shadow-md' : 'bg-emerald-500 text-black shadow-md')
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'"
            :aria-current="pageNum === paginationMeta.current_page ? 'page' : undefined"
          >
            {{ pageNum }}
          </button>
        </template>

        <!-- Página Siguiente -->
        <button
          type="button"
          :disabled="paginationMeta.current_page >= paginationMeta.last_page"
          @click="setPage(paginationMeta.current_page + 1)"
          class="px-3 py-2 rounded-xl border text-xs font-mono font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          :class="paginationMeta.current_page >= paginationMeta.last_page
            ? 'border-slate-800 text-slate-600'
            : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'"
        >
          Siguiente &rarr;
        </button>
      </nav>

    </div>
  </div>
</template>
