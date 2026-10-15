<script setup lang="ts">
import type { CategoryResource, CollectionQueryParams, ContentResource, SubcategoryResource, TagResource } from '~/types'
import { DEFAULT_CATEGORIES } from '~/utils/categoriesData'
import { SAMPLE_GUIDES, SAMPLE_TAGS } from '~/utils/sampleContentsData'

const route = useRoute()
const router = useRouter()
const { platform, isGuides, isNews } = usePlatform()
const api = useApiClient()

// Soporte dinámico para cambio cromático multi-tenant ('emerald' vs 'orange')
const isOrangeTheme = computed(() => platform.value.themeAccent === 'orange' || isNews.value)

// =============================================================================
// 1. Identificación y Validación de la Categoría Raíz
// =============================================================================
const categorySlug = computed(() => {
  try {
    return decodeURIComponent(String(route.params.slug || ''))
  } catch {
    return String(route.params.slug || '')
  }
})

// Recuperación reactiva del árbol de categorías
const { data: categoriesResponse } = await useAsyncData(
  `category-tree-${platform.value.slug}`,
  async () => {
    try {
      return await api.getCategories()
    } catch {
      return null
    }
  }
)

const allCategories = computed<CategoryResource[]>(() => {
  if (categoriesResponse.value?.data && categoriesResponse.value.data.length > 0) {
    return categoriesResponse.value.data
  }
  const current = DEFAULT_CATEGORIES[platform.value.slug] || []
  const otherSlug = platform.value.slug === 'news' ? 'laguialinux' : 'news'
  const other = DEFAULT_CATEGORIES[otherSlug] || []
  return [...current, ...other]
})

const currentCategory = computed<CategoryResource | undefined>(() => {
  const slug = categorySlug.value.toLowerCase()
  return allCategories.value.find(c => c.slug.toLowerCase() === slug)
})

// Validador de categoría para emisión de error 404
const validateCategoryOrThrow = (targetSlug: string) => {
  const normalized = targetSlug.toLowerCase()
  const exists = allCategories.value.some(c => c.slug.toLowerCase() === normalized)
  if (!exists) {
    showError({
      statusCode: 404,
      statusMessage: `Categoría "${targetSlug}" no encontrada en ${platform.value.name}`,
      fatal: false,
    })
    return false
  }
  return true
}

// Si no existe la categoría en el árbol en el render inicial (SSR / primera carga), lanzar error 404
if (!currentCategory.value) {
  throw createError({
    statusCode: 404,
    statusMessage: `Categoría "${categorySlug.value}" no encontrada en ${platform.value.name}`,
    fatal: true,
  })
}

// Observador reactivo para interceptar navegaciones del cliente a slugs inexistentes
watch(
  () => route.params.slug,
  (newSlug) => {
    if (newSlug) {
      let decoded = String(newSlug)
      try {
        decoded = decodeURIComponent(decoded)
      } catch {
        // Fallback si decodeURIComponent falla
      }
      validateCategoryOrThrow(decoded)
    }
  }
)

// Subcategorías de la raíz activa
const subcategories = computed<SubcategoryResource[]>(() => {
  return currentCategory.value?.subcategories || []
})

// Subcategoría activa vía query param (?subcategoria=...)
const activeSubcategorySlug = computed(() => (route.query.subcategoria as string) || '')

const activeSubcategory = computed<SubcategoryResource | undefined>(() => {
  if (!activeSubcategorySlug.value) return undefined
  return subcategories.value.find(s => s.slug === activeSubcategorySlug.value)
})

// =============================================================================
// 2. Parámetros de Consulta Reactivos y Estado de Filtros
// =============================================================================
const currentPage = computed(() => {
  const raw = Number(route.query.page)
  if (!Number.isFinite(raw) || isNaN(raw)) return 1
  const intVal = Math.floor(raw)
  return intVal > 0 ? intVal : 1
})
const currentSort = computed(() => (route.query.sort as string) || '-published_at')
const searchQuery = computed(() => (route.query.q as string) || '')

