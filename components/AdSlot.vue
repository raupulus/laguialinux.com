<script setup lang="ts">
/**
 * AdSlot.vue - Universal AdSense Component Anti-Cumulative Layout Shift (CLS)
 *
 * Módulo MOD-04: AdSense Anti-CLS Slot Engine
 * Licencia de código: GNU AGPLv3
 *
 * Misión:
 * 1. Garantizar CLS = 0.00 mediante reserva rígida de altura en CSS antes de la carga de scripts.
 * 2. Carga asíncrona no bloqueante con tolerancia a AdBlockers (try/catch silencioso en push).
 * 3. Modo desarrollo / placeholder seguro con contenedor visual punteado y etiqueta de ranura.
 * 4. Soporte para entornos de prueba (`data-adtest="on"`).
 */

import { ref, computed, onMounted } from 'vue'

export type AdSlotType =
  | 'header-leaderboard'
  | 'sidebar-rectangle'
  | 'in-article-banner'
  | 'sticky-skyscraper'
  // Compatibilidad con catálogo MOD-04
  | 'ad-top-display'
  | 'ad-sidebar-sticky'
  | 'ad-in-feed'
  | 'ad-in-article'
  | 'ad-multiplex'

interface Props {
  /** Tipo de ranura publicitaria */
  type: AdSlotType
  /** ID del bloque de anuncio en Google AdSense (data-ad-slot) */
  slotId?: string
  /** ID de cliente AdSense (data-ad-client, p. ej. 'ca-pub-XXXXXXXXXX') */
  adClient?: string
  /** Forzar modo prueba en AdSense (data-adtest="on") */
  adtest?: boolean
  /** Fijar como sticky en el viewport lateral */
  sticky?: boolean
  /** Clases CSS adicionales */
  customClass?: string
  /** Desactivar la ranura (muestra placeholder o permanece oculta) */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  slotId: '',
  adClient: '',
  adtest: false,
  sticky: false,
  customClass: '',
  disabled: false,
})

const config = useRuntimeConfig()
const route = useRoute()

// Detección de entorno
const isProd = process.env.NODE_ENV === 'production'
const hasAdBlocker = ref(false)

// Resolución de Client ID
const computedAdClient = computed(() => {
  return props.adClient || (config.public?.adsenseClientId as string) || ''
})

// Detección de modo test para AdSense
const isAdTestActive = computed(() => {
  if (props.adtest) return true
  if (config.public?.adsenseTest === 'true') return true
  if (route.query?.adtest === 'on') return true
  return false
})

// Determinar si AdSense debe inicializarse realmente
const shouldRenderAdSense = computed(() => {
  if (props.disabled) return false
  if (!computedAdClient.value || !props.slotId) return false
  // Si estamos en producción o si se solicita explícitamente modo test
  return isProd || isAdTestActive.value
})

// Mapeo canónico de ranuras a clases de altura mínima (Anti-CLS) y dimensiones
const slotMetrics = computed(() => {
  switch (props.type) {
    case 'header-leaderboard':
    case 'ad-top-display':
      return {
        label: 'Header Leaderboard',
        dimensions: '728×90 (desktop) / 320×50 (móvil)',
        minHeightClass: 'min-h-[50px] md:min-h-[90px]',
        maxWidthClass: 'max-w-[728px]',
        format: 'auto',
        isSticky: false,
      }
    case 'sidebar-rectangle':
      return {
        label: 'Sidebar Rectangle',
        dimensions: '300×250',
        minHeightClass: 'min-h-[250px]',
        maxWidthClass: 'max-w-[300px]',
        format: 'rectangle',
        isSticky: props.sticky,
      }
    case 'in-article-banner':
    case 'ad-in-article':
      return {
        label: 'In-Article Banner',
        dimensions: 'Responsive 336×280 / Fluido',
        minHeightClass: 'min-h-[280px]',
        maxWidthClass: 'max-w-[728px]',
        format: 'fluid',
        isSticky: false,
      }
    case 'sticky-skyscraper':
    case 'ad-sidebar-sticky':
      return {
        label: 'Sticky Skyscraper',
        dimensions: '160×600 / 300×600',
        minHeightClass: 'min-h-[600px]',
        maxWidthClass: 'max-w-[300px]',
        format: 'vertical',
        isSticky: true,
      }
    case 'ad-in-feed':
      return {
        label: 'In-Feed Native',
        dimensions: 'Fluido 100% × 100-120px',
        minHeightClass: 'min-h-[100px]',
        maxWidthClass: 'w-full',
        format: 'fluid',
        isSticky: false,
      }
    case 'ad-multiplex':
      return {
        label: 'Multiplex Grid',
        dimensions: 'Rejilla Responsive',
        minHeightClass: 'min-h-[280px]',
        maxWidthClass: 'w-full',
        format: 'autorelaxed',
        isSticky: false,
      }
    default:
      return {
        label: props.type,
        dimensions: '300×250',
        minHeightClass: 'min-h-[90px]',
        maxWidthClass: 'max-w-[728px]',
        format: 'auto',
        isSticky: false,
      }
  }
})

