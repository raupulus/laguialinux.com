<script setup lang="ts">
const { platform, isGuides } = usePlatform()

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
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: platform.value.themeAccent === 'orange' ? '/assets/img/news_favicon.ico' : '/assets/img/laguialinux_favicon.ico',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: '',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap',
    },
  ],
})
</script>

<template>
  <div
    :class="platform.themeAccent === 'orange' ? 'selection:bg-orange-500 selection:text-black' : 'selection:bg-emerald-400 selection:text-black'"
    class="min-h-screen bg-[#080c14] text-slate-100 antialiased"
  >
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
