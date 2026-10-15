<script setup lang="ts">
/**
 * pages/guia/[slug]/[page].vue
 * Lector Secuencial Multipágina de Guías con Navegación Cuádruple (MOD-11)
 * La Guía Linux — Ecosistema laguialinux.com
 * Licencia: GNU AGPLv3
 * Autor: Raúl Caro Pastorino (https://raupulus.dev)
 */

import type { ContentDetailResource, ContentPageResource } from '~/types'
import { SAMPLE_GUIDES } from '~/utils/sampleContentsData'
import {
  formatCommand,
  isDestructiveCommand,
  type CopyMode,
  type DestructiveCheckResult,
} from '~/utils/terminalGuard'
import { extractCommandsFromContent } from '~/utils/contentParser'
import DestructiveWarningModal from '~/components/DestructiveWarningModal.vue'
import ContentRenderer from '~/components/ContentRenderer.vue'

const route = useRoute()
const router = useRouter()
const { platform, isNews } = usePlatform()
const api = useApiClient()

// 1. Slugs reactivos de la Guía y del Paso
const guideSlug = computed(() => {
  try {
    return decodeURIComponent(String(route.params.slug || ''))
  } catch {
    return String(route.params.slug || '')
  }
})

const stepParam = computed(() => {
  try {
    return decodeURIComponent(String(route.params.page || ''))
  } catch {
    return String(route.params.page || '')
  }
})

