<script setup lang="ts">
/**
 * pages/guia/[slug]/index.vue
 * Ficha Técnica y Portada Resumen de Guía (MOD-10)
 * La Guía Linux — Ecosistema laguialinux.com
 * Licencia: GNU AGPLv3
 * Autor: Raúl Caro Pastorino (https://raupulus.dev)
 */

import type { ContentDetailResource, ContentResource } from '~/types'
import { SAMPLE_GUIDES } from '~/utils/sampleContentsData'

const route = useRoute()
const router = useRouter()
const { platform, isGuides, isNews } = usePlatform()
const api = useApiClient()

// 1. Identificación reactiva del Slug de la Guía
const guideSlug = computed(() => {
  try {
    return decodeURIComponent(String(route.params.slug || ''))
  } catch {
    return String(route.params.slug || '')
  }
})

// 2. Consulta a API V2 con Fallback a Datos Locales (String Key para Nuxt 4)
const { data: guideData, status, error } = await useAsyncData(
  `guide-detail-${platform.value.slug}-${guideSlug.value}`,
  async () => {
    try {
      const res = await api.getContentBySlug(guideSlug.value, {
        include: 'pages,taxonomies,seo,related',
        format: 'html',
      })
      if (res?.data) return res.data
    } catch {
      // Degradar limpiamente al dataset de muestra si la API no está disponible
    }

    const local = SAMPLE_GUIDES.find(
      g => g.slug === guideSlug.value || String(g.id) === guideSlug.value
    )
    if (local) {
      // Simular estructura ContentDetailResource completa con páginas/pasos
      const simulatedSteps = local.pages || [
        {
          id: local.id * 100 + 1,
          order: 1,
          title: `Paso 1: Diagnóstico inicial y requisitos para ${local.title}`,
          slug: 'paso-1-diagnostico',
          body: '<p>Antes de comenzar, verificamos los requisitos previos y el entorno de ejecución en el sistema.</p>',
        },
        {
          id: local.id * 100 + 2,
          order: 2,
          title: 'Paso 2: Ejecución práctica y configuración técnica',
          slug: 'paso-2-configuracion',
          body: '<p>Procedemos a la configuración en terminal aplicando las directivas recomendadas.</p>',
        },
        {
          id: local.id * 100 + 3,
          order: 3,
          title: 'Paso 3: Verificación del servicio y pruebas de estrés',
          slug: 'paso-3-verificacion',
          body: '<p>Validamos que el servicio y las directivas se ejecutan con normalidad y persisten tras el reinicio.</p>',
        },
      ]

      return {
        ...local,
        pages_count: simulatedSteps.length,
        pages: simulatedSteps,
        first_page: null,
        metadata: {
          reading_time_minutes: parseInt(local.readingTime) || 8,
          difficulty: 'Intermedio',
          distros_tested: ['Debian 12', 'Ubuntu 24.04 LTS'],
          youtube_video_id: 'dQw4w9WgXcQ',
          github_repo: 'https://gitlab.com/raupulus/linux-sysadmin-scripts',
          prerequisites: [
            'Acceso root o privilegios configurados mediante sudo',
            'Terminal Linux con entorno Bash o Zsh',
            'Copia de seguridad previa de los ficheros de configuración',
          ],
          files: [
            {
              id: 1,
              filename: `${local.slug.slice(0, 16)}_installer.sh`,
              mime_type: 'text/x-shellscript',
              size_human: '3.4 KB',
              download_url: '#',
            },
          ],
        },
      } as unknown as ContentDetailResource
    }

    throw createError({
      statusCode: 404,
      statusMessage: `Guía "${guideSlug.value}" no encontrada en ${platform.value.name}`,
      fatal: true,
    })
  },
  {
    watch: [guideSlug],
  }
)

// Interceptar slug inexistente en render inicial SSR
if (error.value || !guideData.value) {
  throw createError({
    statusCode: 404,
    statusMessage: `Guía "${guideSlug.value}" no encontrada en ${platform.value.name}`,
    fatal: true,
  })
}

// Observador reactivo para interceptar navegaciones del cliente con errores
watch(error, (err) => {
  if (err) {
    showError({
      statusCode: 404,
      statusMessage: `Guía "${guideSlug.value}" no encontrada en ${platform.value.name}`,
      fatal: false,
    })
  }
})

const guide = computed(() => guideData.value)

// 3. URLs y Navegación de Pasos
const firstStepSlug = computed(() => {
  if (guide.value?.pages && guide.value.pages.length > 0) {
    return guide.value.pages[0].slug || String(guide.value.pages[0].order)
  }
  return '1'
})

