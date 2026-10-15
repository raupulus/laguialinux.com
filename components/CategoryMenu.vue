<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { DEFAULT_CATEGORIES } from '~/utils/categoriesData'
import type { CategoryResource } from '~/types'

const { platform, isGuides, isNews } = usePlatform()
const nav = useNavigationStore()
const route = useRoute()
const { getCategories } = useApiClient()

// 1. OBTENCIÓN REACTIVA DE CATEGORÍAS VÍA API V2 CON FALLBACK TRANSPARENTE
const { data: apiResponse, status: apiStatus, error: apiError } = await useAsyncData(
  `categories-menu-${platform.value.slug}`,
  async () => {
    try {
      return await getCategories()
    } catch {
      return null
    }
  }
)

const rawCategories = computed<CategoryResource[]>(() => {
  const remote = apiResponse.value?.data
  if (Array.isArray(remote) && remote.length > 0) {
    return remote
  }
  const fallback = DEFAULT_CATEGORIES[platform.value.slug]
  if (Array.isArray(fallback) && fallback.length > 0) {
    return fallback
  }
  return DEFAULT_CATEGORIES.laguialinux || []
})

// 2. SELECCIÓN DE RAÍZ ACTIVA
const activeRootSlug = ref<string>('')

watch(
  rawCategories,
  (cats) => {
    if (cats.length > 0) {
      if (!activeRootSlug.value || !cats.some((c) => c.slug === activeRootSlug.value)) {
        activeRootSlug.value = cats[0].slug
      }
    }
  },
  { immediate: true }
)

const activeRootCategory = computed<CategoryResource | undefined>(() => {
  return rawCategories.value.find((c) => c.slug === activeRootSlug.value) || rawCategories.value[0]
})

const selectCategory = (slug: string) => {
  activeRootSlug.value = slug
}

// 3. FILTRADO RÁPIDO DE SUBCATEGORÍAS EN DESKTOP
const searchQuery = ref('')

const subcategoriesList = computed(() => {
  if (!activeRootCategory.value) return []
  const subs = activeRootCategory.value.subcategories || []
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return subs
  return subs.filter(
    (s) =>
      s.name.toLowerCase().includes(query) ||
      (s.description && s.description.toLowerCase().includes(query))
  )
})

// 4. MAPEO DE ICONOS LUCIDE SEGURO
const getCategoryIcon = (iconName?: string | null): string => {
  if (!iconName) return 'lucide:folder'
  if (iconName.includes(':')) return iconName
  const iconMap: Record<string, string> = {
    terminal: 'lucide:terminal',
    'hard-drive': 'lucide:hard-drive',
    network: 'lucide:network',
    'shield-alert': 'lucide:shield-alert',
    zap: 'lucide:zap',
    cpu: 'lucide:cpu',
    layers: 'lucide:layers',
    users: 'lucide:users',
    folder: 'lucide:folder',
    package: 'lucide:package',
    disc: 'lucide:disc',
    wrench: 'lucide:wrench',
    'refresh-cw': 'lucide:refresh-cw',
    shuffle: 'lucide:shuffle',
    sparkles: 'lucide:sparkles',
    server: 'lucide:server',
    sliders: 'lucide:sliders',
  }
  return iconMap[iconName] || `lucide:${iconName}`
}

// 5. ESTADO MÓVIL Y ACORDEÓN
const isMobileViewport = ref(false)
const expandedMobileCategory = ref<string | null>(null)

const toggleMobileCategory = (slug: string) => {
  expandedMobileCategory.value = expandedMobileCategory.value === slug ? null : slug
}

const checkViewport = () => {
  if (import.meta.client) {
    isMobileViewport.value = window.innerWidth < 768
  }
}

// Determina si el menú o el drawer móvil debe mostrarse
const isDesktopMenuVisible = computed(() => nav.isCategoryMenuOpen && !isMobileViewport.value)
const isMobileDrawerVisible = computed(
  () => (nav.isMobileDrawerOpen || (nav.isCategoryMenuOpen && isMobileViewport.value))
)

