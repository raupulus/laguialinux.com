<script setup lang="ts">
/**
 * pages/blog/[slug].vue
 * Lector de Artículos del Blog Técnico de La Guía Linux
 * Licencia: GNU AGPLv3
 * Autor: Raúl Caro Pastorino (https://raupulus.dev)
 */

import type { ContentDetailResource, ContentResource } from '~/types'
import { SAMPLE_BLOG_POSTS } from '~/utils/sampleContentsData'
import ContentRenderer from '~/components/ContentRenderer.vue'

const route = useRoute()
const { platform, isGuides } = usePlatform()
const api = useApiClient()

// 1. Identificación reactiva del Slug
const postSlug = computed(() => {
  try {
    return decodeURIComponent(String(route.params.slug || ''))
  } catch {
    return String(route.params.slug || '')
  }
})

// 2. Consulta API V2 con Fallback
const { data: postData, error } = await useAsyncData(
  `blog-post-${platform.value.slug}-${postSlug.value}`,
  async () => {
    try {
      const res = await api.getContentBySlug(postSlug.value, {
        include: 'pages,taxonomies,seo',
        format: 'editorjs',
      })
      if (res?.data) return res.data
    } catch {
      // Ignorar para degradar
    }

    const local = SAMPLE_BLOG_POSTS.find(
      p => p.slug === postSlug.value || String(p.id) === postSlug.value
    )
    if (local) {
      return {
        ...local,
        first_page: {
          id: 1,
          content_id: local.id,
          order: 1,
          title: local.title,
          format: 'editorjs',
          body: local.pages?.[0]?.body || '<p>Contenido en desarrollo.</p>',
          slug: 'principal',
        },
      } as unknown as ContentDetailResource
    }

    throw createError({
      statusCode: 404,
      statusMessage: `Artículo "${postSlug.value}" no encontrado en el blog`,
      fatal: true,
    })
  },
  { watch: [postSlug] }
)

if (error.value || !postData.value) {
  throw createError({
    statusCode: 404,
    statusMessage: `Artículo "${postSlug.value}" no encontrado en el blog`,
    fatal: true,
  })
}

const post = computed(() => postData.value!)

const stepBody = computed(() => {
  if (post.value?.first_page?.body) {
    return post.value.first_page.body
  }
  if (post.value?.pages?.[0]?.body) {
    return post.value.pages[0].body
  }
  return ''
})

// Formateo de fecha
const formattedDate = computed(() => {
  if (!post.value?.published_at) return 'Reciente'
  try {
    return new Date(post.value.published_at).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return post.value.published_at
  }
})

// URLs y Redes
const canonicalUrl = computed(() => `https://${platform.value.domain}/blog/${postSlug.value}`)
const copyShareFeedback = ref(false)

const copyShareLink = () => {
  if (import.meta.client && navigator.clipboard) {
    navigator.clipboard.writeText(canonicalUrl.value)
    copyShareFeedback.value = true
    setTimeout(() => {
      copyShareFeedback.value = false
    }, 2500)
  }
}

// Artículos recomendados
const relatedPosts = computed(() => {
  return SAMPLE_BLOG_POSTS.filter(p => p.slug !== postSlug.value).slice(0, 3)
})

// SEO y Marcado Estructurado con useSeoEngine
useSeoEngine(() => ({
  title: `${post.value?.title} · El Blog`,
  description: post.value?.excerpt || 'Artículo técnico en La Guía Linux',
  canonicalUrl: canonicalUrl.value,
  imageUrl: post.value?.image?.url || `https://${platform.value.domain}/assets/img/covers/cover_blog.webp`,
  imageAlt: post.value?.title || 'Artículo del blog técnico',
  type: 'article',
  publishedAt: post.value?.published_at,
  modifiedAt: post.value?.updated_at || post.value?.published_at,
  schemaType: 'TechArticle',
  breadcrumbs: [
    { name: 'Inicio', url: `https://${platform.value.domain}/` },
    { name: 'Blog', url: `https://${platform.value.domain}/blog` },
    { name: post.value?.title || 'Artículo', url: canonicalUrl.value },
  ],
}))
</script>

