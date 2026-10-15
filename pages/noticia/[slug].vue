<script setup lang="ts">
/**
 * pages/noticia/[slug].vue
 * Lector Continuo de Noticias sin Paginación (MOD-14)
 * La Guía Linux News — Ecosistema laguialinux.com
 * Licencia: GNU AGPLv3
 * Autor: Raúl Caro Pastorino (https://raupulus.dev)
 */

import type { ContentDetailResource, ContentResource } from '~/types'
import { SAMPLE_NEWS } from '~/utils/sampleContentsData'
import ContentRenderer from '~/components/ContentRenderer.vue'

const route = useRoute()
const { platform, isNews } = usePlatform()
const api = useApiClient()

// 1. Identificación reactiva del Slug de la Noticia
const newsSlug = computed(() => {
  try {
    return decodeURIComponent(String(route.params.slug || ''))
  } catch {
    return String(route.params.slug || '')
  }
})

// 2. Consulta a API V2 con Fallback a SAMPLE_NEWS y 404 Estricto
const { data: newsData, error: newsError } = await useAsyncData(
  `news-detail-${platform.value.slug}-${newsSlug.value}`,
  async () => {
    try {
      const res = await api.getContentBySlug(newsSlug.value, {
        include: 'pages,taxonomies,seo,galleries',
        format: 'editorjs',
      })
      if (res?.data) return res.data
    } catch {
      // Ignorar para recurrir al fallback
    }

    const local = SAMPLE_NEWS.find(
      n => n.slug === newsSlug.value || String(n.id) === newsSlug.value
    )
    if (local) {
      return {
        id: local.id,
        title: local.title,
        slug: local.slug,
        excerpt: local.excerpt,
        published_at: local.published_at,
        updated_at: local.updated_at,
        views_count: local.views_count,
        category: {
          slug: local.categorySlug,
          name: local.categoryName,
          color: local.categoryColor,
        },
        image: {
          url: local.image.url,
          caption: local.image.caption,
          credits: local.image.credits,
        },
        metadata: {
          reading_time_minutes: parseInt(local.readingTime) || 3,
          sources: local.sources,
        },
        pages: local.sections.map(s => ({
          id: s.id,
          order: s.order,
          title: s.title,
          slug: `seccion-${s.order}`,
          format: 'html' as const,
          body: s.body,
        })),
      } as unknown as ContentDetailResource
    }

    // Si la noticia no existe en la API ni en el dataset local, lanzar error 404 estricto
    throw createError({
      statusCode: 404,
      statusMessage: `Noticia "${newsSlug.value}" no encontrada`,
      fatal: true,
    })
  },
  { watch: [newsSlug] }
)

// Si la noticia no existe en la carga inicial (SSR / primera carga), lanzar error 404
if (!newsData.value) {
  throw createError({
    statusCode: 404,
    statusMessage: `Noticia "${newsSlug.value}" no encontrada`,
    fatal: true,
  })
}

// Observador reactivo para interceptar navegaciones del cliente a slugs inexistentes
watch(
  () => route.params.slug,
  async (newSlug) => {
    if (newSlug) {
      let decoded = String(newSlug)
      try {
        decoded = decodeURIComponent(decoded)
      } catch {
        // Fallback si decodeURIComponent falla
      }

      const local = SAMPLE_NEWS.find(
        n => n.slug === decoded || String(n.id) === decoded
      )
      if (local) return

      try {
        const res = await api.getContentBySlug(decoded, { format: 'html' })
        if (res?.data) return
      } catch {
        // Noticia no encontrada en API
      }

      showError({
        statusCode: 404,
        statusMessage: `Noticia "${decoded}" no encontrada`,
        fatal: false,
      })
    }
  }
)

watch(newsError, (err) => {
  if (err) {
    showError({
      statusCode: (err as any)?.statusCode || 404,
      statusMessage: (err as any)?.statusMessage || `Noticia "${newsSlug.value}" no encontrada`,
      fatal: false,
    })
  }
})

