<script setup lang="ts">
const { platform, isGuides, isNews } = usePlatform()
const nav = useNavigationStore()
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-slate-800 bg-[#080c14]/90 backdrop-blur-md">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      
      <!-- LOGO + MARCA -->
      <div class="flex items-center gap-4 lg:gap-6">
        <NuxtLink to="/" class="group flex items-center gap-3 shrink-0">
          <img
            :src="platform.themeAccent === 'orange' ? '/img/news_badge.webp' : '/img/laguialinux_badge.webp'"
            width="40"
            height="40"
            :alt="`Isotipo ${platform.name}`"
            class="h-10 w-10 object-contain drop-shadow-md transition-transform group-hover:scale-105"
          >
          <div>
            <div class="flex items-center gap-2 font-heading text-lg font-extrabold tracking-tight text-white leading-none">
              <span>{{ platform.name }}</span>
              <span
                class="rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider"
                :class="platform.themeAccent === 'orange'
                  ? 'border-orange-500/30 bg-orange-500/10 text-orange-400'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'"
              >
                {{ isGuides ? '2.0 Reborn' : 'News Portal' }}
              </span>
            </div>
            <p class="mt-1 hidden font-mono text-[11px] text-slate-400 sm:block">
              {{ isGuides ? 'Guías, Referencia Técnica & Sysadmin' : 'Actualidad Linux, Seguridad & Open Source' }}
            </p>
          </div>
        </NuxtLink>
      </div>

      <!-- ENLACES DE NAVEGACIÓN DESKTOP -->
      <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <template v-if="isGuides">
          <NuxtLink to="/" class="transition-colors hover:text-emerald-400">Inicio</NuxtLink>
          <NuxtLink to="/guias" class="transition-colors hover:text-emerald-400">Guías</NuxtLink>
          <NuxtLink to="/herramientas" class="transition-colors hover:text-emerald-400">Herramientas</NuxtLink>
          <NuxtLink to="/blog" class="transition-colors hover:text-emerald-400">Blog</NuxtLink>
          <a
            href="https://news.laguialinux.com"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
          >
            Noticias
            <Icon name="lucide:external-link" class="h-3 w-3" />
          </a>
        </template>
        <template v-else>
          <NuxtLink to="/" class="transition-colors hover:text-orange-400">Actualidad</NuxtLink>
          <NuxtLink to="/categoria/distribuciones" class="transition-colors hover:text-orange-400">Distribuciones</NuxtLink>
          <NuxtLink to="/categoria/seguridad" class="transition-colors hover:text-orange-400">Seguridad</NuxtLink>
          <NuxtLink to="/categoria/kernel" class="transition-colors hover:text-orange-400">Kernel</NuxtLink>
          <a
            href="https://laguialinux.com"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Guías & Comandos
            <Icon name="lucide:external-link" class="h-3 w-3" />
          </a>
        </template>
      </nav>

      <!-- ACCIONES DERECHA -->
      <div class="flex items-center gap-3">
        <!-- BOTÓN BÚSQUEDA RÁPIDA -->
        <button
          type="button"
          @click="nav.toggleSearch()"
          class="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-800"
          title="Buscar (Cmd+K)"
        >
          <Icon name="lucide:search" class="h-4 w-4 text-slate-400" />
          <span class="hidden sm:inline">Buscar...</span>
          <kbd class="hidden font-mono text-[10px] text-slate-500 sm:inline-block border border-slate-700 rounded px-1">⌘K</kbd>
        </button>

        <!-- INDICADOR DE ENTORNO ACTIVO -->
        <div
          class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border"
          :class="platform.themeAccent === 'orange'
            ? 'border-orange-800/40 bg-orange-950/70 text-orange-400'
            : 'border-emerald-800/40 bg-emerald-950/70 text-emerald-400'"
        >
          <span
            class="h-1.5 w-1.5 rounded-full animate-pulse"
            :class="platform.themeAccent === 'orange' ? 'bg-orange-400' : 'bg-emerald-400'"
          />
          <span class="font-mono">{{ platform.slug }}</span>
        </div>

        <!-- BOTÓN MENÚ MÓVIL -->
        <button
          type="button"
          @click="nav.toggleMobileDrawer()"
          class="flex md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Abrir menú"
        >
          <Icon name="lucide:menu" class="h-5 w-5" />
        </button>
      </div>

    </div>
  </header>
</template>