// 2. Consulta de la Guía y del Paso Activo
const { data: readerData, error } = await useAsyncData(
  `guide-reader-${platform.value.slug}-${guideSlug.value}-${stepParam.value}`,
  async () => {
    let guideRes: ContentDetailResource | null = null
    try {
      const res = await api.getContentBySlug(guideSlug.value, {
        include: 'pages,taxonomies,seo',
        format: 'editorjs',
      })
      if (res?.data) guideRes = res.data
    } catch {
      // Ignorar para recurrir al fallback
    }

    // Fallback con datos de muestra
    if (!guideRes) {
      const local = SAMPLE_GUIDES.find(
        g => g.slug === guideSlug.value || String(g.id) === guideSlug.value
      )
      if (local) {
        guideRes = {
          ...local,
          pages_count: local.pages?.length || 3,
          pages: local.pages || [
            {
              id: 1,
              order: 1,
              title: 'Identificación certera de unidades de disco (lsblk y fdisk)',
              slug: 'identificacion-unidades',
              format: 'html',
            },
            {
              id: 2,
              order: 2,
              title: 'Ejecución del Zero-Filling con el comando dd',
              slug: 'zero-filling-dd',
              format: 'html',
            },
            {
              id: 3,
              order: 3,
              title: 'Verificación de bloques con Badblocks y particionado',
              slug: 'verificacion-badblocks',
              format: 'html',
            },
          ],
          first_page: null,
        } as unknown as ContentDetailResource
      }
    }

    if (!guideRes) {
      throw createError({
        statusCode: 404,
        statusMessage: `Guía "${guideSlug.value}" no encontrada`,
        fatal: true,
      })
    }

    // Resolver el paso activo
    const pages = guideRes.pages || []
    let stepIndex = pages.findIndex(
      p => p.slug === stepParam.value || String(p.order) === stepParam.value
    )
    if (stepIndex === -1) {
      // Si el parámetro es numérico (ej. /1, /2)
      const num = parseInt(stepParam.value, 10)
      if (!isNaN(num) && num >= 1 && num <= pages.length) {
        stepIndex = num - 1
      } else {
        stepIndex = 0
      }
    }

    const currentStepSummary = pages[stepIndex]

    // Intentar obtener el contenido completo del paso vía API (formato estructurado Editor.js)
    let stepBody: any = null
    try {
      const pageRes = await api.getContentPage(guideSlug.value, currentStepSummary.slug || currentStepSummary.order, {
        format: 'editorjs',
      })
      if (pageRes?.data?.body) {
        stepBody = pageRes.data.body
      }
    } catch {
      // Fallback de contenido enriquecido para contingencia offline
    }

    if (!stepBody) {
      if ((currentStepSummary as any).body) {
        stepBody = (currentStepSummary as any).body
      } else if (stepIndex === 0) {
        stepBody = {
          time: Date.now(),
          blocks: [
            {
              id: 'p1',
              type: 'paragraph',
              data: {
                text: 'Antes de aplicar cualquier modificación a los discos o almacenamiento del sistema, debemos inspeccionar los identificadores asignados por el kernel:',
              },
            },
            {
              id: 'c1',
              type: 'code',
              data: {
                code: '$ lsblk -o NAME,SIZE,FSTYPE,TYPE,MOUNTPOINTS\n$ sudo fdisk -l',
                language: 'bash',
                showlinenumbers: true,
              },
            },
            {
              id: 'p2',
              type: 'paragraph',
              data: {
                text: 'Verifica cuidadosamente el identificador de la unidad (por ejemplo <code>/dev/sdb</code>) para no alterar el disco raíz del sistema operativo.',
              },
            },
          ],
          version: '2.31.7',
        }
      } else if (stepIndex === 1) {
        stepBody = {
          time: Date.now(),
          blocks: [
            {
              id: 'p1',
              type: 'paragraph',
              data: {
                text: 'El comando <code>dd</code> permite escribir directamente bloques nulos procedentes de <code>/dev/zero</code> sobre toda la superficie del disco destino:',
              },
            },
            {
              id: 'c1',
              type: 'code',
              data: {
                code: '# sudo dd if=/dev/zero of=/dev/sdX bs=4M status=progress conv=fdatasync',
                language: 'bash',
                showlinenumbers: false,
              },
            },
            {
              id: 'p2',
              type: 'paragraph',
              data: {
                text: 'El argumento <code>bs=4M</code> optimiza la tasa de transferencia, mientras que <code>conv=fdatasync</code> asegura que la caché se vacíe físicamente al disco antes de concluir.',
              },
            },
          ],
          version: '2.31.7',
        }
      } else {
        stepBody = {
          time: Date.now(),
          blocks: [
            {
              id: 'p1',
              type: 'paragraph',
              data: {
                text: 'Una vez completado el relleno de ceros, comprobamos que no existan sectores defectuosos con <code>badblocks</code>:',
              },
            },
            {
              id: 'c1',
              type: 'code',
              data: {
                code: '# sudo badblocks -sv -b 4096 /dev/sdX',
                language: 'bash',
                showlinenumbers: false,
              },
            },
            {
              id: 'p2',
              type: 'paragraph',
              data: {
                text: 'Si el escaneo devuelve cero errores, puedes crear una nueva tabla de particiones GPT limpia mediante <code>gdisk</code> o <code>parted</code>.',
              },
            },
          ],
          version: '2.31.7',
        }
      }
    }

    return {
      guide: guideRes,
      pages,
      stepIndex,
      currentStep: currentStepSummary,
      stepBody,
    }
  },
  {
    watch: [guideSlug, stepParam],
  }
)

if (error.value || !readerData.value?.guide) {
  throw createError({
    statusCode: 404,
    statusMessage: `Guía "${guideSlug.value}" no encontrada`,
    fatal: true,
  })
}

watch(error, (err) => {
  if (err) {
    showError({
      statusCode: 404,
      statusMessage: `Guía "${guideSlug.value}" no encontrada`,
      fatal: false,
    })
  }
})

const guide = computed(() => readerData.value?.guide)
const pages = computed(() => readerData.value?.pages || [])
const currentIndex = computed(() => readerData.value?.stepIndex || 0)
const currentStep = computed(() => readerData.value?.currentStep)
const stepBody = computed(() => readerData.value?.stepBody || '')

const totalPages = computed(() => pages.value.length || 1)
const currentStepNumber = computed(() => currentIndex.value + 1)
const progressPercent = computed(() => Math.round((currentStepNumber.value / totalPages.value) * 100))

const isFirstStep = computed(() => currentIndex.value === 0)
const isLastStep = computed(() => currentIndex.value === totalPages.value - 1)

const prevStep = computed(() => (currentIndex.value > 0 ? pages.value[currentIndex.value - 1] : null))
const nextStep = computed(() => (currentIndex.value < totalPages.value - 1 ? pages.value[currentIndex.value + 1] : null))