const startGuideUrl = computed(() => `/guia/${guideSlug.value}/${firstStepSlug.value}`)

// 4. Badges Dinámicos y Tokens de Color
const isOrangeTheme = computed(() => platform.value.themeAccent === 'orange' || isNews.value)

const difficultyColorClass = computed(() => {
  const diff = (guide.value?.metadata as any)?.difficulty || 'Intermedio'
  if (diff === 'Principiante') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  if (diff === 'Avanzado') return 'bg-red-500/20 text-red-400 border-red-500/30'
  return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
})

// 5. Reproductor YouTube Lite Facade (Carga Diferida)
const isVideoPlaying = ref(false)
const playVideo = () => {
  isVideoPlaying.value = true
}

// 6. Guías Relacionadas
const relatedGuides = computed<ContentResource[]>(() => {
  if (guide.value?.related && guide.value.related.length > 0) {
    return guide.value.related.slice(0, 3)
  }
  return SAMPLE_GUIDES.filter(g => g.slug !== guideSlug.value).slice(0, 3)
})

// 7. SEO y Marcado Estructurado TechArticle con useSeoEngine
useSeoEngine(() => ({
  title: guide.value?.title || 'Guía Técnica',
  description: guide.value?.excerpt || guide.value?.seo_description || 'Tutorial técnico en La Guía Linux',
  imageUrl: guide.value?.image?.url || '/assets/img/covers/cover_guias.webp',
  imageAlt: guide.value?.title,
  type: 'article',
  publishedAt: guide.value?.published_at,
  modifiedAt: guide.value?.updated_at || guide.value?.published_at,
  schemaType: 'TechArticle',
  breadcrumbs: [
    { name: 'Inicio', url: `https://${platform.value.domain}/` },
    ...(guide.value?.category ? [{ name: guide.value.category.name, url: `https://${platform.value.domain}/categoria/${guide.value.category.slug}` }] : []),
    { name: guide.value?.title || 'Guía', url: `https://${platform.value.domain}/guia/${guideSlug.value}` },
  ],
  techMeta: {
    difficulty: guide.value?.metadata?.difficulty || 'Intermediate',
    prerequisites: guide.value?.metadata?.prerequisites || [],
    testedDistros: guide.value?.metadata?.testedDistros || ['Debian 12', 'Ubuntu 24.04', 'Arch Linux'],
    readingTimeMinutes: parseInt(guide.value?.readingTime || '5') || 5,
  },
}))
</script>