const localSearchInput = ref(searchQuery.value)
let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (newVal) => {
  if (newVal !== localSearchInput.value) {
    localSearchInput.value = newVal
  }
})

const handleSearch = (query: string) => {
  localSearchInput.value = query
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    updateQuery({ q: query.trim() || undefined, page: 1 })
  }, 300)
}

const clearSearch = () => {
  localSearchInput.value = ''
  if (searchTimer) clearTimeout(searchTimer)
  updateQuery({ q: undefined, page: 1 })
}

const updateQuery = (newParams: Record<string, any>) => {
  const current = { ...route.query }
  const merged: Record<string, any> = { ...current, ...newParams }

  if (!merged.page || merged.page === 1) delete merged.page
  if (!merged.subcategoria) delete merged.subcategoria
  if (!merged.q) delete merged.q
  if (merged.sort === '-published_at') delete merged.sort

  router.push({
    path: route.path,
    query: merged,
  })
}

const setSubcategory = (slug: string | null) => {
  updateQuery({
    subcategoria: slug || undefined,
    page: 1,
  })
}

const toggleSubcategory = (slug: string) => {
  if (activeSubcategorySlug.value === slug) {
    setSubcategory(null)
  } else {
    setSubcategory(slug)
  }
}

const handleSort = (sortVal: string) => {
  updateQuery({ sort: sortVal, page: 1 })
}

const setPage = (pageNumber: number) => {
  if (pageNumber < 1) return
  updateQuery({ page: pageNumber })
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const resetCategoryFilters = () => {
  localSearchInput.value = ''
  router.push({ path: route.path, query: {} })
}

// Selector compacto dropdown para móviles
const isDropdownOpen = ref(false)
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}
const closeDropdown = () => {
  isDropdownOpen.value = false
}

// =============================================================================
// 3. Consulta de Contenidos a API V2 (Con Fallback Offline)
// =============================================================================
const isOffline = ref(false)

const queryParams = computed<CollectionQueryParams>(() => {
  const targetCategory = activeSubcategorySlug.value || categorySlug.value
  const p: CollectionQueryParams = {
    category: targetCategory,
    page: currentPage.value,
    per_page: 10,
    sort: currentSort.value,
  }
  if (searchQuery.value) p.q = searchQuery.value
  return p
})

const {
  data: apiContentsResponse,
  status,
  refresh,
} = await useAsyncData(
  () => `category-contents-${platform.value.slug}-${route.fullPath}`,
  async () => {
    try {
      const res = await api.getContents(queryParams.value)
      isOffline.value = false
      return res
    } catch {
      isOffline.value = true
      return null
    }
  },
  {
    watch: [() => route.fullPath],
  }
)

// Computado de contenidos procesados
const displayedContents = computed<ContentResource[]>(() => {
  if (apiContentsResponse.value?.data && Array.isArray(apiContentsResponse.value.data)) {
    return apiContentsResponse.value.data
  }

  // FALLBACK OFFLINE: Filtrado local
  let local = SAMPLE_GUIDES.filter(item => {
    if (item.categorySlug !== categorySlug.value) return false
    if (activeSubcategorySlug.value && item.subcategorySlug !== activeSubcategorySlug.value) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const matchTitle = item.title.toLowerCase().includes(q)
      const matchExcerpt = (item.excerpt || '').toLowerCase().includes(q)
      const matchTags = item.tagsList.some(t => t.toLowerCase().includes(q))
      const matchCmd = (item.commandSnippet || '').toLowerCase().includes(q)
      if (!matchTitle && !matchExcerpt && !matchTags && !matchCmd) return false
    }
    return true
  })

  if (currentSort.value === '-published_at') {
    local.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
  } else if (currentSort.value === '-views_count') {
    local.sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
  } else if (currentSort.value === 'title') {
    local.sort((a, b) => a.title.localeCompare(b.title))
  }

  const perPage = 10
  const start = (currentPage.value - 1) * perPage
  return local.slice(start, start + perPage)
})

