<script setup lang="ts">
const { isGuides, isNews } = usePlatform()
</script>

<template>
  <aside aria-label="Ecosistema de Plataformas" class="bg-slate-950 border-b border-slate-800/80 text-xs px-4 lg:px-8 py-1.5 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <span class="text-slate-500 text-[11px] font-mono hidden sm:inline">Ecosistema:</span>
      
      <!-- LINK A GUÍAS -->
      <a
        v-if="isGuides"
        href="/"
        class="text-emerald-400 font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs"
      >
        laguialinux.com (Guías)
      </a>
      <a
        v-else
        href="https://laguialinux.com"
        target="_blank"
        rel="noopener noreferrer"
        class="text-slate-400 hover:text-emerald-400 transition-colors text-xs px-1.5 py-0.5"
      >
        laguialinux.com (Guías)
      </a>

      <!-- LINK A NOTICIAS -->
      <a
        v-if="isNews"
        href="/"
        class="text-orange-400 font-semibold px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-xs"
      >
        news.laguialinux.com (Noticias)
      </a>
      <a
        v-else
        href="https://news.laguialinux.com"
        target="_blank"
        rel="noopener noreferrer"
        class="text-slate-400 hover:text-orange-400 transition-colors text-xs px-1.5 py-0.5"
      >
        news.laguialinux.com (Noticias)
      </a>
    </div>

    <div class="flex items-center gap-4 text-slate-400 text-xs">
      <span class="text-slate-500 font-mono text-[11px] hidden md:inline">Compartiendo conocimiento desde 2001</span>
      <span class="hidden md:inline">·</span>
      <a href="https://t.me/raupulus" target="_blank" rel="noopener noreferrer" class="hover:text-cyan-400 transition-colors hidden sm:inline">Telegram</a>
      <NuxtLink to="/contacto" class="hover:text-emerald-400 transition-colors font-medium">Contacto</NuxtLink>
    </div>
  </aside>
</template>
