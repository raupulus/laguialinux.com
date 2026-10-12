<script setup lang="ts">
const { platform } = usePlatform()

// Metadatos globales y título reactivo según la plataforma activa
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} · ${platform.value.name}` : `${platform.value.name} — ${platform.value.tagline}`
  },
  htmlAttrs: {
    lang: 'es',
    class: 'dark',
  },
  meta: [
    { name: 'description', content: platform.value.tagline },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { charset: 'utf-8' },
  ],
})
</script>

<template>
  <div
    :class="`theme-${platform.themeAccent}`"
    class="min-h-screen bg-[#080c14] text-slate-100 antialiased selection:bg-emerald-500 selection:text-black"
  >
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