const paginationMeta = computed(() => {
  if (apiContentsResponse.value?.meta) {
    return apiContentsResponse.value.meta
  }

  const totalFiltered = SAMPLE_GUIDES.filter(item => {
    if (item.categorySlug !== categorySlug.value) return false
    if (activeSubcategorySlug.value && item.subcategorySlug !== activeSubcategorySlug.value) return false
    return true
  }).length

  const perPage = 10
  return {
    total: totalFiltered,
    per_page: perPage,
    current_page: currentPage.value,
    last_page: Math.max(1, Math.ceil(totalFiltered / perPage)),
    from: totalFiltered === 0 ? 0 : (currentPage.value - 1) * perPage + 1,
    to: Math.min(totalFiltered, currentPage.value * perPage),
  }
})

// =============================================================================
// 4. Nube de Etiquetas Ponderada (Weighted Tag Cloud)
// =============================================================================
const { data: tagsResponse } = await useAsyncData(
  `tags-${platform.value.slug}`,
  async () => {
    try {
      return await api.getTags()
    } catch {
      return null
    }
  }
)

const tags = computed<TagResource[]>(() => {
  if (tagsResponse.value?.data && tagsResponse.value.data.length > 0) {
    return tagsResponse.value.data
  }
  return SAMPLE_TAGS
})

// Cálculo de clases de ponderación tipográfica (text-xs a text-lg) con soporte multi-tenant
const getWeightedTagClasses = (count: number) => {
  if (count >= 24) {
    return isOrangeTheme.value
      ? 'text-base font-bold text-orange-300 bg-orange-950/40 border border-orange-500/50 shadow-sm'
      : 'text-base font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-500/50 shadow-sm'
  }
  if (count >= 15) {
    return isOrangeTheme.value
      ? 'text-sm font-semibold text-orange-400 bg-orange-950/30 border border-orange-800/40'
      : 'text-sm font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-800/40'
  }
  if (count >= 8) {
    return 'text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700'
  }
  return 'text-xs font-normal text-slate-400 bg-slate-900/80 border border-slate-800'
}

// =============================================================================
// 5. Metadatos SEO Dinámicos y Marcado Estructurado JSON-LD con useSeoEngine
// =============================================================================
useSeoEngine(() => ({
  title: currentCategory.value?.name || 'Categoría',
  description: currentCategory.value?.description || (isNews.value ? `Noticias de actualidad y novedades sobre ${currentCategory.value?.name}` : `Guías técnicas y manuales de ${currentCategory.value?.name}`),
  canonicalUrl: `https://${platform.value.domain}/categoria/${categorySlug.value}`,
  imageUrl: currentCategory.value?.urlImageSmall || (isNews.value ? '/assets/img/covers/cover_news.webp' : '/assets/img/covers/cover_guias.webp'),
  imageAlt: `Categoría ${currentCategory.value?.name || ''}`,
  type: 'website',
  schemaType: 'BreadcrumbList',
  rssAlternateLinks: [
    {
      title: `RSS ${currentCategory.value?.name || 'Categoría'} · ${platform.value.name}`,
      href: `https://${platform.value.domain}/${categorySlug.value}/feed.xml`,
    },
  ],
  breadcrumbs: [
    { name: 'Inicio', url: `https://${platform.value.domain}/` },
    { name: isNews.value ? 'Noticias' : 'Categorías', url: `https://${platform.value.domain}${isNews.value ? '/' : '/guias'}` },
    { name: currentCategory.value?.name || 'Categoría', url: `https://${platform.value.domain}/categoria/${categorySlug.value}` },
    ...(activeSubcategory.value ? [{ name: activeSubcategory.value.name, url: `https://${platform.value.domain}/categoria/${categorySlug.value}?subcategoria=${activeSubcategory.value.slug}` }] : []),
  ],
}))
</script>