const news = computed(() => newsData.value)

// 3. Flujo Continuo: Todas las secciones en secuencia vertical continua
const sections = computed(() => {
  return news.value?.pages || []
})

// 4. Barra de Progreso de Scroll Horizontal en la parte superior
const scrollProgress = ref(0)
const calculateScroll = () => {
  if (import.meta.client) {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight
    if (totalHeight > 0) {
      scrollProgress.value = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100))
    } else {
      scrollProgress.value = 0
    }
  }
}
const onScroll = calculateScroll

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', calculateScroll, { passive: true })
    calculateScroll()
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', calculateScroll)
  }
})

// 5. Formateo de Fecha en Castellano
const formattedDate = computed(() => {
  if (!news.value?.published_at) return 'Fecha no disponible'
  try {
    const d = new Date(news.value.published_at)
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Madrid',
    }) + ' CET'
  } catch {
    return news.value.published_at
  }
})

// 6. Fuentes Primarias de la Noticia
const sourcesList = computed<Array<{ title: string; url: string }>>(() => {
  return (news.value?.metadata as any)?.sources || []
})

// 7. Noticias Relacionadas
const relatedNews = computed(() => {
  return SAMPLE_NEWS.filter(n => n.slug !== newsSlug.value).slice(0, 3)
})

// 8. Enlace canónico y Copiar enlace
const canonicalUrl = computed(() => `https://${platform.value.domain}/noticia/${newsSlug.value}`)
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

// 9. SEO y Marcado Estructurado NewsArticle con useSeoEngine
useSeoEngine(() => ({
  title: news.value?.title || 'Noticia de Actualidad',
  description: news.value?.excerpt || 'Noticia sobre software libre y GNU/Linux',
  imageUrl: news.value?.image?.url || `https://${platform.value.domain}/assets/img/covers/hero_news.webp`,
  imageAlt: news.value?.title,
  type: 'article',
  publishedAt: news.value?.published_at,
  modifiedAt: news.value?.updated_at || news.value?.published_at,
  schemaType: 'NewsArticle',
  breadcrumbs: [
    { name: 'Inicio', url: `https://${platform.value.domain}/` },
    ...(news.value?.category ? [{ name: news.value.category.name, url: `https://${platform.value.domain}/categoria/${news.value.category.slug}` }] : []),
    { name: news.value?.title || 'Noticia', url: `https://${platform.value.domain}/noticia/${newsSlug.value}` },
  ],
}))
</script>

