<!--
  SearchModal.vue - Buscador Global Universal con atajo Cmd+K / Ctrl+K
  La Guía Linux (laguialinux.com & news.laguialinux.com)
  Licencia: GNU AGPLv3
-->
<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNavigationStore } from '~/stores/navigation'
import { usePlatform } from '~/composables/usePlatform'
import { useApiClient } from '~/composables/useApiClient'
import { SAMPLE_GUIDES, SAMPLE_NEWS } from '~/utils/sampleContentsData'
import type { ContentResource } from '~/types'

const router = useRouter()
const nav = useNavigationStore()
const { platform, isGuides, isNews } = usePlatform()
const { getContents } = useApiClient()

// =============================================================================
// Estado reactivo del buscador
// =============================================================================
const RECENT_KEY = 'lgl_recent_searches'
const MAX_RECENT = 8

const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const modalContainerRef = ref<HTMLElement | null>(null)
const isLoading = ref(false)
const selectedIndex = ref(0)
const recentSearches = ref<string[]>([])
const searchResults = ref<Array<{
  id: number
  title: string
  slug: string
  excerpt: string
  type: string
  categorySlug: string
  categoryName: string
  published_at?: string
  views_count?: number
  url: string
  commandSnippet?: string
}>>([])

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let previousActiveElement: HTMLElement | null = null

// =============================================================================
// Carga y persistencia del historial de búsquedas recientes
// =============================================================================
const loadRecentSearches = () => {
  if (import.meta.client) {
    try {
      const stored = localStorage.getItem(RECENT_KEY)
      recentSearches.value = stored ? JSON.parse(stored) : []
    } catch {
      recentSearches.value = []
    }
  }
}

const addRecentSearch = (term: string) => {
  if (!term || !import.meta.client) return
  const clean = term.trim()
  if (clean.length < 2) return

  const filtered = recentSearches.value.filter(
    (t) => t.toLowerCase() !== clean.toLowerCase()
  )
  const updated = [clean, ...filtered].slice(0, MAX_RECENT)
  recentSearches.value = updated
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
  } catch {}
}

const removeRecentSearch = (term: string) => {
  if (!import.meta.client) return
  recentSearches.value = recentSearches.value.filter((t) => t !== term)
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentSearches.value))
  } catch {}
}

const clearAllRecent = () => {
  if (!import.meta.client) return
  recentSearches.value = []
  try {
    localStorage.removeItem(RECENT_KEY)
  } catch {}
}

const selectRecentTerm = (term: string) => {
  searchQuery.value = term
  executeSearch(term)
  searchInputRef.value?.focus()
}

// =============================================================================
// Ejecución de búsqueda con debounce y contingencia local
// =============================================================================
const executeSearch = (rawTerm: string) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }

  const term = rawTerm.trim()
  if (term.length < 2) {
    searchResults.value = []
    isLoading.value = false
    selectedIndex.value = 0
    return
  }

  isLoading.value = true

  debounceTimer = setTimeout(async () => {
    try {
      // 1. Consulta a la API V2
      const response = await getContents({
        q: term,
        per_page: 8,
        sort: '-published_at',
      })

      if (response && response.data && response.data.length > 0) {
        searchResults.value = response.data.map((item: any) => {
          const typeSlug = item.type?.slug || (isNews.value ? 'news' : 'guide')
          const isNewsItem = typeSlug === 'news' || platform.value.slug === 'news'
          const targetUrl = isNewsItem ? `/noticia/${item.slug}` : `/guia/${item.slug}`

          return {
            id: item.id,
            title: item.title,
            slug: item.slug,
            excerpt: item.excerpt || '',
            type: item.type?.name || (isNewsItem ? 'Noticia' : 'Guía'),
            categorySlug: item.category?.slug || 'general',
            categoryName: item.category?.name || 'General',
            published_at: item.published_at,
            views_count: item.views_count,
            url: targetUrl,
            commandSnippet: item.commandSnippet || undefined,
          }
        })
      } else {
        // Si la API devuelve 0 resultados, recurrir a búsqueda local de respaldo
        fallbackLocalSearch(term)
      }
    } catch {
      // Contingencia offline / desarrollo sin backend API
      fallbackLocalSearch(term)
    } finally {
      isLoading.value = false
      selectedIndex.value = 0
    }
  }, 300)
}