<template>
  <div class="min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4 lg:px-8 space-y-8">

      <!-- ===================================================================== -->
      <!-- 1. BREADCRUMBS EDITORIALES -->
      <!-- ===================================================================== -->
      <nav class="flex items-center gap-2 text-xs font-mono text-slate-400" aria-label="Migas de pan">
        <NuxtLink to="/" class="transition-colors" :class="isOrangeTheme ? 'hover:text-orange-400' : 'hover:text-emerald-400'">Inicio</NuxtLink>
        <span>/</span>
        <NuxtLink :to="isNews ? '/' : '/guias'" class="transition-colors" :class="isOrangeTheme ? 'hover:text-orange-400' : 'hover:text-emerald-400'">{{ isNews ? 'Noticias' : 'Categorías' }}</NuxtLink>
        <span>/</span>
        <span class="text-white font-semibold">{{ currentCategory?.name }}</span>
        <template v-if="activeSubcategory">
          <span>/</span>
          <span class="font-bold" :class="isOrangeTheme ? 'text-orange-400' : 'text-emerald-400'">{{ activeSubcategory.name }}</span>
        </template>
      </nav>

      <!-- ===================================================================== -->
      <!-- 2. CABECERA HERO DE CATEGORÍA DINÁMICA -->
      <!-- ===================================================================== -->
      <section
        class="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl"
      >
        <div
          class="absolute -right-8 -bottom-8 opacity-5 font-mono text-9xl font-black select-none pointer-events-none"
          :class="isOrangeTheme ? 'text-orange-400' : 'text-emerald-400'"
        >
          &gt;
        </div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="max-w-3xl space-y-3">
            <div
              class="flex items-center gap-2 text-xs font-mono uppercase tracking-widest font-bold"
              :class="isOrangeTheme ? 'text-orange-400' : 'text-emerald-400'"
            >
              <span
                class="w-2.5 h-2.5 rounded-sm shadow-sm"
                :class="isOrangeTheme ? 'bg-orange-500 shadow-orange-500/50' : 'bg-emerald-500 shadow-emerald-500/50'"
              ></span>
              {{ isNews ? 'Categoría de Noticias y Actualidad' : 'Categoría Técnica Especializada' }}
            </div>

            <h1 class="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
              {{ currentCategory?.name }}
            </h1>

            <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
              {{ currentCategory?.description }}
            </p>
          </div>

          <div class="flex flex-wrap md:flex-col items-start md:items-end gap-2.5 text-xs font-mono shrink-0">
            <span class="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 shadow-sm">
              📊 <strong>{{ currentCategory?.contents_count }}</strong> {{ isNews ? 'Noticias' : 'Guías' }} publicadas
            </span>
          </div>
        </div>
      </section>

      <!-- ===================================================================== -->
      <!-- 3. BARRA DE PÍLDORAS DE SUBCATEGORÍAS (FLUIDAS + SCROLL HORIZONTAL) -->
      <!-- ===================================================================== -->
      <section
        v-if="subcategories.length > 0"
        class="rounded-2xl border border-slate-800/90 bg-slate-950/80 p-5 shadow-xl backdrop-blur-sm space-y-4"
        aria-label="Subcategorías y especialidades"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div class="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            <span>Especialidades y Subtemas</span>
            <span class="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-400">
              {{ subcategories.length }} subtemas disponibles
            </span>
          </div>

          <!-- Selector desplegable compacto para pantallas móviles -->
          <div class="relative sm:hidden">
            <button
              type="button"
              @click="toggleDropdown"
              class="w-full inline-flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 text-xs font-mono text-slate-200 border border-slate-700 cursor-pointer"
            >
              <span>{{ activeSubcategory ? activeSubcategory.name : 'Todos los subtemas' }}</span>
              <Icon name="lucide:chevron-down" class="h-3.5 w-3.5 text-slate-400 transition-transform" :class="{ 'rotate-180': isDropdownOpen }" />
            </button>

            <div
              v-if="isDropdownOpen"
              class="absolute right-0 mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 p-2 space-y-1"
            >
              <button
                type="button"
                @click="setSubcategory(null); closeDropdown()"
                class="w-full text-left p-2 rounded-lg text-xs flex justify-between cursor-pointer"
                :class="!activeSubcategorySlug
                  ? (isOrangeTheme ? 'bg-orange-500/20 text-orange-300 font-bold' : 'bg-emerald-500/20 text-emerald-300 font-bold')
                  : 'text-slate-300 hover:bg-slate-800'"
              >
                <span>Todos los subtemas</span>
                <span>{{ currentCategory?.contents_count }}</span>
              </button>
              <button
                v-for="sub in subcategories"
                :key="sub.slug"
                type="button"
                @click="setSubcategory(sub.slug); closeDropdown()"
                class="w-full text-left p-2 rounded-lg text-xs flex justify-between cursor-pointer"
                :class="activeSubcategorySlug === sub.slug
                  ? (isOrangeTheme ? 'bg-orange-500/20 text-orange-300 font-bold' : 'bg-emerald-500/20 text-emerald-300 font-bold')
                  : 'text-slate-300 hover:bg-slate-800'"
              >
                <span>{{ sub.name }}</span>
                <span>{{ sub.contents_count }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- PÍLDORAS HORIZONTALES CON BOTÓN 'TODAS' -->
        <div class="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          <!-- Píldora Todas -->
          <button
            type="button"
            @click="setSubcategory(null)"
            class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 shrink-0 cursor-pointer"
            :class="!activeSubcategorySlug
              ? (isOrangeTheme
                  ? 'bg-orange-500 text-slate-950 font-bold shadow-md shadow-orange-500/20 border border-orange-400'
                  : 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20 border border-emerald-400')
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'"
          >
            <Icon name="lucide:layout-grid" class="w-3.5 h-3.5" />
            <span>Todas</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px] font-mono"
              :class="!activeSubcategorySlug ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400'"
            >
              {{ currentCategory?.contents_count }}
            </span>
          </button>

          <!-- Píldoras de Subcategorías -->
          <button
            v-for="sub in subcategories"
            :key="sub.slug"
            type="button"
            @click="toggleSubcategory(sub.slug)"
            class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 shrink-0 group cursor-pointer"
            :class="activeSubcategorySlug === sub.slug
              ? (isOrangeTheme
                  ? 'bg-orange-500/15 border border-orange-500/70 text-orange-300 font-bold shadow-sm shadow-orange-500/10 ring-1 ring-orange-500/40'
                  : 'bg-emerald-500/15 border border-emerald-500/70 text-emerald-300 font-bold shadow-sm shadow-emerald-500/10 ring-1 ring-emerald-500/40')
              : (isOrangeTheme
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-orange-500/40'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-emerald-500/40')"
          >
            <Icon
              name="lucide:folder"
              class="w-3.5 h-3.5 shrink-0"
              :class="activeSubcategorySlug === sub.slug
                ? (isOrangeTheme ? 'text-orange-400' : 'text-emerald-400')
                : (isOrangeTheme ? 'text-slate-500 group-hover:text-orange-400' : 'text-slate-500 group-hover:text-emerald-400')"
            />
            <span>{{ sub.name }}</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px] font-mono shrink-0"
              :class="activeSubcategorySlug === sub.slug
                ? (isOrangeTheme ? 'bg-orange-500/30 text-orange-200 font-bold' : 'bg-emerald-500/30 text-emerald-200 font-bold')
                : 'bg-slate-950 text-slate-400'"
            >
              {{ sub.contents_count }}
            </span>
            <span
              v-if="activeSubcategorySlug === sub.slug"
              class="text-[10px] ml-0.5 opacity-70 hover:opacity-100"
              title="Quitar filtro"
            >
              ✕
            </span>
          </button>
        </div>

        <!-- BARRA DE ESTADO DE FILTROS ACTIVOS -->
        <div v-if="activeSubcategorySlug || searchQuery" class="pt-3 border-t border-slate-800/60 flex flex-wrap items-center gap-2">
          <span class="text-[11px] font-mono uppercase text-slate-400 mr-1">Filtros activos:</span>

          <div
            v-if="activeSubcategory"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono"
            :class="isOrangeTheme ? 'border-orange-500/30 bg-orange-500/15 text-orange-300' : 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'"
          >
            <span>Subtema: <strong>{{ activeSubcategory.name }}</strong> ({{ activeSubcategory.contents_count }})</span>
            <button type="button" @click="setSubcategory(null)" class="ml-1 p-0.5 hover:text-white cursor-pointer">✕</button>
          </div>

          <div v-if="searchQuery" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-sky-500/30 bg-sky-500/15 text-sky-300 text-xs font-mono">
            <span>🔍 Buscar: <strong>"{{ searchQuery }}"</strong></span>
            <button type="button" @click="clearSearch" class="ml-1 p-0.5 hover:text-white cursor-pointer">✕</button>
          </div>

          <button
            type="button"
            @click="resetCategoryFilters"
            class="text-xs font-mono text-slate-400 hover:text-white underline ml-2 transition-colors cursor-pointer"
          >
            Limpiar todo
          </button>
        </div>
      </section>

      <!-- ===================================================================== -->
      <!-- 4. DISTRIBUCIÓN PRINCIPAL (FEED IZQUIERDO + SIDEBAR DERECHO) -->
      <!-- ===================================================================== -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <!-- 4.1. COLUMNA IZQUIERDA: FEED DE PUBLICACIONES (8 COLS) -->
        <div class="lg:col-span-8 space-y-6">

          <!-- TOOLBAR DE BÚSQUEDA Y ORDENACIÓN -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div class="relative w-full sm:w-80">
              <input
                type="text"
                :value="localSearchInput"
                @input="handleSearch(($event.target as HTMLInputElement).value)"
                placeholder="Filtrar dentro de esta categoría..."
                class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none transition-colors"
                :class="isOrangeTheme ? 'focus:border-orange-500' : 'focus:border-emerald-500'"
              />
              <Icon name="lucide:search" class="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <button
                v-if="localSearchInput"
                type="button"
                @click="clearSearch"
                class="absolute right-2.5 top-2.5 text-slate-400 hover:text-white text-xs p-0.5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div class="flex items-center gap-3 text-xs text-slate-400 self-end sm:self-center">
              <span class="font-mono text-slate-400 text-[11px] hidden sm:inline">
                {{ paginationMeta.total }} {{ isNews ? 'noticias disponibles' : 'guías disponibles' }}
              </span>
              <span>Ordenar:</span>
              <div class="relative">
                <select
                  :value="currentSort"
                  @change="handleSort(($event.target as HTMLSelectElement).value)"
                  class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 pr-8 text-xs text-slate-200 focus:outline-none appearance-none font-medium cursor-pointer"
                  :class="isOrangeTheme ? 'focus:border-orange-500' : 'focus:border-emerald-500'"
                >
                  <option value="-published_at">Más recientes</option>
                  <option value="-views_count">Más leídos / populares</option>
                  <option value="title">Alfabético (A-Z)</option>
                </select>
                <Icon name="lucide:chevron-down" class="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <!-- SKELETON LOADING -->
          <div v-if="status === 'pending'" class="space-y-4">
            <div v-for="i in 4" :key="i" class="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3 animate-pulse">
              <div class="h-4 w-32 bg-slate-800 rounded"></div>
              <div class="h-6 w-2/3 bg-slate-800 rounded"></div>
              <div class="h-12 w-full bg-slate-800 rounded"></div>
            </div>
          </div>

          <!-- ESTADO VACÍO -->
          <div
            v-else-if="displayedContents.length === 0"
            class="p-12 text-center bg-slate-950 border border-slate-800 rounded-2xl space-y-3"
          >
            <div class="text-3xl">🔍</div>
            <h3 class="text-lg font-bold text-white">{{ isNews ? 'No se encontraron noticias' : 'No se encontraron guías' }}</h3>
            <p class="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              No hay publicaciones que coincidan con la búsqueda dentro de esta categoría. Prueba con otros términos o restablece los filtros.
            </p>
            <button
              type="button"
              @click="resetCategoryFilters"
              class="px-4 py-2 rounded-xl text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
              :class="isOrangeTheme ? 'bg-orange-500 hover:bg-orange-400' : 'bg-emerald-600 hover:bg-emerald-500'"
            >
              Restablecer Filtros
            </button>
          </div>

          <!-- LISTADO DE TARJETAS DE CONTENIDO -->
          <div v-else class="space-y-6">
            <template v-for="(item, index) in displayedContents" :key="item.id">
              <article
                class="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 group shadow-lg"
                :class="isOrangeTheme ? 'hover:border-orange-500/50' : 'hover:border-emerald-500/50'"
              >
                <div class="p-6">
                  <!-- Metadatos superiores -->
                  <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 mb-3">
                    <button
                      type="button"
                      @click="setSubcategory((item as any).subcategorySlug || null)"
                      class="px-2.5 py-1 rounded font-semibold border font-mono text-[11px] transition-colors cursor-pointer"
                      :class="isOrangeTheme
                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'"
                    >
                      {{ (item as any).subcategoryName || (item as any).categoryName || currentCategory?.name }}
                    </button>
                    <div class="flex items-center gap-3 font-mono text-[11px]">
                      <span>⏱ {{ (item as any).readingTime || '5 min' }}</span>
                      <span>&bull;</span>
                      <span>📑 {{ item.pages_count || 1 }} pág.</span>
                      <span>&bull;</span>
                      <span>👁 {{ item.views_count || 1200 }} visitas</span>
                    </div>
                  </div>

                  <!-- Título -->
                  <h2
                    class="text-xl sm:text-2xl font-bold text-white transition-colors mb-3 leading-snug"
                    :class="isOrangeTheme ? 'group-hover:text-orange-400' : 'group-hover:text-emerald-400'"
                  >
                    <NuxtLink :to="isNews ? `/noticia/${item.slug}` : `/guia/${item.slug}`">
                      {{ item.title }}
                    </NuxtLink>
                  </h2>

                  <!-- Extracto -->
                  <p class="text-slate-400 text-sm leading-relaxed mb-4">
                    {{ item.excerpt }}
                  </p>

                  <!-- Snippet de comando clave si existe -->
                  <div
                    v-if="(item as any).commandSnippet"
                    class="bg-slate-900 p-3 rounded-xl border border-slate-800 mb-4 font-mono text-xs text-slate-300 flex items-center justify-between"
                  >
                    <code><span class="font-bold" :class="isOrangeTheme ? 'text-orange-400' : 'text-emerald-400'"># </span>{{ (item as any).commandSnippet }}</code>
                    <span class="text-[10px] text-slate-500 uppercase tracking-wider">Comando clave</span>
                  </div>

                  <!-- Footer con tags y enlace -->
                  <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
                    <div class="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                      <span class="text-slate-500 font-mono text-[11px]">Etiquetas:</span>
                      <NuxtLink
                        v-for="t in ((item as any).tagsList || [])"
                        :key="t"
                        :to="`/etiqueta/${t}`"
                        class="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[11px] font-mono transition-colors"
                        :class="isOrangeTheme ? 'hover:border-orange-500/50 hover:text-orange-300' : 'hover:border-emerald-500/50 hover:text-emerald-300'"
                      >
                        #{{ t }}
                      </NuxtLink>
                    </div>

                    <NuxtLink
                      :to="isNews ? `/noticia/${item.slug}` : `/guia/${item.slug}`"
                      class="inline-flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider"
                      :class="isOrangeTheme ? 'text-orange-400 hover:text-orange-300' : 'text-emerald-400 hover:text-emerald-300'"
                    >
                      {{ isNews ? 'Leer Noticia Completa' : 'Ver Guía Completa' }} &rarr;
                    </NuxtLink>
                  </div>
                </div>
              </article>

              <!-- In-feed AdSense Slot tras la 2ª tarjeta (Anti-CLS container) -->
              <AdSlot
                v-if="index === 1"
                type="ad-in-feed"
                slot-id="1000000003"
              />
            </template>
          </div>

          <!-- PAGINACIÓN -->
          <nav
            v-if="paginationMeta.last_page > 1"
            class="flex items-center justify-center gap-2 pt-6"
            aria-label="Paginación de categoría"
          >
            <button
              type="button"
              :disabled="paginationMeta.current_page <= 1"
              @click="setPage(paginationMeta.current_page - 1)"
              class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-mono cursor-pointer"
            >
              &larr; Anterior
            </button>

            <span class="text-xs font-mono text-slate-400 px-3">
              Página {{ paginationMeta.current_page }} de {{ paginationMeta.last_page }}
            </span>

            <button
              type="button"
              :disabled="paginationMeta.current_page >= paginationMeta.last_page"
              @click="setPage(paginationMeta.current_page + 1)"
              class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-mono cursor-pointer"
            >
              Siguiente &rarr;
            </button>
          </nav>

        </div>

        <!-- 4.2. COLUMNA DERECHA: SIDEBAR (4 COLS) -->
        <aside class="lg:col-span-4 space-y-6">

          <!-- WIDGET NEWSLETTER INLINE -->
          <div
            class="border rounded-2xl p-6 shadow-xl space-y-3"
            :class="isOrangeTheme
              ? 'bg-gradient-to-br from-orange-950/40 to-slate-900 border-orange-500/30'
              : 'bg-gradient-to-br from-emerald-950/40 to-slate-900 border-emerald-500/30'"
          >
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
              :class="isOrangeTheme ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'"
            >
              ✉️
            </div>
            <h3 class="text-base font-bold text-white">
              {{ isNews ? 'Boletín de Actualidad Linux' : 'Boletín Técnico de La Guía Linux' }}
            </h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              {{ isNews
                ? 'Recibe las últimas noticias de distribuciones, kernel y ciberseguridad directamente en tu correo. Doble opt-in, sin spam.'
                : 'Recibe nuevas guías, chuletas en PDF y trucos de terminal directamente en tu correo. Doble opt-in, sin spam.' }}
            </p>
            <form class="space-y-3" @submit.prevent>
              <input
                type="email"
                required
                placeholder="tu-correo@ejemplo.com"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none"
                :class="isOrangeTheme ? 'focus:border-orange-500' : 'focus:border-emerald-500'"
              />
              <button
                type="submit"
                class="w-full py-2.5 text-slate-950 font-bold rounded-xl text-xs transition-colors font-mono uppercase tracking-wider cursor-pointer"
                :class="isOrangeTheme ? 'bg-orange-500 hover:bg-orange-400' : 'bg-emerald-600 hover:bg-emerald-500'"
              >
                Suscribirme Gratis
              </button>
            </form>
          </div>

          <!-- ANUNCIO ADSENSE SIDEBAR STICKY (300x250 o 300x600 Anti-CLS) -->
          <AdSlot type="sidebar-rectangle" slot-id="1000000002" :sticky="true" />

          <!-- NUBE DE ETIQUETAS PONDERADA (WEIGHTED TAG CLOUD) -->
          <div class="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 class="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
              <span :class="isOrangeTheme ? 'text-orange-400' : 'text-emerald-400'">#</span> Nube de Etiquetas Populares
            </h3>
            <div class="flex flex-wrap items-center gap-2">
              <NuxtLink
                v-for="t in tags"
                :key="t.slug"
                :to="`/etiqueta/${t.slug}`"
                :class="[
                  getWeightedTagClasses(t.contents_count),
                  isOrangeTheme
                    ? 'hover:border-orange-500 hover:text-orange-300'
                    : 'hover:border-emerald-500 hover:text-emerald-300'
                ]"
                class="px-2.5 py-1 rounded-lg font-mono transition-all hover:scale-105"
              >
                #{{ t.name }} <span class="opacity-75 text-[10px]">({{ t.contents_count }})</span>
              </NuxtLink>
            </div>
          </div>

        </aside>

      </div>

    </div>
  </div>
</template>