const getStepUrl = (p: { slug?: string; order: number }) => `/guia/${guideSlug.value}/${p.slug || p.order}`
const prevUrl = computed(() => (prevStep.value ? getStepUrl(prevStep.value) : `/guia/${guideSlug.value}`))
const nextUrl = computed(() => (nextStep.value ? getStepUrl(nextStep.value) : null))

// 3. Navegación por Teclado (Flechas ← y →)
const handleKeydown = (e: KeyboardEvent) => {
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target as HTMLElement)?.isContentEditable) {
    return
  }
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
    return
  }
  if (e.key === 'ArrowLeft' && prevUrl.value) {
    router.push(prevUrl.value)
  } else if (e.key === 'ArrowRight' && nextUrl.value) {
    router.push(nextUrl.value)
  }
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', handleKeydown)
  }
})

// Scroll automático a la cabecera al cambiar de paso
watch(
  () => route.params.page,
  () => {
    if (import.meta.client) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
)

// 4. Selector Compacto Móvil
const onMobileStepSelect = (e: Event) => {
  const target = e.target as HTMLSelectElement
  if (target?.value) {
    router.push(target.value)
  }
}

// 5. Motor de Copia Inteligente y Modal Destructivo (MOD-12)
const pendingCopyCmd = ref('')
const showSafetyModal = ref(false)
const copyFeedbackText = ref('Copiar comandos')

// Extraer EXCLUSIVAMENTE los comandos del paso (sin párrafos ni textos explicativos)
const stepCommandsText = computed(() => extractCommandsFromContent(stepBody.value))
const hasCommandsInStep = computed(() => Boolean(stepCommandsText.value && stepCommandsText.value.trim().length > 0))
const destructiveCheck = computed(() => isDestructiveCommand(stepCommandsText.value))

const executeSmartCopy = (mode: CopyMode = 'clean') => {
  if (!hasCommandsInStep.value) {
    copyFeedbackText.value = 'Sin comandos'
    setTimeout(() => { copyFeedbackText.value = 'Copiar comandos' }, 2000)
    return
  }

  const formatted = formatCommand(stepCommandsText.value, mode)
  const check = isDestructiveCommand(formatted)

  if (check.isDestructive) {
    pendingCopyCmd.value = formatted
    showSafetyModal.value = true
  } else {
    performClipboardCopy(formatted)
  }
}

const performClipboardCopy = (text: string) => {
  if (import.meta.client) {
    navigator.clipboard.writeText(text).then(() => {
      copyFeedbackText.value = '¡Copiado limpio!'
      setTimeout(() => { copyFeedbackText.value = 'Copiar comando' }, 2500)
    }).catch(() => {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      copyFeedbackText.value = '¡Copiado limpio!'
      setTimeout(() => { copyFeedbackText.value = 'Copiar comando' }, 2500)
    })
  }
}

const confirmDestructiveCopy = () => {
  if (pendingCopyCmd.value) {
    performClipboardCopy(pendingCopyCmd.value)
    showSafetyModal.value = false
    pendingCopyCmd.value = ''
  }
}

const closeSafetyModal = () => {
  showSafetyModal.value = false
  pendingCopyCmd.value = ''
}

// 6. Guías Relacionadas para Banner Final
const relatedGuides = computed(() => {
  return SAMPLE_GUIDES.filter(g => g.slug !== guideSlug.value).slice(0, 3)
})

// 7. SEO con useSeoEngine
useSeoEngine(() => ({
  title: `Paso ${currentStepNumber.value}: ${currentStep.value?.title || ''}`,
  description: `Paso ${currentStepNumber.value} de la guía técnica ${guide.value?.title}: ${currentStep.value?.title}`,
  imageUrl: guide.value?.image?.url || '/assets/img/covers/cover_guias.webp',
  type: 'article',
  publishedAt: guide.value?.published_at,
  modifiedAt: guide.value?.updated_at || guide.value?.published_at,
  schemaType: 'TechArticle',
  breadcrumbs: [
    { name: 'Inicio', url: `https://${platform.value.domain}/` },
    ...(guide.value?.category ? [{ name: guide.value.category.name, url: `https://${platform.value.domain}/categoria/${guide.value.category.slug}` }] : []),
    { name: guide.value?.title || 'Guía', url: `https://${platform.value.domain}/guia/${guideSlug.value}` },
    { name: `Paso ${currentStepNumber.value}`, url: `https://${platform.value.domain}/guia/${guideSlug.value}/${route.params.page}` },
  ],
}))
</script>

<template>
  <div v-if="guide" class="min-h-screen flex flex-col">
    
    <!-- 1. PESTAÑAS HORIZONTALES SUPERIORES (TOP TABS) -->
    <div class="bg-slate-950 border-b border-slate-800 px-4 py-2 sticky top-[57px] z-30 shadow-md">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
          <span class="text-slate-500 uppercase font-bold mr-1 hidden sm:inline">Pasos:</span>
          
          <NuxtLink
            v-for="(p, idx) in pages"
            :key="p.id"
            :to="getStepUrl(p)"
            class="px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer"
            :class="idx === currentIndex
              ? 'bg-emerald-600 text-white font-bold border border-emerald-500 shadow-sm'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'"
            :aria-current="idx === currentIndex ? 'step' : undefined"
          >
            <span :class="idx === currentIndex ? 'text-white font-bold' : 'text-slate-500 font-bold'">{{ idx + 1 }}.</span>
            <span>{{ p.title.replace(/^Paso \d+:\s*/, '') }}</span>
          </NuxtLink>
        </div>

        <div class="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 whitespace-nowrap hidden md:block">
          Paso {{ currentStepNumber }} de {{ totalPages }} ({{ progressPercent }}%)
        </div>
      </div>
    </div>

    <!-- SELECTOR RÁPIDO PARA DISPOSITIVOS MÓVILES -->
    <div class="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-2.5">
      <label for="mobile-step-select" class="block text-[11px] font-mono text-slate-400 mb-1">
        Ir rápidamente al paso:
      </label>
      <select
        id="mobile-step-select"
        :value="getStepUrl(currentStep || pages[0])"
        @change="onMobileStepSelect"
        class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
      >
        <option
          v-for="(p, idx) in pages"
          :key="p.id"
          :value="getStepUrl(p)"
        >
          Paso {{ idx + 1 }}: {{ p.title }}
        </option>
      </select>
    </div>

    <!-- BREADCRUMBS MIGA DE PAN -->
    <nav class="max-w-7xl mx-auto w-full px-4 lg:px-8 pt-6 pb-0 text-xs text-slate-300 font-mono flex items-center gap-2 flex-wrap" aria-label="Migas de pan">
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
      <NuxtLink
        :to="`/guia/${guideSlug}`"
        class="text-slate-400 hover:text-emerald-400 transition-colors truncate max-w-xs"
      >
        {{ guide.title }}
      </NuxtLink>
      <span class="text-slate-500">/</span>
      <span class="text-slate-200 font-semibold truncate">Paso {{ currentStepNumber }}</span>
    </nav>

    <!-- 2. LAYOUT PRINCIPAL: CONTENIDO (8 cols) + SIDEBAR STICKY (4 cols) -->
    <div class="max-w-7xl mx-auto w-full px-4 lg:px-8 py-8 flex-1">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- COLUMNA PRINCIPAL DE LECTURA -->
        <main class="lg:col-span-8 space-y-6 min-w-0">
          
          <!-- Encabezado del Paso -->
          <div>
            <div class="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
              <span class="text-emerald-400 font-bold">Paso {{ currentStepNumber }}</span>
              <span>•</span>
              <NuxtLink :to="`/guia/${guideSlug}`" class="hover:underline truncate max-w-xs">
                {{ guide.title }}
              </NuxtLink>
              <span>•</span>
              <span>Paso {{ currentStepNumber }} de {{ totalPages }}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-snug font-heading">
              {{ currentStep?.title }}
            </h1>
          </div>

          <!-- Alerta de Seguridad si es destructivo -->
          <div
            v-if="destructiveCheck.isDestructive"
            class="rounded-xl border-l-4 border-amber-500 bg-amber-950/20 p-4 border border-amber-500/30 shadow-md"
          >
            <div class="flex items-start gap-3">
              <div class="text-amber-400 text-xl font-bold">⚠️</div>
              <div class="text-xs text-amber-200 leading-relaxed">
                <strong class="font-bold text-amber-300 uppercase tracking-wide block mb-1">
                  Atención: Operación de Alto Riesgo
                </strong>
                {{ destructiveCheck.reason || 'Este paso contiene comandos que realizan modificaciones directas sobre el sistema o unidades de disco.' }} Revisa detalladamente los identificadores antes de ejecutarlos.
              </div>
            </div>
          </div>

          <!-- CUERPO TÉCNICO RENDERIZADO (Editor.js / Markdown / HTML enriquecido) -->
          <ContentRenderer :content="stepBody" />

          <!-- BOTÓN DE COPIADO INTELIGENTE INTEGRADO PARA BLOQUES CLI (Solo si hay comandos en el paso) -->
          <div
            v-if="hasCommandsInStep"
            class="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono shadow-md"
          >
            <span class="text-slate-400 flex items-center gap-1.5">
              <span>💻</span> Copiar comandos de este paso:
            </span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="executeSmartCopy('clean')"
                class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-all shadow cursor-pointer"
              >
                {{ copyFeedbackText }}
              </button>
              <button
                type="button"
                @click="executeSmartCopy('sudo')"
                class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Copiar con sudo añadido a cada línea"
              >
                + sudo
              </button>
            </div>
          </div>

          <!-- PESTAÑAS HORIZONTALES INFERIORES -->
          <div class="pt-6 border-t border-slate-800">
            <span class="text-xs text-slate-500 font-mono uppercase tracking-wider block mb-3 font-semibold">
              Saltar a otra fase del manual:
            </span>
            <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-mono">
              <NuxtLink
                v-for="(p, idx) in pages"
                :key="p.id"
                :to="getStepUrl(p)"
                class="px-3 py-1.5 rounded-lg whitespace-nowrap border cursor-pointer"
                :class="idx === currentIndex
                  ? 'bg-emerald-600 text-white font-bold border-emerald-500'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800'"
              >
                {{ idx + 1 }}. {{ p.title.replace(/^Paso \d+:\s*/, '') }}
              </NuxtLink>
            </div>
          </div>

          <!-- BOTONERA DE STEPPER ANTERIOR / SIGUIENTE -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <!-- Anterior -->
            <NuxtLink
              :to="prevUrl"
              class="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors group flex flex-col justify-between cursor-pointer"
            >
              <span class="text-[11px] font-mono text-slate-500 uppercase block mb-1 group-hover:text-emerald-400">
                ← {{ isFirstStep ? 'Ficha Resumen' : 'Paso Anterior' }}
              </span>
              <span class="text-sm font-bold text-white block">
                {{ isFirstStep ? 'Volver a la portada de la guía' : prevStep?.title }}
              </span>
            </NuxtLink>

            <!-- Siguiente -->
            <NuxtLink
              v-if="nextStep"
              :to="nextUrl!"
              class="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-right transition-colors group flex flex-col justify-between cursor-pointer"
            >
              <span class="text-[11px] font-mono text-emerald-400 uppercase block mb-1 font-bold">
                Paso Siguiente →
              </span>
              <span class="text-sm font-bold text-white block group-hover:text-emerald-300">
                {{ nextStep.title }}
              </span>
            </NuxtLink>

            <!-- Enlace al final de la guía si es el último paso -->
            <div
              v-else
              class="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-right flex flex-col justify-between"
            >
              <span class="text-[11px] font-mono text-emerald-400 uppercase block mb-1 font-bold">
                🎉 Último Paso Completado
              </span>
              <span class="text-sm font-bold text-emerald-300 block">
                Procedimiento finalizado con éxito
              </span>
            </div>
          </div>

          <!-- BANNER DE FINALIZACIÓN (RENDERIZADO EN EL ÚLTIMO PASO) -->
          <section
            v-if="isLastStep"
            class="bg-slate-950 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 mt-8 shadow-2xl space-y-4"
          >
            <div class="flex items-center gap-3 text-emerald-400">
              <span class="text-3xl">🎉</span>
              <div>
                <h2 class="text-xl font-bold text-white font-heading">
                  ¡Enhorabuena! Has completado todos los pasos
                </h2>
                <p class="text-xs text-slate-400 font-mono">
                  Has ejecutado con éxito las {{ totalPages }} fases de esta guía.
                </p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-3 pt-2">
              <NuxtLink
                :to="`/guia/${guideSlug}`"
                class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white transition-colors cursor-pointer"
              >
                ← Volver al Resumen de la Guía
              </NuxtLink>
              <NuxtLink
                to="/guias"
                class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs font-mono transition-colors cursor-pointer"
              >
                Explorar Más Guías Técnicas →
              </NuxtLink>
            </div>

            <!-- Guías recomendadas de cierre -->
            <div class="pt-4 border-t border-slate-800">
              <span class="text-xs font-mono uppercase text-slate-400 block mb-3 font-semibold">
                Continúa aprendiendo con estas lecturas recomendadas:
              </span>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <NuxtLink
                  v-for="rel in relatedGuides"
                  :key="rel.id"
                  :to="`/guia/${rel.slug}`"
                  class="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-white line-clamp-2"
                >
                  {{ rel.title }}
                </NuxtLink>
              </div>
            </div>
          </section>

          <!-- ANUNCIO MULTIPLEX DE CIERRE -->
          <div class="my-8">
            <AdSlot type="ad-multiplex" slot-id="1000000005" />
          </div>

        </main>

        <!-- BARRA LATERAL FIJA DESKTOP (STICKY SIDEBAR ≥ 1024px) -->
        <aside class="hidden lg:block lg:col-span-4">
          <div class="sticky top-24 space-y-6">
            
            <div class="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <!-- Enlace volver a la ficha general -->
              <NuxtLink
                :to="`/guia/${guideSlug}`"
                class="text-xs font-mono text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 mb-4 pb-3 border-b border-slate-800 cursor-pointer"
              >
                <Icon name="lucide:arrow-left" class="w-3.5 h-3.5" />
                <span>Volver a la ficha resumen</span>
              </NuxtLink>

              <div class="flex items-center justify-between mb-2">
                <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Progreso de la Guía
                </h3>
                <span class="text-xs text-emerald-400 font-mono font-bold">{{ progressPercent }}%</span>
              </div>

              <!-- Barra de progreso -->
              <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-6">
                <div
                  class="bg-emerald-500 h-full transition-all duration-500"
                  :style="{ width: `${progressPercent}%` }"
                ></div>
              </div>

              <!-- Lista vertical de pasos con check -->
              <ol class="space-y-3 text-xs font-mono">
                <li v-for="(p, idx) in pages" :key="p.id">
                  <NuxtLink
                    :to="getStepUrl(p)"
                    class="flex items-center gap-2.5 transition-colors p-1.5 rounded-lg cursor-pointer"
                    :class="idx === currentIndex
                      ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30'
                      : idx < currentIndex
                        ? 'text-slate-300 hover:text-white'
                        : 'text-slate-500 hover:text-slate-300'"
                  >
                    <span
                      class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0"
                      :class="idx === currentIndex
                        ? 'bg-emerald-500 text-slate-950'
                        : idx < currentIndex
                          ? 'bg-emerald-900/60 text-emerald-300'
                          : 'bg-slate-800 text-slate-500'"
                    >
                      {{ idx < currentIndex ? '✓' : idx + 1 }}
                    </span>
                    <span class="truncate">{{ p.title.replace(/^Paso \d+:\s*/, '') }}</span>
                  </NuxtLink>
                </li>
              </ol>
            </div>

            <!-- Anuncio Rascacielos Sidebar (300x600) -->
            <AdSlot type="sticky-skyscraper" slot-id="1000000002" :sticky="true" />

          </div>
        </aside>

      </div>
    </div>

    <!-- 3. MODAL DE ADVERTENCIA PARA COMANDOS DESTRUCTIVOS (MOD-12) -->
    <DestructiveWarningModal
      v-model="showSafetyModal"
      :command="pendingCopyCmd"
      :reason="destructiveCheck.reason"
      :risk-level="destructiveCheck.riskLevel"
      @confirm="confirmDestructiveCopy"
      @cancel="closeSafetyModal"
    />

  </div>
</template>