<template>
  <div v-if="guide" class="min-h-screen flex flex-col">
    <!-- 1. BREADCRUMBS -->
    <nav class="max-w-5xl mx-auto w-full px-4 pt-6 text-xs text-slate-300 font-mono flex items-center gap-2" aria-label="Migas de pan">
      <NuxtLink to="/" class="text-slate-400 hover:text-emerald-400 transition-colors">Inicio</NuxtLink>
      <span class="text-slate-500">/</span>
      <NuxtLink
        v-if="guide.category"
        :to="`/categoria/${guide.category.slug}`"
        class="text-slate-400 hover:text-emerald-400 transition-colors"
      >
        {{ guide.category.name }}
      </NuxtLink>
      <span v-if="guide.category" class="text-slate-500">/</span>
      <span class="text-slate-200 font-semibold truncate">{{ guide.title }}</span>
    </nav>

    <!-- 2. CONTENIDO PRINCIPAL: RESUMEN Y FICHA -->
    <main class="max-w-5xl mx-auto w-full px-4 py-6 flex-1 space-y-8">
      
      <!-- CABECERA HÉROE TÉCNICA CON EFECTO BLUR -->
      <header class="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl">
        <!-- Blur Backdrop Image -->
        <div
          v-if="guide.image?.url"
          class="absolute inset-0 bg-cover bg-center opacity-10 filter blur-2xl scale-125 pointer-events-none"
          :style="{ backgroundImage: `url(${guide.image.url})` }"
        ></div>

        <div class="relative z-10 space-y-4">
          <!-- Badges & Metadata Pill Row -->
          <div class="flex flex-wrap items-center gap-2.5 text-xs font-mono">
            <span
              class="px-3 py-1 rounded-full font-bold border"
              :class="isOrangeTheme
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'"
            >
              Guía Técnica
            </span>

            <span
              v-if="(guide.metadata as any)?.difficulty"
              class="px-3 py-1 rounded-full font-bold border"
              :class="difficultyColorClass"
            >
              {{ (guide.metadata as any).difficulty }}
            </span>

            <span class="text-slate-500">•</span>
            <span class="text-slate-300 flex items-center gap-1">
              <Icon name="lucide:clock" class="w-3.5 h-3.5" />
              {{ (guide.metadata as any)?.reading_time_minutes || 8 }} min lectura
            </span>

            <span class="text-slate-500">•</span>
            <span class="text-slate-300 flex items-center gap-1">
              <Icon name="lucide:layers" class="w-3.5 h-3.5" />
              {{ guide.pages?.length || 1 }} Pasos
            </span>

            <span class="text-slate-500">•</span>
            <span class="text-slate-400">
              📅 Actualizado: {{ new Date(guide.updated_at || guide.published_at).getFullYear() }}
            </span>
          </div>

          <!-- Distribuciones Testeadas -->
          <div
            v-if="(guide.metadata as any)?.distros_tested?.length"
            class="flex flex-wrap items-center gap-2 pt-1"
          >
            <span class="text-xs font-mono text-slate-400">Testado en:</span>
            <span
              v-for="distro in (guide.metadata as any).distros_tested"
              :key="distro"
              class="px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700/80 text-[11px] font-mono text-slate-300 font-semibold"
            >
              🐧 {{ distro }}
            </span>
          </div>

          <!-- Título H1 -->
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight pt-1 font-heading">
            {{ guide.title }}
          </h1>

          <!-- Extracto Técnico -->
          <p class="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl">
            {{ guide.excerpt }}
          </p>

          <!-- Autor Oficial Raúl Caro Pastorino -->
          <div class="flex items-center gap-3 pt-2 text-xs text-slate-400">
            <div class="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white border border-slate-700">
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
              · Contacto: <code class="text-slate-300">public@laguialinux.com</code>
            </div>
          </div>

          <!-- Botones de Acción Primaria -->
          <div class="flex flex-wrap items-center gap-4 pt-4">
            <NuxtLink
              :to="startGuideUrl"
              class="inline-flex items-center gap-2 px-6 py-3.5 font-bold rounded-xl text-sm font-mono tracking-wider transition-all transform hover:-translate-y-0.5 shadow-lg cursor-pointer"
              :class="isOrangeTheme
                ? 'bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-orange-500/25'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'"
            >
              <span>Comenzar Guía (Paso 1)</span>
              <Icon name="lucide:arrow-right" class="w-4 h-4" />
            </NuxtLink>

            <a
              href="#indice"
              class="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold border border-slate-700 transition-colors"
            >
              Ver Índice de Pasos ↓
            </a>
          </div>
        </div>
      </header>

      <!-- 3. CAJA DE REQUISITOS PREVIOS Y ADVERTENCIAS -->
      <section
        v-if="(guide.metadata as any)?.prerequisites?.length"
        class="bg-slate-950 border-l-4 border-amber-500 border border-slate-800 rounded-2xl p-6 shadow-sm"
      >
        <div class="flex items-center gap-2.5 mb-3">
          <Icon name="lucide:shield-alert" class="w-5 h-5 text-amber-400" />
          <h2 class="text-base font-bold text-white font-heading">
            Requisitos Previos y Advertencias
          </h2>
        </div>
        <ul class="space-y-2 text-xs sm:text-sm text-slate-300 list-disc list-inside">
          <li v-for="(req, i) in (guide.metadata as any).prerequisites" :key="i">
            {{ req }}
          </li>
        </ul>
      </section>

      <!-- 4. REPRODUCTOR YOUTUBE LITE FACADE (SI EXISTE VÍDEO) -->
      <section
        v-if="(guide.metadata as any)?.youtube_video_id"
        class="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-md"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-white flex items-center gap-2 font-mono">
            <span class="text-red-500">▶</span> Vídeo Complementario Explicativo
          </h2>
          <span class="text-xs text-slate-500 font-mono">YouTube</span>
        </div>

        <div class="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative group">
          <template v-if="!isVideoPlaying">
            <img
              :src="`https://i.ytimg.com/vi_webp/${(guide.metadata as any).youtube_video_id}/maxresdefault.webp`"
              alt="Miniatura del vídeo de la guía"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <button
              type="button"
              @click="playVideo"
              class="absolute inset-0 m-auto w-16 h-16 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center text-2xl shadow-xl hover:scale-110 transition-transform cursor-pointer"
              aria-label="Reproducir vídeo"
            >
              ▶
            </button>
          </template>
          <iframe
            v-else
            :src="`https://www.youtube-nocookie.com/embed/${(guide.metadata as any).youtube_video_id}?autoplay=1`"
            class="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </section>

      <!-- 5. FICHEROS DESCARGABLES Y RECURSOS -->
      <section
        v-if="(guide.metadata as any)?.files?.length || (guide.metadata as any)?.github_repo"
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div
          v-for="file in (guide.metadata as any)?.files || []"
          :key="file.id"
          class="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex items-start justify-between"
        >
          <div>
            <span class="text-xs font-mono uppercase font-bold text-emerald-400">
              Script Descargable
            </span>
            <h3 class="text-sm font-bold text-white mt-1">{{ file.filename }}</h3>
            <p class="text-xs text-slate-400 mt-1">Script verificado para ejecución en terminal.</p>
          </div>
          <a
            :href="file.download_url"
            download
            class="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-mono text-slate-200 transition-colors whitespace-nowrap ml-3"
          >
            Descargar ({{ file.size_human }}) ↓
          </a>
        </div>

        <div
          v-if="(guide.metadata as any)?.github_repo"
          class="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex items-start justify-between"
        >
          <div>
            <span class="text-xs font-mono text-cyan-400 uppercase font-bold">
              Repositorio de Código
            </span>
            <h3 class="text-sm font-bold text-white mt-1">GitLab / GitHub Oficial</h3>
            <p class="text-xs text-slate-400 mt-1">Scripts, configuraciones e historial de cambios.</p>
          </div>
          <a
            :href="(guide.metadata as any).github_repo"
            target="_blank"
            rel="noopener noreferrer"
            class="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-mono text-slate-200 transition-colors whitespace-nowrap ml-3"
          >
            Ver Código ↗
          </a>
        </div>
      </section>

      <!-- 6. ÍNDICE INTERACTIVO DE PASOS DE LA GUÍA -->
      <section id="indice" class="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 class="text-xl font-bold text-white tracking-tight flex items-center gap-2 font-heading">
              <span>📑</span> Índice y Secciones de la Guía
            </h2>
            <p class="text-xs text-slate-400 mt-1">
              Sigue el orden recomendado para asegurar la correcta ejecución del procedimiento.
            </p>
          </div>
          <span
            class="text-xs font-mono px-2.5 py-1 rounded border"
            :class="isOrangeTheme
              ? 'text-orange-400 bg-orange-500/10 border-orange-500/20'
              : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'"
          >
            {{ guide.pages?.length || 1 }} Pasos
          </span>
        </div>

        <div class="space-y-4">
          <NuxtLink
            v-for="(page, idx) in guide.pages || []"
            :key="page.id"
            :to="`/guia/${guideSlug}/${page.slug || page.order}`"
            class="flex items-start gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 transition-all group"
          >
            <div
              class="w-8 h-8 rounded-lg font-bold font-mono text-sm flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
              :class="idx === 0
                ? (isOrangeTheme ? 'bg-orange-600 text-slate-950' : 'bg-emerald-600 text-slate-950')
                : 'bg-slate-800 text-slate-300'"
            >
              {{ String(idx + 1).padStart(2, '0') }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <h3 class="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {{ page.title }}
                </h3>
              </div>
              <p class="text-xs text-slate-400 mt-1">
                Fase {{ idx + 1 }}: Haz clic para acceder a las instrucciones y comandos detallados.
              </p>
            </div>
            <span class="text-slate-600 group-hover:text-emerald-400 transition-colors text-lg">→</span>
          </NuxtLink>
        </div>

        <!-- Botón inferior para iniciar -->
        <div class="mt-8 pt-6 border-t border-slate-800 flex justify-end">
          <NuxtLink
            :to="startGuideUrl"
            class="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
            :class="isOrangeTheme
              ? 'bg-orange-600 hover:bg-orange-500 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'"
          >
            <span>Comenzar Paso 1: {{ guide.pages?.[0]?.title || 'Inicio' }}</span>
            <Icon name="lucide:arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>
      </section>

      <!-- 7. ANUNCIO ADSENSE IN-ARTICLE ANTI-CLS -->
      <AdSlot type="in-article-banner" slot-id="1000000004" />

      <!-- 8. GUÍAS RELACIONADAS -->
      <section v-if="relatedGuides.length > 0" class="pt-6">
        <h2 class="text-lg font-bold text-white font-heading mb-4 flex items-center gap-2">
          <span>📚</span> Guías y Tutoriales Relacionados
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NuxtLink
            v-for="rel in relatedGuides"
            :key="rel.id"
            :to="`/guia/${rel.slug}`"
            class="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all group flex flex-col justify-between"
          >
            <div>
              <span class="text-[10px] font-mono uppercase font-bold text-slate-500">Guía Relacionada</span>
              <h3 class="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors mt-1 line-clamp-2">
                {{ rel.title }}
              </h3>
              <p class="text-xs text-slate-400 mt-2 line-clamp-2">{{ rel.excerpt }}</p>
            </div>
            <div class="pt-3 mt-3 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Leer guía</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>