const closeMenu = () => {
  nav.closeCategoryMenu()
  nav.closeMobileDrawer()
  searchQuery.value = ''
}

// 6. CIERRE AUTOMÁTICO EN NAVEGACIÓN
watch(
  () => route.fullPath,
  () => {
    closeMenu()
  }
)

// Bloqueo de scroll y gestión de foco inicial cuando el drawer móvil está abierto
watch(
  isMobileDrawerVisible,
  (open) => {
    if (import.meta.client) {
      if (open) {
        document.body.classList.add('overflow-hidden')
        nextTick(() => {
          if (mobileCloseButtonRef.value) {
            mobileCloseButtonRef.value.focus()
          } else if (mobileDrawerRef.value) {
            const focusable = mobileDrawerRef.value.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
            if (focusable.length > 0) {
              focusable[0].focus()
            } else {
              mobileDrawerRef.value.focus()
            }
          }
        })
      } else {
        document.body.classList.remove('overflow-hidden')
      }
    }
  }
)

// 7. GESTIÓN DE ACCESIBILIDAD (ESC, FOCUS TRAP Y RESTAURACIÓN DE FOCO)
const desktopDropdownRef = ref<HTMLElement | null>(null)
const mobileDrawerRef = ref<HTMLElement | null>(null)
const mobileCloseButtonRef = ref<HTMLButtonElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const lastTriggerElementRef = ref<HTMLElement | null>(null)

// Restauración de foco al elemento disparador tras cerrar menú o drawer
watch(
  [isDesktopMenuVisible, isMobileDrawerVisible],
  ([desktopOpen, mobileOpen], [prevDesktop, prevMobile]) => {
    if (!import.meta.client) return
    const isNowOpen = desktopOpen || mobileOpen
    const wasOpen = prevDesktop || prevMobile

    if (isNowOpen && !wasOpen) {
      lastTriggerElementRef.value = (document.activeElement as HTMLElement) || null
    } else if (!isNowOpen && wasOpen && lastTriggerElementRef.value) {
      nextTick(() => {
        lastTriggerElementRef.value?.focus()
        lastTriggerElementRef.value = null
      })
    }
  }
)

const getActiveDialogElement = (): HTMLElement | null => {
  if (isMobileDrawerVisible.value) {
    return mobileDrawerRef.value
  }
  if (isDesktopMenuVisible.value) {
    return desktopDropdownRef.value
  }
  return null
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (isDesktopMenuVisible.value || isMobileDrawerVisible.value) {
      e.preventDefault()
      closeMenu()
    }
    return
  }

  if (e.key === 'Tab') {
    const dialog = getActiveDialogElement()
    if (!dialog) return
 
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    // Si el foco actual está fuera del contenedor del diálogo activo (focus escape o estado inicial desincronizado)
    if (!dialog.contains(document.activeElement)) {
      e.preventDefault()
      if (e.shiftKey) {
        last.focus()
      } else {
        first.focus()
      }
      return
    }

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }
}

// Auto-focus en el buscador al abrir en desktop
watch(
  isDesktopMenuVisible,
  (open) => {
    if (open && import.meta.client) {
      nextTick(() => {
        searchInputRef.value?.focus()
      })
    }
  }
)

onMounted(() => {
  checkViewport()
  window.addEventListener('resize', checkViewport)
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('resize', checkViewport)
    window.removeEventListener('keydown', handleKeyDown)
    document.body.classList.remove('overflow-hidden')
  }
})
</script>