<template>
  <div v-if="news" class="min-h-screen flex flex-col font-sans selection:bg-orange-500 selection:text-white">
    
    <!-- BARRA FIJA DE PROGRESO DE LECTURA (SCROLL PROGRESS) -->
    <div
      class="fixed top-0 left-0 h-1 bg-gradient-to-r from-orange-600 to-amber-500 z-50 transition-all duration-75"
      :style="{ width: `${scrollProgress}%` }"
    ></div>

    <!-- 1. BREADCRUMBS -->
    <nav class="max-w-5xl mx-auto w-full px-4 pt-6 text-xs text-slate-300 font-mono flex items-center gap-2" aria-label="Migas de pan">
      <NuxtLink to="/" class="text-slate-400 hover:text-orange-400 transition-colors">Inicio</NuxtLink>
      <span class="text-slate-500">/</span>
      <NuxtLink
        v-if="news.category"
        :to="isNews ? `/categoria/${news.category.slug}` : `https://news.laguialinux.com/categoria/${news.category.slug}`"
        class="text-slate-400 hover:text-orange-400 transition-colors"
      >
        {{ news.category.name }}
      </NuxtLink>
      <span v-if="news.category" class="text-slate-500">/</span>
      <span class="text-slate-200 font-semibold truncate">{{ news.title }}</span>
    </nav>

    <!-- WIDGET KERNEL WATCHER & CVE ALERT BANNER CONDICIONALES -->
    <div class="max-w-5xl mx-auto w-full px-4 space-y-2 mt-4">
      <CveAlertBanner v-if="platform.features.cveAlerts || isNews" />
      <KernelWatcherWidget v-if="platform.features.kernelWatcher || isNews" />
    </div>

    <!-- BANNER PUBLICITARIO TOP LEADERBOARD -->
    <div class="max-w-5xl mx-auto w-full px-4 mt-4">
      <AdSlot type="header-leaderboard" slot-id="1000000001" />
    </div>

    <!-- CONTENIDO PRINCIPAL: LECTURA CONTINUA -->
    <main class="max-w-4xl mx-auto w-full px-4 py-8 flex-1 space-y-8">
      
      <!-- CABECERA PERIODÍSTICA -->
      <header class="space-y-4">
        <!-- Badge row -->
        <div class="flex flex-wrap items-center gap-3 text-xs">
          <span
            class="px-2.5 py-1 rounded font-bold uppercase tracking-wider border"
            :class="news.category?.slug === 'kernel'
              ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'"
          >
            {{ news.category?.name || 'Actualidad' }}
          </span>

          <span class="text-slate-500">•</span>
          <span class="text-slate-300 font-medium flex items-center gap-1">
            <Icon name="lucide:clock" class="w-3.5 h-3.5 text-orange-400" />
            Lectura rápida: {{ (news.metadata as any)?.reading_time_minutes || 3 }} minutos
          </span>

          <span class="text-slate-500">•</span>
          <span class="text-slate-300 font-medium">
            📅 {{ formattedDate }}
          </span>
        </div>

        <!-- Titular H1 -->
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight font-heading">
          {{ news.title }}
        </h1>

        <!-- Entradilla / Subtítulo -->
        <p class="text-lg sm:text-xl text-slate-300 leading-relaxed font-normal">
          {{ news.excerpt }}
        </p>

        <!-- Firma de Autor -->
        <div class="flex items-center gap-3 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-orange-600 to-amber-700 flex items-center justify-center font-bold text-white text-xs shadow-inner">
            R
          </div>
          <div>
            Por
            <a
              href="https://raupulus.dev"
              target="_blank"
              rel="noopener noreferrer"
              class="text-white font-semibold hover:underline"
            >
              Raúl Caro Pastorino (@raupulus)
            </a>
            · Redacción News · Contacto: <code class="text-slate-200 font-mono">public@laguialinux.com</code>
          </div>
        </div>
      </header>

      <!-- IMAGEN PRINCIPAL DE LA NOTICIA CON PIE DE FOTO (CAPTION) -->
      <div v-if="news.image?.url" class="rounded-2xl overflow-hidden border border-slate-800 bg-[#0f172a] shadow-xl">
        <div class="relative aspect-video sm:aspect-[21/9] w-full bg-slate-950 overflow-hidden">
          <img
            :src="news.image.url"
            :alt="news.title"
            class="w-full h-full object-cover object-center"
            loading="eager"
          />
        </div>
        <div
          v-if="(news.image as any).caption || (news.image as any).credits"
          class="px-4 py-2.5 bg-[#080c14]/90 text-xs text-slate-400 border-t border-slate-800 flex items-center justify-between gap-2"
        >
          <div class="flex items-center gap-2">
            <Icon name="lucide:info" class="w-4 h-4 text-orange-400 shrink-0" />
            <span>{{ (news.image as any).caption }}</span>
          </div>
          <span v-if="(news.image as any).credits" class="text-[11px] font-mono text-slate-500">
            Foto: {{ (news.image as any).credits }}
          </span>
        </div>
      </div>

      <!-- CUERPO DE LECTURA CONTINUA (SIN PAGINAR SECCIONES) -->
      <article class="prose prose-invert max-w-none text-slate-300 space-y-6 text-base leading-relaxed pt-2">
        <template v-for="(sec, idx) in sections" :key="sec.id">
          <!-- Si es la sección 2 o posterior, anteponer título H2 -->
          <h2
            v-if="idx > 0 && sec.title"
            class="text-2xl font-bold text-white tracking-tight border-b border-slate-800 pb-2 font-heading mt-8"
          >
            {{ sec.title }}
          </h2>

          <!-- Contenido estructurado de la sección (Editor.js / HTML) -->
          <ContentRenderer :content="(sec as any).body || ''" />

          <!-- Publicidad In-Article tras la primera sección -->
          <div v-if="idx === 0" class="my-8 not-prose">
            <AdSlot type="in-article-banner" slot-id="1000000004" />
          </div>
        </template>
      </article>

      <!-- FICHA DESTACADA DE FUENTES ORIGINALES ("Fuente Original") -->
      <section
        v-if="sourcesList.length > 0"
        class="bg-[#0f172a] border-l-4 border-orange-500 border border-slate-800 rounded-2xl p-6 mt-8 shadow-sm"
      >
        <h3 class="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2 font-heading">
          <Icon name="lucide:external-link" class="w-4 h-4 text-orange-400" />
          Fuentes Oficiales y Referencias de la Noticia
        </h3>
        <ul class="space-y-2 text-xs">
          <li v-for="(source, i) in sourcesList" :key="i">
            <a
              :href="source.url"
              target="_blank"
              rel="noopener noreferrer nofollow"
              class="text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1.5 font-mono"
            >
              <span>↗</span>
              <span>{{ source.title }}</span>
            </a>
          </li>
        </ul>
      </section>

      <!-- ANCLA DISCRETA A HERRAMIENTAS SYSADMIN (MOD-17) -->
      <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2 text-slate-300">
          <span class="text-base">🛠️</span>
          <span>
            ¿Necesitas calcular permisos chmod, programar un cron o verificar equivalencias?
          </span>
        </div>
        <NuxtLink
          to="/herramientas"
          class="shrink-0 px-3.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-slate-950 font-bold font-mono transition-colors border border-emerald-500/30 cursor-pointer"
        >
          Suite de Herramientas Sysadmin →
        </NuxtLink>
      </div>

      <!-- BARRA PARA COMPARTIR NOTICIA -->
      <div class="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-400">
          Compartir esta noticia:
        </span>
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="copyShareLink"
            class="px-3 py-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white text-xs font-bold transition-colors border border-orange-500/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Icon name="lucide:link" class="w-3.5 h-3.5" />
            <span>{{ copyShareFeedback ? '¡Enlace copiado!' : 'Copiar enlace' }}</span>
          </button>
        </div>
      </div>

      <!-- NOTICIAS RELACIONADAS -->
      <section v-if="relatedNews.length > 0" class="pt-8 border-t border-slate-800">
        <h2 class="text-lg font-bold text-white font-heading mb-4 flex items-center gap-2">
          <span>📰</span> Más Noticias de Actualidad
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NuxtLink
            v-for="rel in relatedNews"
            :key="rel.id"
            :to="`/noticia/${rel.slug}`"
            class="bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-2xl p-4 transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <span class="text-[10px] font-mono uppercase font-bold text-orange-400">
                {{ rel.categoryName }}
              </span>
              <h3 class="text-sm font-bold text-white group-hover:text-orange-400 transition-colors mt-1 line-clamp-2">
                {{ rel.title }}
              </h3>
              <p class="text-xs text-slate-300 mt-2 line-clamp-2">{{ rel.excerpt }}</p>
            </div>
            <div class="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Leer noticia</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- ANUNCIO MULTIPLEX DE CIERRE -->
      <div class="my-8">
        <AdSlot type="ad-multiplex" slot-id="1000000005" />
      </div>

    </main>
  </div>
</template>
