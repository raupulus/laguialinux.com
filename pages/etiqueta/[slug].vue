<script setup lang="ts">
import type { CollectionQueryParams, ContentResource, TagResource } from '~/types'
import { formatDate } from '~/utils/formatters'
import { SAMPLE_GUIDES, SAMPLE_TAGS } from '~/utils/sampleContentsData'

const route = useRoute()
const router = useRouter()
const { platform, isGuides, isNews } = usePlatform()
const api = useApiClient()

// =============================================================================
// 1. Identificación y Recuperación de la Etiqueta
// =============================================================================
const tagSlug = computed(() => {
  try {
    return decodeURIComponent(String(route.params.slug || ''))
  } catch {
    return String(route.params.slug || '')
  }
})

// Recuperar tags de la plataforma
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

const allTags = computed<TagResource[]>(() => {
  if (tagsResponse.value?.data && tagsResponse.value.data.length > 0) {
    return tagsResponse.value.data
  }
  return SAMPLE_TAGS
})

const currentTag = computed<TagResource>(() => {
  const found = allTags.value.find(t => t.slug.toLowerCase() === tagSlug.value.toLowerCase())
  if (found) return found
  return {
    id: 0,
    slug: tagSlug.value,
    name: tagSlug.value.charAt(0).toUpperCase() + tagSlug.value.slice(1),
    color: '#10b981',
    contents_count: 0,
  }
})

// =============================================================================
// 2. Parámetros de Consulta Reactivos
// =============================================================================
const currentPage = computed(() => {
  const p = Number(route.query.page)
  return !isNaN(p) && p > 0 ? p : 1
})
const currentSort = computed(() => (route.query.sort as string) || '-published_at')
const currentType = computed(() => (route.query.tipo as string) || '')

const updateQuery = (newParams: Record<string, any>) => {
  const current = { ...route.query }
  const merged: Record<string, any> = { ...current, ...newParams }

  if (!merged.page || merged.page === 1) delete merged.page
  if (!merged.tipo) delete merged.tipo
  if (merged.sort === '-published_at') delete merged.sort

  router.push({
    path: route.path,
    query: merged,
  })
}

const setSort = (sortVal: string) => {
  updateQuery({ sort: sortVal, page: 1 })
}

const setType = (typeVal: string) => {
  updateQuery({ tipo: typeVal || undefined, page: 1 })
}

const setPage = (pageNumber: number) => {
  if (pageNumber < 1) return
  updateQuery({ page: pageNumber })
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Navegar a otra etiqueta
const navigateToTag = (newSlug: string) => {
  router.push(`/etiqueta/${newSlug}`)
}

// =============================================================================
// 3. Consulta de Publicaciones Asociadas (API V2 con Fallback Offline)
// =============================================================================
const isOffline = ref(false)

const queryParams = computed<CollectionQueryParams>(() => {
  const p: CollectionQueryParams = {
    tag: tagSlug.value,
    page: currentPage.value,
    per_page: 12,
    sort: currentSort.value,
  }
  if (currentType.value) p.type = currentType.value
  return p
})

const {
  data: apiContentsResponse,
  status,
  refresh,
} = await useAsyncData(
  () => `tag-contents-${platform.value.slug}-${tagSlug.value}-${route.fullPath}`,
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
    return item.tagsList.some(t => t.toLowerCase() === tagSlug.value.toLowerCase())
  })

  if (currentType.value) {
    local = local.filter(item => item.type?.slug === currentType.value)
  }

  if (currentSort.value === '-published_at') {
    local.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
  } else if (currentSort.value === '-views_count') {
    local.sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
  } else if (currentSort.value === 'title') {
    local.sort((a, b) => a.title.localeCompare(b.title))
  }

  const perPage = 12
  const start = (currentPage.value - 1) * perPage
  return local.slice(start, start + perPage)
})

