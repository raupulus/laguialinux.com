<script setup lang="ts">
const route = useRoute()
const { platform, isGuides } = usePlatform()
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
    <div
      class="inline-flex h-16 w-16 items-center justify-center rounded-2xl border mb-6"
      :class="platform.themeAccent === 'orange'
        ? 'border-orange-500/30 bg-orange-950/40 text-orange-400'
        : 'border-emerald-500/30 bg-emerald-950/40 text-emerald-400'"
    >
      <Icon name="lucide:construction" class="h-8 w-8" />
    </div>

    <div class="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 font-mono text-xs text-slate-400 mb-4">
      Ruta: <span class="text-white">{{ route.path }}</span>
    </div>

    <h1 class="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
      Sección en Preparación
    </h1>

    <p class="mt-3 text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
      Esta sección del portal <strong class="text-slate-200">{{ platform.name }}</strong> se encuentra actualmente en fase de desarrollo e integración con la API REST V2.
    </p>

    <div class="mt-8 flex justify-center gap-4">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-md"
        :class="platform.themeAccent === 'orange'
          ? 'bg-orange-500 hover:bg-orange-400 text-black shadow-orange-500/20'
          : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'"
      >
        <Icon name="lucide:arrow-left" class="h-4 w-4" />
        Volver a la Portada
      </NuxtLink>
    </div>
  </div>
</template>