<template>
  <div v-if="post" class="min-h-screen flex flex-col font-body">
    
    <!-- 1. MIGA DE PAN Y NAVEGACIÓN SUPERIOR -->
    <div class="bg-slate-950 border-b border-slate-800 px-4 lg:px-8 py-2.5">
      <div class="max-w-4xl mx-auto flex items-center justify-between text-xs font-mono text-slate-400">
        <div class="flex items-center gap-2 truncate">
          <NuxtLink to="/" class="hover:text-white transition-colors">Inicio</NuxtLink>
          <span>/</span>
          <NuxtLink to="/blog" class="hover:text-rose-400 transition-colors">Blog</NuxtLink>
          <span>/</span>
          <span class="text-slate-200 truncate">{{ post.title }}</span>
        </div>

        <NuxtLink
          to="/blog"
          class="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs shrink-0 transition-colors"
        >
          ← Catálogo del Blog
        </NuxtLink>
      </div>
    </div>

    <!-- 2. CONTENIDO PRINCIPAL: LECTURA DE ARTÍCULO -->
    <main class="max-w-4xl mx-auto w-full px-4 lg:px-8 py-10 flex-1 space-y-8">
      
      <!-- ENCABEZADO EDITORIAL -->
      <header class="space-y-4">
        <div class="flex flex-wrap items-center gap-3 text-xs font-mono">
          <span class="px-2.5 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            {{ (post as any).category?.name || 'Opinión y Filosofía' }}
          </span>
          <span class="text-slate-500">•</span>
          <span class="text-slate-400">📅 {{ formattedDate }}</span>
          <span class="text-slate-500">•</span>
          <span class="text-slate-400">⏱️ {{ (post as any).readingTime || '7 min de lectura' }}</span>
        </div>

        <h1 class="font-heading font-black text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
          {{ post.title }}
        </h1>

        <p class="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
          {{ post.excerpt }}
        </p>

        <!-- FIRMA DE AUTOR OFICIAL -->
        <div class="flex items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-rose-600 to-amber-700 flex items-center justify-center font-bold text-white shadow-inner">
              R
            </div>
            <div>
              Por
              <a
                href="https://raupulus.dev"
                target="_blank"
                rel="noopener noreferrer"
                class="text-white font-bold hover:underline"
              >
                Raúl Caro Pastorino (@raupulus)
              </a>
              <span class="text-slate-500 hidden sm:inline"> · Autor & Sysadmin</span>
            </div>
          </div>

          <!-- BOTÓN COMPARTIR RÁPIDO -->
          <button
            type="button"
            @click="copyShareLink"
            class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors font-mono text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>🔗</span>
            <span>{{ copyShareFeedback ? '¡Enlace copiado!' : 'Copiar enlace' }}</span>
          </button>
        </div>
      </header>

      <!-- IMAGEN DE PORTADA DEL ARTÍCULO -->
      <div v-if="post.image?.url" class="rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        <img
          :src="post.image.url"
          :alt="post.title"
          class="w-full h-auto max-h-[500px] object-cover"
        />
      </div>

      <!-- CUERPO TÉCNICO RENDERIZADO (EDITOR.JS / MARKDOWN / TERMINAL) -->
      <article class="pt-4">
        <ContentRenderer :content="stepBody" />
      </article>

      <!-- BARRA DE DIFUSIÓN SOCIAL -->
      <section class="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-3 shadow-lg">
        <h3 class="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Comparte este artículo con la comunidad:
        </h3>
        <div class="flex flex-wrap items-center gap-2">
          <a
            :href="`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(canonicalUrl)}&via=raupulus`"
            target="_blank"
            rel="noopener noreferrer"
            class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono transition-colors"
          >
            𝕏 Compartir
          </a>
          <a
            :href="`https://t.me/share/url?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(post.title)}`"
            target="_blank"
            rel="noopener noreferrer"
            class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono transition-colors"
          >
            ✈️ Telegram
          </a>
          <a
            :href="`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + canonicalUrl)}`"
            target="_blank"
            rel="noopener noreferrer"
            class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono transition-colors"
          >
            💬 WhatsApp
          </a>
          <button
            type="button"
            @click="copyShareLink"
            class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono transition-colors cursor-pointer"
          >
            {{ copyShareFeedback ? '✅ Copiado' : '📋 Copiar URL' }}
          </button>
        </div>
      </section>

      <!-- TARJETA BIOGRÁFICA DEL AUTOR -->
      <section class="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
        <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-700 flex items-center justify-center font-bold text-white text-2xl shadow-xl shrink-0">
          🐧
        </div>
        <div class="space-y-2 text-center sm:text-left flex-1 min-w-0">
          <div class="font-heading font-black text-lg text-white">
            Raúl Caro Pastorino
            <span class="text-xs font-mono font-normal text-rose-400 ml-1">(@raupulus)</span>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            Ingeniero de software y administrador de sistemas. Fundador de La Guía Linux en 2001, divulgando cultura libre, GNU/Linux y automatización de servidores.
          </p>
          <div class="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs font-mono text-slate-400">
            <a href="https://raupulus.dev" target="_blank" rel="noopener noreferrer" class="text-rose-400 hover:underline">
              🌐 raupulus.dev
            </a>
            <span>•</span>
            <a href="mailto:public@raupulus.dev" class="text-slate-300 hover:underline">
              ✉️ public@raupulus.dev
            </a>
          </div>
        </div>
      </section>

      <!-- ARTÍCULOS RELACIONADOS -->
      <section v-if="relatedPosts.length > 0" class="pt-8 border-t border-slate-800 space-y-4">
        <h3 class="font-heading font-bold text-lg text-white">
          Otros artículos de la bitácora
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NuxtLink
            v-for="rel in relatedPosts"
            :key="rel.id"
            :to="`/blog/${rel.slug}`"
            class="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all flex flex-col justify-between"
          >
            <div>
              <span class="text-[10px] font-mono text-rose-400 block mb-1">
                {{ rel.categoryName }}
              </span>
              <span class="text-xs font-bold text-white line-clamp-2 block mb-2">
                {{ rel.title }}
              </span>
            </div>
            <span class="text-[11px] font-mono text-slate-500">
              Leer artículo →
            </span>
          </NuxtLink>
        </div>
      </section>

    </main>

  </div>
</template>
