<script setup lang="ts">
/**
 * pages/blog/index.vue
 * Catálogo del Blog Técnico de La Guía Linux con Tarjetas Pop-Out
 * Licencia: GNU AGPLv3
 * Autor: Raúl Caro Pastorino (https://raupulus.dev)
 */

import type { ContentResource } from '~/types'
import { SAMPLE_BLOG_POSTS } from '~/utils/sampleContentsData'

const { platform, isGuides } = usePlatform()
const api = useApiClient()

// 1. Filtros Reactivos
const selectedCategory = ref('')
const selectedTechnology = ref('')
const searchQuery = ref('')

// 2. Consulta API V2 con Fallback a SAMPLE_BLOG_POSTS
const { data: blogPostsData, status } = await useAsyncData(
  `blog-posts-catalog-${platform.value.slug}`,
  async () => {
    try {
      const res = await api.getContents({
        type: 'blog',
        per_page: 25,
      })
      if (res?.data && res.data.length > 0) {
        return res.data
      }
    } catch {
      // Ignorar para degradar al dataset de muestra
    }

    return SAMPLE_BLOG_POSTS as unknown as ContentResource[]
  }
)

const rawPosts = computed<ContentResource[]>(() => blogPostsData.value || [])

// 3. Opciones de Categorías Únicas
const categoryOptions = computed(() => {
  const cats = new Set<string>()
  rawPosts.value.forEach((p: any) => {
    const cat = p.category?.name || p.categoryName
    if (cat) cats.add(cat)
  })
  return Array.from(cats)
})

// 4. Filtrado Dinámico en Cliente
const filteredPosts = computed(() => {
  return rawPosts.value.filter((post: any) => {
    // Filtro por categoría
    if (selectedCategory.value) {
      const cat = post.category?.name || post.categoryName
      if (cat !== selectedCategory.value) return false
    }

    // Filtro por búsqueda rápida
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const titleMatch = (post.title || '').toLowerCase().includes(q)
      const excerptMatch = (post.excerpt || '').toLowerCase().includes(q)
      if (!titleMatch && !excerptMatch) return false
    }

    return true
  })
})

const getPostDate = (isoStr?: string) => {
  if (!isoStr) return 'Reciente'
  try {
    return new Date(isoStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return isoStr
  }
}

useSeoMeta({
  title: 'El Blog de La Guía Linux · Reflexiones, Hardware y Vivencias Open Source',
  description: 'Artículos técnicos de opinión, vivencias diarias, hardware open source y reflexiones del autor sobre Linux y software libre.',
  ogTitle: 'El Blog de La Guía Linux · Reflexiones y Cultura Open Source',
  ogDescription: 'Artículos técnicos de opinión y vivencias sobre Linux y software libre.',
})
</script>

<template>
  <div class="min-h-screen flex flex-col font-body">
    
    <!-- 1. CABECERA EDITORIAL DEL BLOG -->
    <section class="py-12 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-[#080c14]">
      <div class="max-w-7xl mx-auto px-4 lg:px-8 text-center">
        
        <span class="text-xs font-mono uppercase tracking-widest text-rose-400 mb-2 block font-semibold">
          Bitácora Técnica Personal & Ecosistema
        </span>
        <h1 class="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight mb-4">
          Nuestro <span class="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-orange-400">Blog</span>
        </h1>
        <p class="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Reflexiones de ingeniería, vivencias administrando servidores, arquitectura de software, setups de terminal y filosofía del software libre.
        </p>

        <!-- BARRA DE FILTROS SUPERIORES -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 max-w-4xl mx-auto shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <!-- FILTRO DE CATEGORÍA -->
          <div class="w-full sm:w-auto flex-1">
            <label for="filter-category" class="block text-left text-[11px] font-mono text-slate-400 mb-1">
              Filtrar por categoría
            </label>
            <div class="relative">
              <select
                id="filter-category"
                v-model="selectedCategory"
                class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500 appearance-none font-medium"
              >
                <option value="">Todas las categorías ({{ rawPosts.length }})</option>
                <option v-for="cat in categoryOptions" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</span>
            </div>
          </div>

          <!-- BÚSQUEDA EN EL BLOG -->
          <div class="w-full sm:w-auto flex-1">
            <label for="blog-search" class="block text-left text-[11px] font-mono text-slate-400 mb-1">
              Búsqueda de palabras clave
            </label>
            <div class="relative">
              <input
                id="blog-search"
                v-model="searchQuery"
                type="text"
                placeholder="Buscar artículos..."
                class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 font-mono"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- 2. CONTENIDO PRINCIPAL: GRILLA DE ARTÍCULOS CON TARJETAS POP-OUT -->
    <main class="max-w-7xl mx-auto px-4 lg:px-8 py-16 flex-1 w-full space-y-12">
      
      <!-- SIN RESULTADOS -->
      <div v-if="filteredPosts.length === 0" class="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800">
        <span class="text-4xl mb-3 block">📭</span>
        <h3 class="font-heading text-lg font-bold text-white mb-2">No se encontraron artículos</h3>
        <p class="text-xs text-slate-400 mb-4">Intenta ajustar los filtros de búsqueda o categoría.</p>
        <button
          type="button"
          @click="selectedCategory = ''; searchQuery = ''"
          class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white transition-colors"
        >
          Restablecer Filtros
        </button>
      </div>

      <!-- LISTADO DE TARJETAS -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        <article
          v-for="post in filteredPosts"
          :key="post.id"
          class="group rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden hover:border-rose-500/50 transition-all duration-300 hover:-translate-y-1"
        >
          <!-- IMAGEN SUPERIOR CON EFECTO DE PROFUNDIDAD -->
          <div class="relative aspect-video w-full bg-slate-950 overflow-hidden border-b border-slate-800/80">
            <img
              :src="post.image?.url || '/assets/img/covers/cover_blog.webp'"
              :alt="post.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            
            <!-- BADGE DE CATEGORÍA FLOTANTE -->
            <div class="absolute bottom-3 left-4">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-md">
                {{ (post as any).category?.name || (post as any).categoryName || 'Opinión' }}
              </span>
            </div>
          </div>

          <!-- CUERPO DE LA TARJETA -->
          <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                <span>📅 {{ getPostDate(post.published_at) }}</span>
                <span>⏱️ {{ (post as any).readingTime || '6 min' }}</span>
              </div>

              <h2 class="font-heading font-bold text-lg text-white group-hover:text-rose-400 transition-colors leading-snug line-clamp-2">
                <NuxtLink :to="`/blog/${post.slug}`">
                  {{ post.title }}
                </NuxtLink>
              </h2>

              <p class="text-xs text-slate-400 leading-relaxed mt-2 line-clamp-3 font-normal">
                {{ post.excerpt }}
              </p>
            </div>

            <!-- BOTÓN LEER ARTÍCULO -->
            <div class="pt-2">
              <NuxtLink
                :to="`/blog/${post.slug}`"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white font-bold text-xs transition-all shadow"
              >
                <span>Leer artículo</span>
                <span>→</span>
              </NuxtLink>
            </div>
          </div>

          <!-- PIE DE TARJETA: METADATOS Y REDES DEL AUTOR -->
          <footer class="bg-slate-950/80 border-t border-slate-800/80 px-6 py-2.5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Raúl Caro Pastorino</span>
            <span class="text-slate-600">@raupulus</span>
          </footer>

        </article>

      </div>

    </main>

  </div>
</template>