<template>
  <div>
    <!-- ========================================================================= -->
    <!-- 1. MEGA-MENÚ DESKTOP (≥768px): LAYOUT A 2 COLUMNAS (RAÍCES + SUBCATEGORÍAS) -->
    <!-- ========================================================================= -->
    <div
      v-if="isDesktopMenuVisible"
      class="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
      @click="closeMenu"
      aria-hidden="true"
    />

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2 scale-98"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-2 scale-98"
    >
      <div
        v-if="isDesktopMenuVisible"
        ref="desktopDropdownRef"
        role="menu"
        aria-label="Directorio y taxonomía de categorías"
        class="absolute left-0 right-0 top-full z-50 mt-1 mx-auto max-w-7xl px-4 lg:px-8 hidden md:block"
      >
        <div class="rounded-3xl border border-slate-700/80 bg-slate-900/98 p-6 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 text-slate-100">
          
          <!-- CABECERA DEL MEGA-MENÚ CON FILTRO RÁPIDO -->
          <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div class="flex items-center gap-3">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-xl border text-sm"
                :class="isNews ? 'border-orange-500/30 bg-orange-500/10 text-orange-400' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'"
              >
                <Icon name="lucide:layout-grid" class="h-4 w-4" />
              </div>
              <div>
                <h2 class="font-heading text-sm font-bold text-white leading-none">
                  Directorio y Taxonomía de {{ platform.name }}
                </h2>
                <p class="text-[11px] text-slate-400 font-mono mt-1">
                  {{ rawCategories.length }} áreas temáticas &bull; Navegación jerárquica en 2 niveles
                </p>
              </div>
            </div>

            <!-- BUSCADOR / FILTRADOR RÁPIDO DENTRO DEL MENÚ -->
            <div class="flex items-center gap-4">
              <div class="relative w-64">
                <input
                  ref="searchInputRef"
                  v-model="searchQuery"
                  type="text"
                  placeholder="Filtrar subcategorías..."
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-9 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none transition-colors"
                  :class="isNews ? 'focus:border-orange-500' : 'focus:border-emerald-500'"
                />
                <Icon name="lucide:search" class="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <button
                  v-if="searchQuery"
                  type="button"
                  @click="searchQuery = ''"
                  class="absolute right-0.5 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white text-xs cursor-pointer"
                  aria-label="Limpiar filtro de subcategorías"
                >
                  <Icon name="lucide:x" class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- BOTÓN CERRAR -->
              <button
                type="button"
                @click="closeMenu"
                class="rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                title="Cerrar menú (Esc)"
                aria-label="Cerrar menú"
              >
                <Icon name="lucide:x" class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- LAYOUT A DOS COLUMNAS -->
          <div class="grid grid-cols-12 gap-6 min-h-[400px]">
            
            <!-- COLUMNA 1: LISTADO DE CATEGORÍAS RAÍZ (5 COLUMNAS) -->
            <div
              role="tablist"
              aria-orientation="vertical"
              class="col-span-5 space-y-1.5 pr-4 border-r border-slate-800 overflow-y-auto max-h-[460px]"
            >
              <div class="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold px-2 mb-1">
                Categorías Raíz
              </div>

              <button
                v-for="cat in rawCategories"
                :key="cat.slug"
                type="button"
                role="tab"
                :aria-selected="activeRootSlug === cat.slug"
                @mouseenter="selectCategory(cat.slug)"
                @click="selectCategory(cat.slug)"
                class="w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between group cursor-pointer"
                :class="activeRootSlug === cat.slug
                  ? (isNews ? 'bg-orange-500/15 border border-orange-500/40 text-white shadow-md' : 'bg-emerald-500/15 border border-emerald-500/40 text-white shadow-md')
                  : 'hover:bg-slate-800/60 border border-transparent text-slate-300'"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 shrink-0"
                    :class="activeRootSlug === cat.slug ? (isNews ? 'text-orange-400' : 'text-emerald-400') : 'text-slate-400'"
                  >
                    <Icon :name="getCategoryIcon(cat.icon)" class="h-4 w-4" />
                  </div>
                  <div class="min-w-0">
                    <div class="font-heading text-xs font-bold truncate">{{ cat.name }}</div>
                    <div class="text-[10px] text-slate-400 font-mono mt-0.5 line-clamp-1">{{ cat.description }}</div>
                  </div>
                </div>

                <span
                  class="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold shrink-0 ml-2"
                  :class="activeRootSlug === cat.slug
                    ? (isNews ? 'bg-orange-500 text-black' : 'bg-emerald-400 text-black')
                    : 'bg-slate-800 text-slate-400'"
                >
                  {{ cat.contents_count }}
                </span>
              </button>
            </div>

            <!-- COLUMNA 2: DETALLE DE RAÍZ ACTIVA Y SUS SUBCATEGORÍAS (7 COLUMNAS) -->
            <div
              v-if="activeRootCategory"
              id="subcategory-panel"
              role="region"
              aria-label="Subcategorías de la categoría seleccionada"
              class="col-span-7 flex flex-col justify-between"
            >
              <div>
                <!-- CABECERA DE LA RAÍZ SELECCIONADA -->
                <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 border"
                      :class="isNews ? 'border-orange-500/30 bg-orange-500/10 text-orange-400' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'"
                    >
                      <Icon :name="getCategoryIcon(activeRootCategory.icon)" class="h-5 w-5" />
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <h3 class="font-heading text-sm font-bold text-white">{{ activeRootCategory.name }}</h3>
                        <span class="text-[10px] font-mono text-slate-400">({{ activeRootCategory.contents_count }} publicaciones)</span>
                      </div>
                      <p class="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {{ activeRootCategory.description }}
                      </p>
                    </div>
                  </div>

                  <!-- ENLACE A LA CATEGORÍA RAÍZ (/categoria/[slug]) -->
                  <NuxtLink
                    :to="`/categoria/${activeRootCategory.slug}`"
                    @click="closeMenu"
                    class="text-xs font-bold transition-colors inline-flex items-center gap-1 shrink-0 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800"
                    :class="isNews ? 'text-orange-400 hover:text-orange-300' : 'text-emerald-400 hover:text-emerald-300'"
                  >
                    Ver todas ({{ activeRootCategory.contents_count }})
                    <Icon name="lucide:arrow-right" class="h-3 w-3" />
                  </NuxtLink>
                </div>

                <!-- PARRILLA DE SUBCATEGORÍAS (/categoria/[slug]?subcategoria=[subslug]) -->
                <div
                  v-if="subcategoriesList.length > 0"
                  class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1"
                >
                  <NuxtLink
                    v-for="sub in subcategoriesList"
                    :key="sub.slug"
                    :to="`/categoria/${activeRootCategory.slug}?subcategoria=${sub.slug}`"
                    @click="closeMenu"
                    class="p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 hover:border-slate-700 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div class="flex items-center justify-between mb-1.5">
                        <div class="flex items-center gap-2 min-w-0">
                          <Icon
                            :name="getCategoryIcon(sub.icon)"
                            class="h-4 w-4 shrink-0"
                            :class="isNews ? 'text-orange-400' : 'text-emerald-400'"
                          />
                          <span
                            class="font-heading text-xs font-bold text-white transition-colors truncate"
                            :class="isNews ? 'group-hover:text-orange-400' : 'group-hover:text-emerald-400'"
                          >
                            {{ sub.name }}
                          </span>
                        </div>
                        <span class="font-mono text-[10px] text-slate-500 ml-1 shrink-0">
                          {{ sub.contents_count }}
                        </span>
                      </div>
                      <p class="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {{ sub.description }}
                      </p>
                    </div>
                  </NuxtLink>
                </div>

                <!-- ESTADO VACÍO CUANDO NO HAY SUBCATEGORÍAS DIRECTAS O TRAS FILTRADO -->
                <div v-else class="text-center py-12 text-slate-500 text-xs">
                  <Icon name="lucide:layers" class="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <span v-if="searchQuery">
                    No se encontraron subcategorías para "{{ searchQuery }}".
                  </span>
                  <span v-else>
                    Esta categoría principal agrupa todos sus artículos directamente sin subcategorías intermedias.
                  </span>
                </div>
              </div>

              <!-- PIE DEL MENÚ CON ENLACE AL CATÁLOGO COMPLETO -->
              <div class="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span class="text-slate-400">
                  Explora las publicaciones por categoría
                </span>
                <NuxtLink
                  :to="isNews ? '/categoria/distribuciones' : '/guias'"
                  @click="closeMenu"
                  class="text-slate-300 hover:text-white hover:underline flex items-center gap-1 font-semibold"
                >
                  Ver catálogo completo
                  <Icon name="lucide:arrow-right" class="h-3 w-3" />
                </NuxtLink>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Transition>

    <!-- ========================================================================= -->
    <!-- 2. DRAWER MÓVIL (<768px): PANEL LATERAL CON ACORDEÓN DE CATEGORÍAS         -->
    <!-- ========================================================================= -->
    <!-- BACKDROP OSCURECIDO -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileDrawerVisible"
        class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
        @click="closeMenu"
        aria-hidden="true"
      />
    </Transition>

    <!-- PANEL DEL DRAWER -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <div
        v-if="isMobileDrawerVisible"
        ref="mobileDrawerRef"
        role="dialog"
        aria-label="Menú de navegación y categorías"
        aria-modal="true"
        tabindex="-1"
        class="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-slate-950 border-r border-slate-800 flex flex-col justify-between text-slate-100 shadow-2xl md:hidden overflow-hidden"
      >
        <!-- SECCIÓN SUPERIOR: CABECERA, ENLACES PRINCIPALES Y ACORDEÓN -->
        <div class="flex-1 overflow-y-auto">
          <!-- CABECERA DE MARCA -->
          <div class="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div class="flex items-center gap-3">
              <img
                :src="isNews ? '/assets/img/news_badge.webp' : '/assets/img/laguialinux_badge.webp'"
                width="36"
                height="36"
                :alt="`Logo ${platform.name}`"
                class="w-9 h-9 object-contain drop-shadow"
              />
              <div>
                <div class="font-heading font-black text-sm text-white leading-tight">
                  {{ platform.name }}
                </div>
                <div class="text-[11px] text-slate-400 font-mono">
                  {{ isNews ? 'Noticias & Actualidad' : 'Guías & Referencia' }}
                </div>
              </div>
            </div>

            <button
              ref="mobileCloseButtonRef"
              type="button"
              @click="closeMenu"
              class="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Cerrar menú (Esc)"
              aria-label="Cerrar menú"
            >
              <Icon name="lucide:x" class="h-5 w-5" />
            </button>
          </div>

          <!-- ENLACES DE ACCESO DIRECTO -->
          <div class="p-3 border-b border-slate-800 space-y-1">
            <template v-if="isGuides">
              <NuxtLink
                to="/guias"
                @click="closeMenu"
                class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              >
                <Icon name="lucide:book-open" class="h-4 w-4" />
                <span>Catálogo de Guías</span>
              </NuxtLink>
              <NuxtLink
                to="/herramientas"
                @click="closeMenu"
                class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900"
              >
                <Icon name="lucide:wrench" class="h-4 w-4 text-emerald-400" />
                <span>Herramientas Sysadmin</span>
              </NuxtLink>
              <NuxtLink
                to="/contacto"
                @click="closeMenu"
                class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900"
              >
                <Icon name="lucide:mail" class="h-4 w-4 text-slate-400" />
                <span>Contacto</span>
              </NuxtLink>
            </template>
            <template v-else>
              <NuxtLink
                to="/"
                @click="closeMenu"
                class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20"
              >
                <Icon name="lucide:newspaper" class="h-4 w-4" />
                <span>Portada de Noticias</span>
              </NuxtLink>
              <NuxtLink
                to="/categoria/distribuciones"
                @click="closeMenu"
                class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900"
              >
                <Icon name="lucide:disc" class="h-4 w-4 text-orange-400" />
                <span>Distribuciones</span>
              </NuxtLink>
              <NuxtLink
                to="/contacto"
                @click="closeMenu"
                class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900"
              >
                <Icon name="lucide:mail" class="h-4 w-4 text-slate-400" />
                <span>Contacto</span>
              </NuxtLink>
            </template>
          </div>

          <!-- ACORDEÓN DE CATEGORÍAS -->
          <div class="p-3">
            <div class="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold px-2 mb-2 flex items-center justify-between">
              <span>Categorías</span>
              <span>({{ rawCategories.length }})</span>
            </div>

            <div class="space-y-1.5">
              <div
                v-for="cat in rawCategories"
                :key="cat.slug"
                class="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60"
              >
                <!-- BOTÓN DISPARADOR DEL ACORDEÓN -->
                <button
                  type="button"
                  @click="toggleMobileCategory(cat.slug)"
                  class="w-full px-3 py-2.5 flex items-center justify-between text-xs text-left hover:bg-slate-800/60 transition-colors cursor-pointer"
                  :aria-expanded="expandedMobileCategory === cat.slug"
                  :aria-controls="`mobile-sub-${cat.slug}`"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <Icon
                      :name="getCategoryIcon(cat.icon)"
                      class="h-4 w-4 shrink-0"
                      :class="isNews ? 'text-orange-400' : 'text-emerald-400'"
                    />
                    <span class="font-bold text-white text-xs truncate">{{ cat.name }}</span>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                      {{ cat.contents_count }}
                    </span>
                    <Icon
                      name="lucide:chevron-down"
                      class="h-3.5 w-3.5 text-slate-500 transition-transform duration-200"
                      :class="{ 'rotate-180': expandedMobileCategory === cat.slug }"
                    />
                  </div>
                </button>

                <!-- CONTENIDO EXPANDIBLE DEL ACORDEÓN -->
                <div
                  v-if="expandedMobileCategory === cat.slug"
                  :id="`mobile-sub-${cat.slug}`"
                  class="bg-slate-950/90 px-3 py-2 border-t border-slate-800/80 space-y-1 text-xs"
                >
                  <!-- ENLACE RAÍZ (/categoria/[slug]) -->
                  <NuxtLink
                    :to="`/categoria/${cat.slug}`"
                    @click="closeMenu"
                    class="block py-1 text-[11px] font-bold hover:underline"
                    :class="isNews ? 'text-orange-400' : 'text-emerald-400'"
                  >
                    Ver todo en {{ cat.name }} ({{ cat.contents_count }}) &rarr;
                  </NuxtLink>

                  <!-- LISTADO DE SUBCATEGORÍAS (/categoria/[slug]?subcategoria=[subslug]) -->
                  <template v-if="cat.subcategories && cat.subcategories.length > 0">
                    <NuxtLink
                      v-for="sub in cat.subcategories"
                      :key="sub.slug"
                      :to="`/categoria/${cat.slug}?subcategoria=${sub.slug}`"
                      @click="closeMenu"
                      class="flex items-center justify-between py-1.5 text-slate-300 hover:text-white transition-colors"
                    >
                      <span class="flex items-center gap-1.5 truncate">
                        <span class="text-slate-500">&bull;</span>
                        <span class="truncate">{{ sub.name }}</span>
                      </span>
                      <span class="text-[10px] font-mono text-slate-500 ml-1">{{ sub.contents_count }}</span>
                    </NuxtLink>
                  </template>
                  <div v-else class="py-1 text-[11px] text-slate-500 italic">
                    Sin subcategorías adicionales.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PIE DEL DRAWER MÓVIL CON LICENCIAS -->
        <div class="p-3 border-t border-slate-800 bg-slate-950 text-[10px] text-slate-500 font-mono flex items-center justify-between shrink-0">
          <span>GNU AGPLv3 &bull; CC BY-SA 4.0</span>
          <span>La Guía Linux</span>
        </div>
      </div>
    </Transition>
  </div>
</template>
