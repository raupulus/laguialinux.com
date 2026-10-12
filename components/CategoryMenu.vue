<script setup lang="ts">
import { DEFAULT_CATEGORIES } from '~/utils/categoriesData'

const { platform, isGuides, isNews } = usePlatform()
const nav = useNavigationStore()

const categoriesList = computed(() => {
  return DEFAULT_CATEGORIES[platform.value.slug] || DEFAULT_CATEGORIES.laguialinux
})

const activeRootSlug = ref(categoriesList.value[0]?.slug || 'comandos')

watch(categoriesList, (newList) => {
  if (newList.length > 0) {
    activeRootSlug.value = newList[0].slug
  }
})

const activeRootCategory = computed(() => {
  return categoriesList.value.find(c => c.slug === activeRootSlug.value) || categoriesList.value[0]
})

const selectCategory = (slug: string) => {
  activeRootSlug.value = slug
}

const closeMenu = () => {
  nav.closeCategoryMenu()
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="nav.isCategoryMenuOpen"
      class="absolute left-0 right-0 top-full z-50 mt-1 mx-auto max-w-7xl px-4 lg:px-8"
    >
      <div class="rounded-3xl border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div class="flex items-center gap-3">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg border text-sm"
              :class="isNews ? 'border-orange-500/30 bg-orange-500/10 text-orange-400' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'"
            >
              <Icon name="lucide:layout-grid" class="h-4 w-4" />
            </div>
            <div>
              <h2 class="font-heading text-sm font-bold text-white leading-none">
                Directorio y Taxonomía de {{ platform.name }}
              </h2>
              <p class="text-[11px] text-slate-400 font-mono mt-1">
                Estructura oficial de contenidos en 2 niveles (Raíces & Subcategorías)
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="closeMenu"
            class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Cerrar menú"
          >
            <Icon name="lucide:x" class="h-5 w-5" />
          </button>
        </div>

        <!-- LAYOUT 2 COLUMNAS (RAÍCES A LA IZQUIERDA / SUBCATEGORÍAS A LA DERECHA) -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[380px]">
          
          <!-- COLUMNA IZQUIERDA: CATEGORÍAS RAÍZ (5 COLS) -->
          <div class="md:col-span-5 space-y-1.5 pr-0 md:pr-4 border-b md:border-b-0 md:border-r border-slate-800">
            <button
              v-for="cat in categoriesList"
              :key="cat.slug"
              type="button"
              @mouseenter="selectCategory(cat.slug)"
              @click="selectCategory(cat.slug)"
              class="w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between group"
              :class="activeRootSlug === cat.slug
                ? (isNews ? 'bg-orange-500/15 border border-orange-500/40 text-white shadow-md' : 'bg-emerald-500/15 border border-emerald-500/40 text-white shadow-md')
                : 'hover:bg-slate-800/60 border border-transparent text-slate-300'"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 shrink-0"
                  :class="activeRootSlug === cat.slug ? (isNews ? 'text-orange-400' : 'text-emerald-400') : 'text-slate-400'"
                >
                  <Icon name="lucide:folder" class="h-4 w-4" />
                </div>
                <div>
                  <div class="font-heading text-xs font-bold">{{ cat.name }}</div>
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

          <!-- COLUMNA DERECHA: SUBCATEGORÍAS DEL NODO ACTIVO (7 COLS) -->
          <div class="md:col-span-7 flex flex-col justify-between">
            <div v-if="activeRootCategory">
              <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono text-slate-400">Subcategorías de:</span>
                  <span class="font-heading text-xs font-bold text-white">{{ activeRootCategory.name }}</span>
                </div>
                <NuxtLink
                  :to="`/categoria/${activeRootCategory.slug}`"
                  @click="closeMenu"
                  class="text-xs font-bold transition-colors inline-flex items-center gap-1"
                  :class="isNews ? 'text-orange-400 hover:text-orange-300' : 'text-emerald-400 hover:text-emerald-300'"
                >
                  Ver todas ({{ activeRootCategory.contents_count }})
                  <Icon name="lucide:arrow-right" class="h-3 w-3" />
                </NuxtLink>
              </div>

              <!-- GRID DE SUBCATEGORÍAS -->
              <div
                v-if="activeRootCategory.subcategories && activeRootCategory.subcategories.length > 0"
                class="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <NuxtLink
                  v-for="sub in activeRootCategory.subcategories"
                  :key="sub.slug"
                  :to="`/categoria/${sub.slug}`"
                  @click="closeMenu"
                  class="p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 hover:border-slate-700 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-heading text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {{ sub.name }}
                      </span>
                      <span class="font-mono text-[10px] text-slate-500">
                        {{ sub.contents_count }}
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {{ sub.description }}
                    </p>
                  </div>
                </NuxtLink>
              </div>

              <!-- SI NO TIENE SUBCATEGORÍAS DIRECTAS -->
              <div v-else class="text-center py-12 text-slate-500 text-xs">
                <Icon name="lucide:layers" class="h-8 w-8 mx-auto mb-2 opacity-50" />
                Esta categoría principal agrupa todos sus artículos directamente.
              </div>
            </div>

            <!-- FOOTER INFORMATIVO DEL MENÚ -->
            <div class="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Navegación reactiva &bull; Sincronizada con API V2</span>
              <NuxtLink
                :to="isNews ? '/archivo' : '/guias'"
                @click="closeMenu"
                class="text-slate-300 hover:underline"
              >
                Ver catálogo completo &rarr;
              </NuxtLink>
            </div>
          </div>

        </div>
      </div>
    </div>
  </Transition>
</template>
