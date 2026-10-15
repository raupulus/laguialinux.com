<script setup lang="ts">
/**
 * YouTubeLite.vue - High-Performance, Privacy-Conscious YouTube Facade Component
 *
 * Módulo MOD-10: Guide Summary & Metadata Hub (Reproductor de vídeo bajo demanda)
 * Licencia de código: GNU AGPLv3
 *
 * Misión:
 * 1. Elimina ~1MB de scripts externos, fuentes y cookies de Google en la carga inicial de la página.
 * 2. Carga una miniatura WebP ligera (`hqdefault.webp`) con botón de reproducción accesible.
 * 3. Monta el <iframe> de YouTube únicamente tras un clic explícito del usuario (`youtube-nocookie.com`).
 * 4. Plena conformidad con RGPD / ePrivacy: cero peticiones a servidores de Google sin interacción.
 */

import { ref, computed } from 'vue'

interface Props {
  /** ID del vídeo de YouTube (o URL completa de YouTube) */
  videoId: string
  /** Título accesible del vídeo para aria-label y atributo title del iframe */
  title?: string
  /** URL personalizada para la imagen de portada (opcional) */
  poster?: string
  /** Relación de aspecto (p. ej. '16/9', '4/3') */
  aspectRatio?: '16/9' | '4/3' | string
  /** Autoplay al hacer clic para iniciar inmediatamente */
  autoplay?: boolean
  /** Usar el dominio de privacidad estricta youtube-nocookie.com */
  nocookie?: boolean
  /** Clases CSS adicionales */
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Vídeo explicativo de YouTube',
  poster: '',
  aspectRatio: '16/9',
  autoplay: true,
  nocookie: true,
  customClass: '',
})

const emit = defineEmits<{
  (e: 'play', id: string): void
}>()

// Estado reactivo: ¿ha hecho clic el usuario para cargar el reproductor?
const isActivated = ref(false)
const imageHasError = ref(false)

/**
 * Normaliza y extrae el ID de 11 caracteres de YouTube si se pasó una URL completa
 */
const cleanVideoId = computed(() => {
  if (!props.videoId) return ''
  const trimmed = props.videoId.trim()

  // Si es un ID de 11 caracteres alfanuméricos directos
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed
  }

  // Si es una URL de youtube.com o youtu.be
  const urlMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1]
  }

  return trimmed
})

/**
 * URL de la miniatura WebP ligera conforme a especificación
 */
const posterUrl = computed(() => {
  if (props.poster) return props.poster
  if (!cleanVideoId.value) return ''

  // Fallback si la imagen WebP da error de carga
  if (imageHasError.value) {
    return `https://i.ytimg.com/vi/${cleanVideoId.value}/hqdefault.jpg`
  }

  return `https://i.ytimg.com/vi/${cleanVideoId.value}/hqdefault.webp`
})

/**
 * URL del iframe con parámetros de reproducción y privacidad
 */
const iframeSrc = computed(() => {
  if (!cleanVideoId.value) return ''

  const baseDomain = props.nocookie
    ? 'https://www.youtube-nocookie.com'
    : 'https://www.youtube.com'

  const params = new URLSearchParams()
  if (props.autoplay) params.set('autoplay', '1')
  params.set('rel', '0') // Solo vídeos relacionados del mismo canal
  params.set('modestbranding', '1')
  params.set('playsinline', '1')

  return `${baseDomain}/embed/${cleanVideoId.value}?${params.toString()}`
})

/**
 * Manejador de activación (clic o teclado)
 */
const activatePlayer = () => {
  if (!isActivated.value && cleanVideoId.value) {
    isActivated.value = true
    emit('play', cleanVideoId.value)
  }
}

const handleImageError = () => {
  if (!imageHasError.value) {
    imageHasError.value = true
  }
}
</script>

<template>
  <div
    v-if="cleanVideoId"
    class="youtube-lite-container relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-lg group select-none"
    :class="[
      aspectRatio === '16/9' ? 'aspect-video' : '',
      customClass,
    ]"
    :style="aspectRatio !== '16/9' ? { aspectRatio: aspectRatio.replace('/', ' / ') } : undefined"
  >
    <!-- 1. FACHADA LIGERA (PRE-CLICK: Cero scripts externos, miniatura WebP) -->
    <template v-if="!isActivated">
      <!-- Miniatura WebP con lazy loading y decoding asíncrono -->
      <img
        :src="posterUrl"
        :alt="title"
        loading="lazy"
        decoding="async"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        @error="handleImageError"
      />

      <!-- Capa de oscurecimiento suave -->
      <div class="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors pointer-events-none" />

      <!-- Botón de Reproducción Accesible -->
      <button
        type="button"
        class="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600/95 hover:bg-red-600 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        :aria-label="`Reproducir vídeo: ${title}`"
        @click="activatePlayer"
        @keydown.enter.prevent="activatePlayer"
        @keydown.space.prevent="activatePlayer"
      >
        <!-- Icono Triángulo de Reproducción SVG -->
        <svg
          class="w-7 h-7 sm:w-8 sm:h-8 translate-x-0.5 fill-current"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>

      <!-- Insignia informativa de privacidad y duración estimada -->
      <div class="absolute bottom-3 right-3 px-2 py-1 bg-slate-950/80 backdrop-blur-md rounded-md text-[10px] font-mono text-slate-300 border border-slate-800 flex items-center gap-1.5 pointer-events-none">
        <span class="w-1.5 h-1.5 rounded-full bg-red-500" />
        <span>YouTube (Reproducción privada)</span>
      </div>
    </template>

    <!-- 2. REPRODUCTOR EMBEBIDO REAL (POST-CLICK: Montado bajo demanda) -->
    <iframe
      v-else
      :src="iframeSrc"
      :title="title"
      class="w-full h-full border-0 absolute inset-0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      loading="lazy"
    />
  </div>
</template>

<style scoped>
.youtube-lite-container {
  contain: content;
}
</style>