// Disparador protegido para el script externo de AdSense
onMounted(() => {
  if (import.meta.client && shouldRenderAdSense.value) {
    try {
      // Inyección controlada y segura de la petición en la cola adsbygoogle
      const win = window as any
      win.adsbygoogle = win.adsbygoogle || []
      win.adsbygoogle.push({})
    } catch (err) {
      // Degradar silenciosamente si uBlock Origin o Brave Shield bloquean la petición
      hasAdBlocker.value = true
    }
  }
})
</script>

<template>
  <aside
    class="lgl-ad-container w-full my-6 flex flex-col items-center justify-center transition-all overflow-hidden"
    :class="[
      slotMetrics.minHeightClass,
      slotMetrics.maxWidthClass,
      (slotMetrics.isSticky || sticky) ? 'sticky top-24' : '',
      customClass,
    ]"
    role="region"
    aria-label="Espacio publicitario"
  >
    <!-- 1. MODO DESARROLLO / DESACTIVADO / PLACEHOLDER SEGURO -->
    <div
      v-if="!shouldRenderAdSense"
      class="w-full h-full border border-dashed border-slate-700/70 bg-slate-900/40 hover:bg-slate-900/60 transition-colors rounded-xl flex flex-col items-center justify-center p-4 text-center select-none"
      :class="slotMetrics.minHeightClass"
    >
      <div class="flex items-center gap-1.5 mb-1.5">
        <span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-800 text-[10px] text-slate-400 font-bold border border-slate-700">
          AD
        </span>
        <span class="font-mono uppercase tracking-wider text-[11px] font-bold text-slate-400 dark:text-slate-400">
          Espacio Publicitario ({{ slotMetrics.label }})
        </span>
      </div>

      <p class="font-mono text-[10px] text-slate-500 mb-0.5">
        Reserva Anti-CLS: {{ slotMetrics.dimensions }}
      </p>

      <p class="text-[10px] text-slate-500/80">
        <template v-if="disabled">
          Publicidad desactivada manualmente
        </template>
        <template v-else-if="!computedAdClient">
          ID de cliente AdSense no configurado
        </template>
        <template v-else-if="!slotId">
          Ranura sin slotId asignado
        </template>
        <template v-else>
          Modo desarrollo activo (AdSense protegido)
        </template>
      </p>
    </div>

    <!-- 2. MODO PRODUCCIÓN / ADSENSE ACTIVO -->
    <ins
      v-else
      class="adsbygoogle block w-full text-center"
      :class="slotMetrics.minHeightClass"
      :data-ad-client="computedAdClient"
      :data-ad-slot="slotId"
      :data-ad-format="slotMetrics.format"
      :data-full-width-responsive="type === 'header-leaderboard' ? 'true' : 'false'"
      :data-adtest="isAdTestActive ? 'on' : undefined"
    />
  </aside>
</template>

<style scoped>
.lgl-ad-container {
  contain: layout;
}
</style>
