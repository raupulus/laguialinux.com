<script setup lang="ts">
const { platform } = usePlatform()
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <!-- Header temporal base -->
    <header class="sticky top-0 z-40 border-b border-slate-800 bg-[#080c14]/90 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-700/60 shadow-inner">
            <Icon
              :name="platform.themeAccent === 'orange' ? 'lucide:newspaper' : 'lucide:terminal'"
              :class="platform.themeAccent === 'orange' ? 'text-orange-500' : 'text-emerald-400'"
              class="h-6 w-6"
            />
          </div>
          <div>
            <h1 class="text-base font-bold tracking-tight text-white sm:text-lg">
              {{ platform.name }}
            </h1>
            <p class="text-xs text-slate-400">
              {{ platform.domain }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
            :class="platform.themeAccent === 'orange' ? 'bg-orange-950/70 text-orange-400 border border-orange-800/40' : 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40'"
          >
            <span class="h-1.5 w-1.5 rounded-full animate-pulse" :class="platform.themeAccent === 'orange' ? 'bg-orange-400' : 'bg-emerald-400'" />
            {{ platform.slug }}
          </span>
        </div>
      </div>
    </header>

    <!-- Contenido Principal -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer temporal base -->
    <footer class="border-t border-slate-800/80 bg-[#05080f] py-6 text-center text-xs text-slate-500">
      <p>
        {{ platform.name }} &copy; {{ new Date().getFullYear() }} &middot; Código bajo GNU AGPLv3 &middot; Contenidos bajo CC BY-SA 4.0
      </p>
    </footer>
  </div>
</template>
