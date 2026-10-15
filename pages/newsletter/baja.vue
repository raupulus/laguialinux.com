<!--
  pages/newsletter/baja.vue - Cancelación de Suscripción con Patrón Anti-Prefetch (RFC 8058)
  La Guía Linux (laguialinux.com & news.laguialinux.com)
  Licencia: GNU AGPLv3
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePlatform } from '~/composables/usePlatform'
import { useApiClient } from '~/composables/useApiClient'

const route = useRoute()
const { platform, isGuides, isNews } = usePlatform()
const { unsubscribeNewsletter, postNewsletterSubscription } = useApiClient()

// =============================================================================
// Metadatos SEO (noindex para páginas transaccionales de baja)
// =============================================================================
useHead({
  title: computed(() => `Gestionar Baja del Boletín · ${platform.value.name}`),
  meta: [
    {
      name: 'description',
      content: `Página web de cancelación de suscripción a la newsletter de ${platform.value.name}. Cumplimiento con RFC 8058 y baja voluntaria asistida.`,
    },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

// =============================================================================
// Extracción de Token desde URL Query o Parámetro de Ruta
// =============================================================================
const token = computed(() => {
  return ((route.query.token as string) || (route.params.token as string) || '').trim()
})

// =============================================================================
// Máquina de Estados Anti-Prefetch
// =============================================================================
const state = ref<'initial' | 'unsubscribing' | 'success' | 'error' | 'reactivating' | 'reactivated'>('initial')
const errorMessage = ref<string | null>(null)
const selectedReason = ref('too-frequent')
const undoEmail = ref('')
const isUndoing = ref(false)
const undoSuccessMessage = ref<string | null>(null)

// -----------------------------------------------------------------------------
// REGLA FUNDAMENTAL ANTI-PREFETCH:
// Bajo ninguna circunstancia se ejecuta una llamada DELETE o POST en onMounted o SSR.
// La baja se ejecuta ÚNICAMENTE al hacer clic explícito en el botón de confirmación.
// -----------------------------------------------------------------------------
const triggerUnsubscription = async () => {
  if (!token.value) {
    state.value = 'error'
    errorMessage.value = 'No se ha proporcionado un token de baja válido en el enlace.'
    return
  }

  state.value = 'unsubscribing'
  errorMessage.value = null

  try {
    // Llamada semántica DELETE /api/v2/newsletter/subscriptions/{token} esperando HTTP 204
    await unsubscribeNewsletter(token.value)
    state.value = 'success'
  } catch (err: any) {
    state.value = 'error'
    if (err.status === 404) {
      errorMessage.value =
        'El enlace de baja no es válido o la suscripción ya ha sido cancelada previamente.'
    } else if (err.isRateLimited) {
      errorMessage.value = 'Demasiadas solicitudes. Por favor, espera unos minutos.'
    } else {
      errorMessage.value = err.message || 'No se pudo procesar la baja de la suscripción. Inténtalo más tarde.'
    }
  }
}

// Opción de Deshacer / Reactivar suscripción voluntariamente
const handleUndoResubscribe = async () => {
  const emailVal = undoEmail.value.trim()
  if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
    return
  }

  isUndoing.value = true
  try {
    const resolvedPlatformId = platform.value.slug === 'news' ? 2 : 1
    await postNewsletterSubscription({
      email: emailVal,
      platform_id: resolvedPlatformId,
    })
    undoSuccessMessage.value = '¡Suscripción reactivada! Revisa tu bandeja de entrada para verificar tu correo.'
  } catch (err: any) {
    errorMessage.value = err.message || 'Error al reactivar la suscripción.'
  } finally {
    isUndoing.value = false
  }
}
</script>

<template>
  <main class="max-w-4xl mx-auto w-full px-4 lg:px-8 py-12 flex-1 flex flex-col justify-center">

    <!-- TARJETA PRINCIPAL DEL FLUJO DE BAJA ANTI-PREFETCH -->
    <div class="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">

      <!-- ===================================================================== -->
      <!-- CASO 1: TOKEN AUSENTE EN URL                                          -->
      <!-- ===================================================================== -->
      <div v-if="!token && state === 'initial'" class="space-y-6">
        <div class="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center sm:text-left space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl mx-auto sm:mx-0">
            ⚠️
          </div>
          <h1 class="text-xl sm:text-2xl font-bold text-white font-heading">
            Token de baja no especificado
          </h1>
          <p class="text-xs sm:text-sm text-amber-200 leading-relaxed">
            Para cancelar tu suscripción, debes acceder a través del enlace de baja situado al pie de los correos recibidos (con el parámetro <code class="font-mono text-amber-300">?token=...</code>).
          </p>
        </div>

        <div class="pt-2 flex flex-wrap items-center gap-4">
          <NuxtLink to="/" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-colors">
            ← Volver a la portada
          </NuxtLink>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- CASO 2: ESTADO INICIAL / ESPERANDO CONFIRMACIÓN DEL USUARIO          -->
      <!-- ===================================================================== -->
      <div v-else-if="state === 'initial' || state === 'unsubscribing'" class="space-y-6">
        <div class="space-y-2 text-center sm:text-left">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-bold">
            <span>🔕</span>
            <span>Cancelación de Suscripción (RFC 8058)</span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading">
            ¿Deseas darte de baja de la newsletter de {{ platform.name }}?
          </h1>

          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Lamentamos que te marches. Si confirmas la baja, eliminaremos tu correo inmediatamente de nuestros envíos periódicos sin trámites adicionales, llamadas ni preguntas obligatorias.
          </p>
        </div>

        <!-- DETALLES DE LA SUSCRIPCIÓN -->
        <div class="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-2.5">
            <span class="text-slate-500">Canal / Lista:</span>
            <span class="text-white font-bold">{{ platform.name }} ({{ platform.domain }})</span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between">
            <span class="text-slate-500">Token de baja recibido:</span>
            <code class="text-slate-400 text-[11px] truncate max-w-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {{ token }}
            </code>
          </div>
        </div>

        <!-- ENCUESTA VOLUNTARIA DE MOTIVOS (FEEDBACK OPCIONAL) -->
        <div class="space-y-3">
          <div class="text-xs font-bold text-slate-300">
            ¿Nos cuentas el motivo de tu baja? (Opcional, nos ayuda a mejorar nuestros contenidos):
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-400">
            <label class="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer">
              <input v-model="selectedReason" type="radio" value="too-frequent" class="text-rose-500 focus:ring-rose-500 bg-slate-900 border-slate-700" />
              <span>Recibo demasiados correos</span>
            </label>
            <label class="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer">
              <input v-model="selectedReason" type="radio" value="not-relevant" class="text-rose-500 focus:ring-rose-500 bg-slate-900 border-slate-700" />
              <span>El contenido ya no es de mi interés</span>
            </label>
            <label class="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer">
              <input v-model="selectedReason" type="radio" value="prefer-rss" class="text-rose-500 focus:ring-rose-500 bg-slate-900 border-slate-700" />
              <span>Prefiero seguir el proyecto por RSS</span>
            </label>
            <label class="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer">
              <input v-model="selectedReason" type="radio" value="technical" class="text-rose-500 focus:ring-rose-500 bg-slate-900 border-slate-700" />
              <span>Problemas técnicos de visualización</span>
            </label>
          </div>
        </div>

        <!-- ALTERNATIVA RSS ABIERTA SIN CORREO -->
        <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-2.5">
            <span class="text-lg">📡</span>
            <span>¿Prefieres leer sin proporcionar tu email? Puedes usar nuestros <strong>Feeds RSS/Atom abiertos</strong> en tu lector favorito sin registro.</span>
          </div>
          <NuxtLink to="/feeds" class="shrink-0 px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold font-mono transition-colors">
            Ver Feeds RSS →
          </NuxtLink>
        </div>

        <!-- BOTONES DE CONFIRMACIÓN -->
        <div class="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <button
            type="button"
            :disabled="state === 'unsubscribing'"
            @click="triggerUnsubscription"
            class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <Icon v-if="state === 'unsubscribing'" name="lucide:loader-2" class="w-4 h-4 animate-spin text-white" />
            <span>{{ state === 'unsubscribing' ? 'Cancelando suscripción...' : 'Confirmar Cancelación Definitiva' }}</span>
            <span v-if="state !== 'unsubscribing'">✖</span>
          </button>

          <NuxtLink
            to="/"
            class="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold text-center transition-colors"
          >
            No, volver a la página de inicio
          </NuxtLink>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- CASO 3: BAJA COMPLETADA CON ÉXITO (HTTP 204 NO CONTENT)              -->
      <!-- ===================================================================== -->
      <div v-else-if="state === 'success'" class="space-y-6 animate-fade-in">
        <div class="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center sm:text-left space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-2xl mx-auto sm:mx-0">
            ✓
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-white font-heading">
            Suscripción cancelada con éxito
          </h2>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Tu suscripción ha sido dada de baja de nuestra lista de envíos. No recibirás ningún correo adicional salvo que decidas suscribirte nuevamente en el futuro.
          </p>
        </div>

        <!-- OPCIÓN DE DESHACER (REACTIVACIÓN) -->
        <div class="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div class="text-xs font-semibold text-slate-300">
            ¿Has pulsado el botón por error o deseas reactivar tu suscripción?
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <input
              v-model="undoEmail"
              type="email"
              placeholder="Introduce tu correo para reactivar"
              class="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              :disabled="isUndoing || !undoEmail"
              @click="handleUndoResubscribe"
              class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-colors disabled:opacity-50 shrink-0"
            >
              {{ isUndoing ? 'Reactivando...' : 'Reactivar Suscripción' }}
            </button>
          </div>
          <div v-if="undoSuccessMessage" class="text-xs text-emerald-400 font-mono">
            ✓ {{ undoSuccessMessage }}
          </div>
        </div>

        <div class="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <NuxtLink to="/" class="text-slate-400 hover:text-white transition-colors">
            ← Ir a la portada
          </NuxtLink>
          <NuxtLink to="/feeds" class="text-amber-400 hover:underline font-mono">
            Explorar Feeds RSS Abiertos
          </NuxtLink>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- CASO 4: ERROR AL PROCESAR LA BAJA                                     -->
      <!-- ===================================================================== -->
      <div v-else-if="state === 'error'" class="space-y-6 animate-fade-in">
        <div class="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center sm:text-left space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-2xl mx-auto sm:mx-0">
            ⚠️
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-white font-heading">
            No se pudo cancelar la suscripción
          </h2>
          <p class="text-xs sm:text-sm text-rose-200 leading-relaxed">
            {{ errorMessage || 'El token de baja no es válido o ha expirado.' }}
          </p>
        </div>

        <div class="pt-2 flex items-center gap-4">
          <NuxtLink to="/" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-colors">
            ← Volver a la portada
          </NuxtLink>
          <button
            type="button"
            @click="state = 'initial'"
            class="text-xs text-slate-400 hover:text-white underline font-mono"
          >
            Reintentar
          </button>
        </div>
      </div>

    </div>

  </main>
</template>