const fallbackLocalSearch = (term: string) => {
  const q = term.toLowerCase()
  const results: typeof searchResults.value = []

  // Búsqueda en guías de muestra
  for (const item of SAMPLE_GUIDES) {
    const matchTitle = item.title.toLowerCase().includes(q)
    const matchExcerpt = (item.excerpt || '').toLowerCase().includes(q)
    const matchCategory = item.categoryName.toLowerCase().includes(q)
    const matchTags = item.tagsList.some((t) => t.toLowerCase().includes(q))
    const matchCmd = (item.commandSnippet || '').toLowerCase().includes(q)

    if (matchTitle || matchExcerpt || matchCategory || matchTags || matchCmd) {
      results.push({
        id: item.id,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt || '',
        type: item.type?.name || 'Guía',
        categorySlug: item.categorySlug,
        categoryName: item.categoryName,
        published_at: item.published_at,
        views_count: item.views_count,
        url: `/guia/${item.slug}`,
        commandSnippet: item.commandSnippet,
      })
    }
  }

  // Búsqueda en noticias de muestra
  for (const item of SAMPLE_NEWS) {
    const matchTitle = item.title.toLowerCase().includes(q)
    const matchExcerpt = (item.excerpt || '').toLowerCase().includes(q)
    const matchCategory = item.categoryName.toLowerCase().includes(q)

    if (matchTitle || matchExcerpt || matchCategory) {
      results.push({
        id: item.id,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt || '',
        type: 'Noticia',
        categorySlug: item.categorySlug,
        categoryName: item.categoryName,
        published_at: item.published_at,
        views_count: item.views_count,
        url: `/noticia/${item.slug}`,
      })
    }
  }

  searchResults.value = results.slice(0, 8)
}

