<script setup lang="ts">
const { platform, isGuides, isNews } = usePlatform()
const nav = useNavigationStore()
</script>

<template>
  <div>
    <!-- 1. BARRA DE ECOSISTEMA SUPERIOR -->
    <AppEcosystemBar />

    <!-- 2. NAVBAR PRINCIPAL -->
    <header class="bg-slate-900/90 backdrop-blur sticky top-0 z-40 border-b border-slate-800 px-4 lg:px-8 py-3">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        <!-- LOGO + MARCA -->
        <div class="flex items-center gap-4 lg:gap-6">
          <NuxtLink to="/" class="flex items-center gap-3 group shrink-0">
            <img
              :src="isNews ? '/assets/img/news_badge.webp' : '/assets/img/laguialinux_badge.webp'"
              width="42"
              height="42"
              fetchpriority="high"
              :alt="`Isotipo ${platform.name}`"
              class="w-10 h-10 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
            >
            <div>
              <div class="font-heading font-black text-lg tracking-tight text-white flex items-center gap-1.5 leading-none">
                {{ platform.name }}
                <span
                  class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border"
                  :class="isNews
                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'"
                >
                  {{ isNews ? 'News Portal' : '2.0 Reborn' }}
                </span>
              </div>
              <p class="text-[11px] text-slate-400 font-mono hidden sm:block mt-1">
                {{ isNews ? 'Actualidad Linux, Seguridad & Open Source' : 'Guías, Referencia Técnica & Sysadmin' }}
              </p>
            </div>
          </NuxtLink>

          <!-- BOTÓN EXPLORADOR DE CATEGORÍAS (MEGA-MENU TRIGGER) -->
          <div class="relative">
            <button
              type="button"
              @click="nav.toggleCategoryMenu()"
              class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700/80 transition-all shadow-sm"
            >
              <Icon
                name="lucide:layout-grid"
                class="w-4 h-4"
                :class="isNews ? 'text-orange-400' : 'text-emerald-400'"
              />
              <span>Explorar Categorías</span>
              <span
                class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold border"
                :class="isNews
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'"
              >
                {{ isNews ? '8' : '6' }}
              </span>
              <Icon
                name="lucide:chevron-down"
                class="w-3.5 h-3.5 text-slate-400 transition-transform"
                :class="{ 'rotate-180': nav.isCategoryMenuOpen }"
              />
            </button>
          </div>

          <!-- ENLACES DIRECTOS A VISTAS CLAVE -->
          <nav class="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-300">
            <template v-if="isGuides">
              <NuxtLink to="/guias" class="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1.5">
                <span class="text-emerald-400">📚</span> Guías
              </NuxtLink>
              <NuxtLink to="/categoria/comandos" class="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                Comandos
              </NuxtLink>
              <NuxtLink to="/categoria/almacenamiento" class="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                Discos
              </NuxtLink>
              <NuxtLink to="/herramientas" class="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold hover:bg-emerald-500/20 transition-colors flex items-center gap-1">
                <span>🛠️</span> Herramientas
              </NuxtLink>
              <NuxtLink to="/blog" class="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <span class="text-amber-400">📝</span> Nuestro Blog
              </NuxtLink>
            </template>
            <template v-else>
              <NuxtLink to="/categoria/distribuciones" class="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1.5">
                <span class="text-orange-400">🐧</span> Distribuciones
              </NuxtLink>
              <NuxtLink to="/categoria/ciberseguridad" class="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                Seguridad
              </NuxtLink>
              <NuxtLink to="/categoria/kernel-linux" class="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                Kernel
              </NuxtLink>
              <NuxtLink to="/categoria/hardware" class="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                Hardware
              </NuxtLink>
              <a
                href="https://laguialinux.com"
                target="_blank"
                rel="noopener noreferrer"
                class="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold hover:bg-emerald-500/20 transition-colors flex items-center gap-1 ml-1"
              >
                <span>📚</span> Guías & Chuletas ↗
              </a>
            </template>
          </nav>
        </div>

        <!-- BÚSQUEDA RÁPIDA CMD+K Y TEMA -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="nav.toggleSearch()"
            class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs transition-colors"
          >
            <Icon name="lucide:search" class="w-4 h-4 text-slate-500" />
            <span class="hidden md:inline">{{ isNews ? 'Buscar noticias...' : 'Buscar guías o comandos...' }}</span>
            <kbd class="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">⌘K</kbd>
          </button>

          <NuxtLink
            to="/contacto"
            class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors shadow-sm"
            :class="isNews
              ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/50'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50'"
          >
            <span>Contacto</span>
          </NuxtLink>

          <!-- Botón Toggle Menú Móvil -->
          <button
            type="button"
            @click="nav.toggleMobileDrawer()"
            class="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            title="Abrir menú de navegación"
          >
            <Icon name="lucide:menu" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- PUNTO DE MONTAJE DEL MEGA-MENÚ DROPDOWN -->
      <CategoryMenu />
    </header>
  </div>
</template>