const paginationMeta = computed(() => {
  if (apiContentsResponse.value?.meta) {
    return apiContentsResponse.value.meta
  }

  const totalFiltered = SAMPLE_GUIDES.filter(item => {
    return item.tagsList.some(t => t.toLowerCase() === tagSlug.value.toLowerCase())
  }).length

  const perPage = 12
  return {
    total: totalFiltered,
    per_page: perPage,
    current_page: currentPage.value,
    last_page: Math.max(1, Math.ceil(totalFiltered / perPage)),
    from: totalFiltered === 0 ? 0 : (currentPage.value - 1) * perPage + 1,
    to: Math.min(totalFiltered, currentPage.value * perPage),
  }
})

// Metadatos SEO Dinámicos
useSeoMeta({
  title: computed(() => `Guías y Publicaciones etiquetadas con #${currentTag.value.slug} · ${platform.value.name}`),
  description: computed(() => `Colección de guías técnicas, manuales y chuletas relacionadas con la tecnología #${currentTag.value.slug} en ${platform.value.name}.`),
  ogTitle: computed(() => `#${currentTag.value.slug} · ${platform.value.name}`),
  ogDescription: computed(() => `Publicaciones y tutoriales etiquetados con #${currentTag.value.slug}`),
})
</script>

<template>
  <div class="min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4 lg:px-8 space-y-8">

      <!-- ===================================================================== -->
      <!-- 1. BREADCRUMBS -->
      <!-- ===================================================================== -->
      <nav class="flex items-center gap-2 text-xs font-mono text-slate-400" aria-label="Migas de pan">
        <NuxtLink to="/" class="hover:text-emerald-400 transition-colors">Inicio</NuxtLink>
        <span>/</span>
        <NuxtLink to="/guias" class="hover:text-emerald-400 transition-colors">Etiquetas</NuxtLink>
        <span>/</span>
        <span class="text-emerald-400 font-bold">#{{ currentTag.slug }}</span>
      </nav>

      <!-- ===================================================================== -->
      <!-- 2. CABECERA HERO DEL TAG -->
      <!-- ===================================================================== -->
      <section class="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div class="space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold"
              :class="isNews ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'"
            >
              <span>🏷️</span> Taxonomía Transversal
            </div>

            <h1 class="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight flex items-center gap-3">
              <span :class="isNews ? 'text-orange-400' : 'text-emerald-400'">#{{ currentTag.slug }}</span>
            </h1>

            <p class="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Colección completa de manuales prácticos, chuletas de terminal, tutoriales de configuración y artículos técnicos vinculados a la tecnología <strong>#{{ currentTag.name }}</strong>.
            </p>
          </div>

          <div class="flex items-center gap-3 sm:self-center shrink-0">
            <div class="px-5 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-center font-mono shadow-sm">
              <span class="block text-2xl sm:text-3xl font-black" :class="isNews ? 'text-orange-400' : 'text-emerald-400'">
                {{ paginationMeta.total || currentTag.contents_count }}
              </span>
              <span class="text-[10px] text-slate-400 uppercase tracking-wider">
                Publicaciones
              </span>
            </div>
          </div>
        </div>

        <!-- SELECTOR DE ETIQUETAS POPULARES -->
        <div class="pt-4 border-t border-slate-800/80 space-y-2">
          <div class="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Etiquetas técnicas populares:
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="t in allTags"
              :key="t.slug"
              type="button"
              @click="navigateToTag(t.slug)"
              class="px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
              :class="t.slug === tagSlug
                ? (isNews ? 'bg-orange-500 text-black shadow-md' : 'bg-emerald-500 text-black shadow-md')
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'"
            >
              #{{ t.name }} <span class="opacity-75 text-[10px]">({{ t.contents_count }})</span>
            </button>
          </div>
        </div>
      </section>

      <!-- ===================================================================== -->
      <!-- 3. BARRA DE HERRAMIENTAS Y ORDEN -->
      <!-- ===================================================================== -->
      <section class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono text-slate-400">Tipo:</span>
          <button
            type="button"
            @click="setType('')"
            class="px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer"
            :class="!currentType ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'"
          >
            Todos
          </button>
          <button
            type="button"
            @click="setType('guide')"
            class="px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer"
            :class="currentType === 'guide' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'"
          >
            Guías
          </button>
          <button
            type="button"
            @click="setType('command')"
            class="px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer"
            :class="currentType === 'command' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'"
          >
            Comandos
          </button>
        </div>

        <div class="flex items-center gap-3 text-xs text-slate-400">
          <span class="font-mono text-slate-400 text-[11px]">
            {{ paginationMeta.total }} resultados
          </span>
          <span>Ordenar:</span>
          <div class="relative">
            <select
              :value="currentSort"
              @change="setSort(($event.target as HTMLSelectElement).value)"
              class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 pr-8 text-xs text-slate-200 focus:outline-none appearance-none font-medium cursor-pointer"
              :class="isNews ? 'focus:border-orange-500' : 'focus:border-emerald-500'"
            >
              <option value="-published_at">Más recientes</option>
              <option value="-views_count">Más leídos / Populares</option>
              <option value="title">Alfabético (A-Z)</option>
            </select>
            <Icon name="lucide:chevron-down" class="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </section>

      <!-- ===================================================================== -->
      <!-- 4. GRID DE TARJETAS -->
      <!-- ===================================================================== -->
      <section aria-label="Publicaciones con la etiqueta">

        <!-- SKELETON LOADING -->
        <div v-if="status === 'pending'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4 animate-pulse">
            <div class="h-4 w-20 bg-slate-800 rounded"></div>
            <div class="h-6 w-3/4 bg-slate-800 rounded"></div>
            <div class="h-16 w-full bg-slate-800 rounded"></div>
          </div>
        </div>

        <!-- ESTADO VACÍO -->
        <div
          v-else-if="displayedContents.length === 0"
          class="rounded-3xl border border-slate-800 bg-slate-950 p-12 text-center space-y-4 shadow-xl"
        >
          <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-3xl">
            🏷️
          </div>
          <h2 class="font-heading text-xl font-bold text-white">
            No hay publicaciones con la etiqueta #{{ currentTag.slug }}
          </h2>
          <p class="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Actualmente no disponemos de guías categorizadas con este tag o el filtro aplicado no coincide con ningún resultado.
          </p>
          <NuxtLink
            to="/guias"
            class="inline-block px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            :class="isNews ? 'bg-orange-500 hover:bg-orange-400 text-black' : 'bg-emerald-500 hover:bg-emerald-400 text-black'"
          >
            Ver catálogo general de guías
          </NuxtLink>
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
              <!-- Metadatos superiores -->
              <div class="flex items-center justify-between gap-2 text-xs">
                <span class="px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold border"
                  :class="isNews
                    ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'"
                >
                  {{ (content as any).subcategoryName || (content as any).categoryName || 'Guía' }}
                </span>

                <div class="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                  <span>⏱ {{ (content as any).readingTime || '6 min' }}</span>
                  <span>&bull;</span>
                  <span>📑 {{ content.pages_count || 1 }} pág.</span>
                </div>
              </div>

              <!-- Título -->
              <h2 class="font-heading text-lg font-bold text-white transition-colors leading-snug line-clamp-2"
                :class="isNews ? 'group-hover:text-orange-400' : 'group-hover:text-emerald-400'"
              >
                <NuxtLink :to="`/guia/${content.slug}`">
                  {{ content.title }}
                </NuxtLink>
              </h2>

              <!-- Extracto -->
              <p class="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {{ content.excerpt }}
              </p>

              <!-- Snippet de comando si existe -->
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

            <!-- Footer con tags y enlace -->
            <div class="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div class="flex flex-wrap gap-1 max-w-[65%]">
                <NuxtLink
                  v-for="t in ((content as any).tagsList || []).slice(0, 3)"
                  :key="t"
                  :to="`/etiqueta/${t}`"
                  class="text-[10px] font-mono text-slate-400 hover:text-white transition-colors"
                  :class="{ 'text-emerald-400 font-bold': t.toLowerCase() === tagSlug.toLowerCase() }"
                >
                  #{{ t }}
                </NuxtLink>
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
      <!-- 5. PAGINACIÓN -->
      <!-- ===================================================================== -->
      <nav
        v-if="paginationMeta.last_page > 1"
        aria-label="Paginación de etiquetas"
        class="flex items-center justify-center gap-2 pt-6 pb-12"
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
  </div>
</template>