const escapeHtml = (str: string) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Resaltar términos coincidentes de búsqueda con HTML seguro
const highlightMatch = (text: string, query: string) => {
  if (!text) return ''
  const escapedText = escapeHtml(text)
  if (!query || !query.trim()) return escapedText
  const cleanQ = escapeHtml(query.trim()).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${cleanQ})`, 'gi')
  const accentClass = isNews.value
    ? 'bg-orange-500/25 text-orange-300 font-bold px-0.5 rounded'
    : 'bg-emerald-500/25 text-emerald-300 font-bold px-0.5 rounded'
  return escapedText.replace(regex, `<mark class="${accentClass}">$1</mark>`)
}

// Limpiar campo de búsqueda
const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  selectedIndex.value = 0
  searchInputRef.value?.focus()
}

// Cerrar modal y restaurar foco
const closeModal = () => {
  nav.closeSearch()
  searchQuery.value = ''
  searchResults.value = []
  selectedIndex.value = 0
  if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
    previousActiveElement.focus()
  }
}

// Navegar al resultado
const navigateToResult = (url: string) => {
  if (searchQuery.value) {
    addRecentSearch(searchQuery.value)
  }
  closeModal()
  router.push(url)
}

// Navegar a la página completa de búsqueda extendida
const goToFullSearchPage = () => {
  const q = searchQuery.value.trim()
  if (q) {
    addRecentSearch(q)
  }
  closeModal()
  router.push({
    path: '/buscar',
    query: q ? { q } : {},
  })
}

// =============================================================================
// Navegación por teclado (Flechas, Enter, Esc, Tab Focus Trap)
// =============================================================================
const handleKeydown = (e: KeyboardEvent) => {
  if (!nav.isSearchOpen) return

  // Cerrar con Escape
  if (e.key === 'Escape') {
    e.preventDefault()
    if (searchQuery.value) {
      clearSearch()
    } else {
      closeModal()
    }
    return
  }

  // Navegar lista con Flecha Abajo
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (searchResults.value.length > 0) {
      selectedIndex.value = (selectedIndex.value + 1) % searchResults.value.length
      scrollToSelected()
    }
    return
  }

  // Navegar lista con Flecha Arriba
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (searchResults.value.length > 0) {
      selectedIndex.value =
        (selectedIndex.value - 1 + searchResults.value.length) % searchResults.value.length
      scrollToSelected()
    }
    return
  }

  // Seleccionar elemento con Enter
  if (e.key === 'Enter') {
    if (searchResults.value.length > 0 && searchResults.value[selectedIndex.value]) {
      e.preventDefault()
      const target = searchResults.value[selectedIndex.value]
      navigateToResult(target.url)
    } else if (searchQuery.value.trim().length >= 2) {
      e.preventDefault()
      goToFullSearchPage()
    }
    return
  }

  // Trampa de foco (Focus Trap)
  if (e.key === 'Tab') {
    const focusableElements = modalContainerRef.value?.querySelectorAll<HTMLElement>(
      'input, button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    )
    if (!focusableElements || focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }
}

const scrollToSelected = () => {
  nextTick(() => {
    const selectedEl = modalContainerRef.value?.querySelector(`[data-index="${selectedIndex.value}"]`)
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  })
}

// Atajo global Cmd+K / Ctrl+K
const handleGlobalKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    if (nav.isSearchOpen) {
      closeModal()
    } else {
      previousActiveElement = document.activeElement as HTMLElement
      nav.toggleSearch()
    }
  }
}

// =============================================================================
// Ciclo de vida y observadores
// =============================================================================
watch(
  () => nav.isSearchOpen,
  (isOpen) => {
    if (isOpen) {
      loadRecentSearches()
      previousActiveElement = document.activeElement as HTMLElement
      nextTick(() => {
        searchInputRef.value?.focus()
      })
      if (import.meta.client) {
        document.body.style.overflow = 'hidden'
      }
    } else {
      if (import.meta.client) {
        document.body.style.overflow = ''
      }
    }
  }
)

onMounted(() => {
  loadRecentSearches()
  if (import.meta.client) {
    window.addEventListener('keydown', handleGlobalKeydown)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', handleGlobalKeydown)
    document.body.style.overflow = ''
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="nav.isSearchOpen"
        ref="modalContainerRef"
        class="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 pb-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Buscador global de contenidos"
        @keydown="handleKeydown"
      >
        <!-- BACKDROP OSCURO CON BLUR -->
        <div
          class="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
          aria-hidden="true"
          @click="closeModal"
        ></div>

        <!-- CONTENEDOR MODAL PRINCIPAL -->
        <div
          class="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-black/80 flex flex-col overflow-hidden z-10 backdrop-blur-sm"
          @click.stop
        >
          <!-- 1. CAMPO DE ENTRADA CON SPINNER E ICONO DE BÚSQUEDA -->
          <div class="relative flex items-center border-b border-slate-800 px-4 py-3.5 bg-slate-950/60">
            <Icon
              name="lucide:search"
              class="w-5 h-5 shrink-0"
              :class="isNews ? 'text-orange-400' : 'text-emerald-400'"
            />

            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded="true"
              aria-controls="search-results-list"
              :placeholder="isNews ? 'Buscar noticias, kernel, seguridad, distros...' : 'Buscar comandos, guías, chuletas, storage, redes...'"
              class="w-full bg-transparent px-3.5 text-sm sm:text-base text-slate-100 placeholder-slate-400 focus:outline-none"
              autocomplete="off"
              spellcheck="false"
              @input="executeSearch(searchQuery)"
            />

            <!-- SPINNER DE CARGA -->
            <div v-if="isLoading" class="shrink-0 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
              <Icon
                name="lucide:loader-2"
                class="w-4 h-4 animate-spin"
                :class="isNews ? 'text-orange-400' : 'text-emerald-400'"
              />
            </div>

            <!-- BOTÓN LIMPIAR O ESCAPE -->
            <button
              v-else-if="searchQuery"
              type="button"
              @click="clearSearch"
              class="shrink-0 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Limpiar búsqueda"
              aria-label="Limpiar búsqueda"
            >
              <Icon name="lucide:x" class="w-4 h-4" />
            </button>

            <!-- INSIGNIA ESC -->
            <kbd
              v-else
              class="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-800 text-slate-400 rounded border border-slate-700/80"
            >
              ESC
            </kbd>
          </div>

          <!-- 2. CUERPO DE RESULTADOS O HISTORIAL -->
          <div class="max-h-[60vh] overflow-y-auto p-3 space-y-3 divide-y divide-slate-800/40">

            <!-- CASO A: HISTORIAL DE BÚSQUEDAS RECIENTES (SI LA CONSULTA ES MENOR A 2 CARACTERES) -->
            <div v-if="searchQuery.trim().length < 2" class="space-y-3 pt-1">
              <div class="flex items-center justify-between px-2 text-xs font-mono font-semibold text-slate-400">
                <span class="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Icon name="lucide:history" class="w-3.5 h-3.5 text-slate-500" />
                  Búsquedas Recientes
                </span>
                <button
                  v-if="recentSearches.length > 0"
                  type="button"
                  @click="clearAllRecent"
                  class="text-[11px] text-slate-400 hover:text-rose-400 transition-colors py-1.5 px-2 rounded min-h-[44px] flex items-center cursor-pointer"
                  aria-label="Borrar historial"
                >
                  Borrar historial
                </button>
              </div>

              <!-- LISTA DE TÉRMINOS RECIENTES -->
              <div v-if="recentSearches.length > 0" class="flex flex-wrap gap-2 px-1">
                <div
                  v-for="term in recentSearches"
                  :key="term"
                  class="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                  @click="selectRecentTerm(term)"
                >
                  <Icon name="lucide:search" class="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
                  <span>{{ term }}</span>
                  <button
                    type="button"
                    class="text-slate-400 hover:text-rose-400 ml-1 p-1 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                    title="Eliminar del historial"
                    aria-label="Eliminar del historial"
                    @click.stop="removeRecentSearch(term)"
                  >
                    <Icon name="lucide:x" class="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div v-else class="py-6 text-center text-xs text-slate-500 font-mono">
                Escribe al menos 2 caracteres para buscar en tiempo real.
              </div>

              <!-- SUGERENCIAS RÁPIDAS TEMÁTICAS -->
              <div class="pt-3 border-t border-slate-800/50 px-2 space-y-2">
                <span class="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
                  Temas populares:
                </span>
                <div class="flex flex-wrap gap-1.5 text-xs">
                  <button
                    v-for="topic in (isNews ? ['Kernel 6.12', 'Debian 13', 'CVE-2024-6387', 'Wayland', 'Arch Linux'] : ['chmod', 'systemd', 'btrfs', 'wireguard', 'rsync', 'fdisk'])"
                    :key="topic"
                    type="button"
                    class="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-mono text-[11px] border border-slate-700/40 transition-colors"
                    @click="selectRecentTerm(topic)"
                  >
                    #{{ topic }}
                  </button>
                </div>
              </div>
            </div>

            <!-- CASO B: RESULTADOS DE BÚSQUEDA ENCONTRADOS -->
            <div
              v-else-if="searchResults.length > 0"
              id="search-results-list"
              role="listbox"
              class="space-y-1.5 pt-1"
            >
              <div class="px-2 py-1 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Resultados encontrados: {{ searchResults.length }}</span>
                <span class="hidden sm:inline">Usa ↑ ↓ para navegar y Enter para abrir</span>
              </div>

              <div
                v-for="(result, index) in searchResults"
                :key="result.id"
                :data-index="index"
                role="option"
                :aria-selected="selectedIndex === index"
                class="group rounded-xl p-3 border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                :class="selectedIndex === index
                  ? (isNews
                      ? 'bg-orange-500/15 border-orange-500/40 shadow-sm'
                      : 'bg-emerald-500/15 border-emerald-500/40 shadow-sm')
                  : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'"
                @click="navigateToResult(result.url)"
                @mouseenter="selectedIndex = index"
              >
                <div class="space-y-1.5 min-w-0 flex-1">
                  <!-- BADGES SUPERIORES: TIPO + CATEGORÍA -->
                  <div class="flex items-center gap-2 text-[10px] font-mono">
                    <span
                      class="px-2 py-0.5 rounded font-bold uppercase border"
                      :class="result.type === 'Noticia'
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'"
                    >
                      {{ result.type }}
                    </span>

                    <span class="text-slate-400 truncate">
                      {{ result.categoryName }}
                    </span>

                    <span v-if="result.views_count" class="text-slate-500 hidden sm:inline">
                      · {{ result.views_count }} lecturas
                    </span>
                  </div>

                  <!-- TÍTULO CON RESALTADO -->
                  <h3
                    class="font-heading text-sm font-bold text-white group-hover:text-white transition-colors leading-snug line-clamp-1"
                    v-html="highlightMatch(result.title, searchQuery)"
                  ></h3>

                  <!-- EXTRACTO CON RESALTADO -->
                  <p
                    v-if="result.excerpt"
                    class="text-xs text-slate-400 line-clamp-1 leading-relaxed"
                    v-html="highlightMatch(result.excerpt, searchQuery)"
                  ></p>

                  <!-- SNIPPET DE COMANDO (SI APLICA) -->
                  <div
                    v-if="result.commandSnippet"
                    class="mt-1 font-mono text-[11px] text-emerald-400 bg-slate-950 border border-slate-800 px-2 py-1 rounded inline-block truncate max-w-full"
                  >
                    $ {{ result.commandSnippet }}
                  </div>
                </div>

                <!-- FLECHA INDICADORA -->
                <div class="shrink-0 flex items-center justify-end sm:pl-2">
                  <Icon
                    name="lucide:arrow-right"
                    class="w-4 h-4 text-slate-500 transition-transform group-hover:translate-x-1"
                    :class="selectedIndex === index ? (isNews ? 'text-orange-400' : 'text-emerald-400') : ''"
                  />
                </div>
              </div>
            </div>

            <!-- CASO C: SIN RESULTADOS (ESTADO VACÍO) -->
            <div
              v-else-if="!isLoading && searchQuery.trim().length >= 2"
              class="py-10 text-center space-y-3 px-4"
            >
              <div class="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 text-2xl flex items-center justify-center mx-auto text-slate-400">
                🔍
              </div>
              <h4 class="font-heading text-sm font-bold text-white">
                Sin resultados para "{{ searchQuery }}"
              </h4>
              <p class="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                No encontramos coincidencias exactas. Intenta con palabras clave más generales o pulsa abajo para consultar la página de búsqueda con filtros avanzados.
              </p>
              <div class="pt-2">
                <button
                  type="button"
                  @click="goToFullSearchPage"
                  class="px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border"
                  :class="isNews
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 hover:bg-orange-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'"
                >
                  Ir a Búsqueda Completa →
                </button>
              </div>
            </div>

          </div>

          <!-- 3. PIE DE MODAL CON ATAJOS Y ENLACE EXTENDIDO -->
          <div class="border-t border-slate-800 px-4 py-2.5 bg-slate-950/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">↑↓</kbd>
                Navegar
              </span>
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">↵</kbd>
                Abrir
              </span>
              <span class="hidden sm:inline-flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">ESC</kbd>
                Cerrar
              </span>
            </div>

            <div>
              <button
                type="button"
                @click="goToFullSearchPage"
                class="hover:underline transition-colors flex items-center gap-1"
                :class="isNews ? 'hover:text-orange-400' : 'hover:text-emerald-400'"
              >
                <span>Búsqueda avanzada</span>
                <span>↗</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>
