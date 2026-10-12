<script setup lang="ts">
const { platform, isGuides, isNews } = usePlatform()
const nav = useNavigationStore()
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="rounded-2xl border border-slate-800 bg-[#0b0f17] p-8 shadow-xl sm:p-12">
      <!-- Badge de Estado -->
      <div class="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-400">
        <Icon name="lucide:check-circle-2" class="h-4 w-4" />
        Base Nuxt 3 / 4 Inicializada con Éxito
      </div>

      <!-- Título y Tagline -->
      <h2 class="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        {{ platform.name }}
      </h2>
      <p class="mt-3 max-w-2xl text-base text-slate-400 sm:text-lg">
        {{ platform.tagline }}
      </p>

      <!-- Grid de Módulos e Integraciones -->
      <div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Nuxt & Vue -->
        <div class="rounded-xl border border-slate-800/80 bg-slate-900/50 p-5">
          <div class="flex items-center gap-3">
            <Icon name="logos:nuxt-icon" class="h-6 w-6" />
            <h3 class="font-semibold text-white">Nuxt + Vue 3</h3>
          </div>
          <p class="mt-2 text-xs text-slate-400">
            Arquitectura moderna, SSR/SSG listo y TypeScript estricto.
          </p>
        </div>

        <!-- Tailwind CSS v4 -->
        <div class="rounded-xl border border-slate-800/80 bg-slate-900/50 p-5">
          <div class="flex items-center gap-3">
            <Icon name="logos:tailwindcss-icon" class="h-6 w-6" />
            <h3 class="font-semibold text-white">Tailwind CSS v4</h3>
          </div>
          <p class="mt-2 text-xs text-slate-400">
            Compilación ultrarrápida con Vite plugin y variables temáticas.
          </p>
        </div>

        <!-- Pinia -->
        <div class="rounded-xl border border-slate-800/80 bg-slate-900/50 p-5">
          <div class="flex items-center gap-3">
            <Icon name="logos:pinia" class="h-6 w-6" />
            <h3 class="font-semibold text-white">Pinia State</h3>
          </div>
          <p class="mt-2 text-xs text-slate-400">
            Gestor de estado reactivo listo en <code class="text-slate-300">stores/</code>.
          </p>
        </div>

        <!-- Nuxt Icon -->
        <div class="rounded-xl border border-slate-800/80 bg-slate-900/50 p-5">
          <div class="flex items-center gap-3">
            <Icon name="lucide:sparkles" class="h-6 w-6 text-amber-400" />
            <h3 class="font-semibold text-white">Iconos Ligeros</h3>
          </div>
          <p class="mt-2 text-xs text-slate-400">
            Módulo <code class="text-slate-300">@nuxt/icon</code> con Iconify (Lucide/Heroicons).
          </p>
        </div>
      </div>

      <!-- Configuración Multitenant Detectada -->
      <div class="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-5">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Variables de Entorno Activas (.env)
        </h4>
        <dl class="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
          <div class="flex justify-between border-b border-slate-800/60 py-1.5">
            <dt class="text-slate-400">Plataforma:</dt>
            <dd class="font-mono text-emerald-400">{{ platform.slug }} ({{ platform.domain }})</dd>
          </div>
          <div class="flex justify-between border-b border-slate-800/60 py-1.5">
            <dt class="text-slate-400">API Backend:</dt>
            <dd class="font-mono text-slate-300">{{ platform.apiBaseUrl }}</dd>
          </div>
          <div class="flex justify-between border-b border-slate-800/60 py-1.5">
            <dt class="text-slate-400">Tema Visual:</dt>
            <dd class="font-mono text-slate-300">{{ platform.themeAccent }}</dd>
          </div>
          <div class="flex justify-between border-b border-slate-800/60 py-1.5">
            <dt class="text-slate-400">Herramientas Sysadmin:</dt>
            <dd class="font-mono text-slate-300">{{ platform.features.tools ? 'Habilitadas' : 'Deshabilitadas' }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>
