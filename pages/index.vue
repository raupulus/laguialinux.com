<script setup lang="ts">
const { platform, isGuides, isNews } = usePlatform()

// Metadatos SEO dinámicos y esquema WebSite con useSeoEngine
useSeoEngine(() => ({
  title: isGuides.value
    ? 'Guías, Tutoriales, Comandos y Referencia Técnica para Sysadmins'
    : 'Actualidad, Distribuciones, Ciberseguridad y Open Source',
  description: platform.value.tagline,
  imageUrl: isGuides.value ? '/assets/img/covers/hero_laguialinux.webp' : '/assets/img/covers/hero_news.webp',
  schemaType: 'WebSite',
}))
</script>

<template>
  <main class="min-h-[calc(100vh-16rem)]">
    <!-- PORTADA 1: LA GUÍA LINUX (GUÍAS & TUTORIALES) -->
    <HomeGuides v-if="isGuides" />

    <!-- PORTADA 2: NOTICIAS LA GUÍA LINUX (ACTUALIDAD & CIBERSEGURIDAD) -->
    <HomeNews v-else-if="isNews" />

    <!-- FALLBACK DE SEGURIDAD SI EL SLUG NO COINCIDE -->
    <div v-else class="mx-auto max-w-3xl px-4 py-20 text-center">
      <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-4">
        <Icon name="lucide:alert-triangle" class="h-8 w-8" />
      </div>
      <h2 class="font-heading text-2xl font-bold text-white">
        Plataforma no reconocida
      </h2>
      <p class="mt-2 text-sm text-slate-400">
        El slug de plataforma configurado en el archivo <code class="font-mono text-amber-400">.env</code> (<code class="font-mono text-white">{{ platform.slug }}</code>) no coincide con los portales autorizados (<code class="font-mono text-emerald-400">laguialinux</code> o <code class="font-mono text-orange-400">news</code>).
      </p>
      <div class="mt-6 flex justify-center gap-4 text-xs font-mono">
        <span class="rounded bg-slate-800 px-3 py-1.5 text-slate-300">pnpm env:guias</span>
        <span class="rounded bg-slate-800 px-3 py-1.5 text-slate-300">pnpm env:noticias</span>
      </div>
    </div>
  </main>
</template>
