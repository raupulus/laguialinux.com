<!--
  pages/newsletter/confirmacion.vue - Confirmación de Suscripción con Patrón Anti-Prefetch
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
const { confirmNewsletter, request } = useApiClient()

// =============================================================================
// Metadatos SEO (noindex para páginas transaccionales de token)
// =============================================================================
useHead({
  title: computed(() => `Confirmar Suscripción al Boletín · ${platform.value.name}`),
  meta: [
    {
      name: 'description',
      content: `Página web de confirmación de suscripción al boletín con protección anti-prefetch de clientes de correo.`,
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
// Estados: 'initial' | 'confirming' | 'success' | 'error' | 'resending' | 'resend_success'
// =============================================================================
const state = ref<'initial' | 'confirming' | 'success' | 'error'>('initial')
const errorMessage = ref<string | null>(null)
const resendEmail = ref('')
const isResending = ref(false)
const resendSuccessMessage = ref<string | null>(null)
const resendError = ref<string | null>(null)

// -----------------------------------------------------------------------------
// REGLA FUNDAMENTAL ANTI-PREFETCH:
// Bajo ninguna circunstancia se ejecuta una llamada de mutación en onMounted o SSR.
// La confirmación requiere un clic explícito del usuario humano en el botón.
// -----------------------------------------------------------------------------
const triggerConfirmation = async () => {
  if (!token.value) {
    state.value = 'error'
    errorMessage.value = 'No se ha proporcionado un token de verificación válido en el enlace.'
    return
  }

  state.value = 'confirming'
  errorMessage.value = null

  try {
    // Llamada HTTP POST al endpoint semántico de confirmación
    const response = await confirmNewsletter(token.value)

    if (response && response.success) {
      state.value = 'success'
    } else {
      state.value = 'success' // Respuestas 200 sin cuerpo de envelope estricto
    }
  } catch (err: any) {
    state.value = 'error'
    if (err.status === 404) {
      errorMessage.value =
        'El enlace de verificación no es válido, ya ha sido utilizado previamente o ha caducado (validez máxima de 48 horas).'
    } else if (err.isRateLimited) {
      errorMessage.value = 'Demasiados intentos de verificación. Por favor, espera unos minutos.'
    } else {
      errorMessage.value = err.message || 'No se pudo verificar la suscripción. Inténtalo más tarde.'
    }
  }
}

// Reenvío de correo de verificación (Patrón Anti-Enumeración)
const handleResendVerification = async () => {
  const emailToResend = resendEmail.value.trim()
  if (!emailToResend || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToResend)) {
    resendError.value = 'Introduce una dirección de correo válida.'
    return
  }

  isResending.value = true
  resendError.value = null

  try {
    const resolvedPlatformId = platform.value.slug === 'news' ? 2 : 1
    const res = await request<null>('/newsletter/subscriptions/verification', {
      method: 'POST',
      body: {
        email: emailToResend,
        platform_id: resolvedPlatformId,
      },
    })

    resendSuccessMessage.value =
      res?.message ||
      'Si la dirección está suscrita y pendiente de verificar, se ha enviado un nuevo correo de activación.'
  } catch (err: any) {
    resendError.value = err.message || 'Error al solicitar el reenvío de activación.'
  } finally {
    isResending.value = false
  }
}
</script>

<template>
  <main class="max-w-4xl mx-auto w-full px-4 lg:px-8 py-12 flex-1 flex flex-col justify-center">

    <!-- TARJETA PRINCIPAL DEL FLUJO ANTI-PREFETCH -->
    <div class="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">

      <!-- INFORMACIÓN DE SEGURIDAD -->
      <div class="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-4 shadow-sm">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shrink-0">
          🛡️
        </div>
        <div class="space-y-1 text-xs">
          <div class="font-bold text-white text-sm">
            Verificación de suscripción
          </div>
          <p class="text-slate-300 leading-relaxed">
            Para garantizar que deseas recibir nuestro boletín y proteger tu privacidad frente a filtros automatizados de correo, pulsa el botón inferior para confirmar tu suscripción.
          </p>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- CASO 1: TOKEN AUSENTE EN URL                                          -->
      <!-- ===================================================================== -->
      <div v-if="!token && state === 'initial'" class="space-y-6">
        <div class="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center sm:text-left space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl mx-auto sm:mx-0">
            ⚠️
          </div>
          <h1 class="text-xl sm:text-2xl font-bold text-white font-heading">
            Token de confirmación no especificado
          </h1>
          <p class="text-xs sm:text-sm text-amber-200 leading-relaxed">
            Para activar tu suscripción, debes acceder a través del enlace completo recibido en tu correo electrónico (con el parámetro <code class="font-mono text-amber-300">?token=...</code>).
          </p>
        </div>

        <div class="pt-2 flex flex-wrap items-center gap-4">
          <NuxtLink to="/" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-colors">
            ← Volver a la portada
          </NuxtLink>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- CASO 2: ESTADO INICIAL / ESPERANDO ACCIÓN HUMANA                      -->
      <!-- ===================================================================== -->
      <div v-else-if="state === 'initial' || state === 'confirming'" class="space-y-6">
        <div class="space-y-2 text-center sm:text-left">
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border"
            :class="isNews
              ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'"
          >
            <span>📬</span>
            <span>Doble Verificación Pendiente</span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading">
            ¿Confirmas tu suscripción a {{ platform.name }}?
          </h1>

          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Hemos recibido una solicitud para suscribirte a nuestros boletines periódicos con novedades técnicas, guías paso a paso y avisos del ecosistema GNU/Linux.
          </p>
        </div>

        <!-- DETALLES DE LA SUSCRIPCIÓN -->
        <div class="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-2.5">
            <span class="text-slate-500">Portal / Plataforma:</span>
            <span class="font-bold text-white flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full" :class="isNews ? 'bg-orange-400' : 'bg-emerald-400'"></span>
              {{ platform.name }} ({{ platform.domain }})
            </span>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between">
            <span class="text-slate-500">Token de verificación recibido:</span>
            <code class="text-slate-400 text-[11px] truncate max-w-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {{ token }}
            </code>
          </div>
        </div>

        <!-- BOTÓN DE CONFIRMACIÓN EXPLÍCITA -->
        <div class="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <button
            type="button"
            :disabled="state === 'confirming'"
            @click="triggerConfirmation"
            class="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            :class="isNews
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-orange-950/60'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/60'"
          >
            <Icon v-if="state === 'confirming'" name="lucide:loader-2" class="w-4 h-4 animate-spin text-white" />
            <span>{{ state === 'confirming' ? 'Confirmando suscripción...' : 'Confirmar mi Suscripción' }}</span>
            <span v-if="state !== 'confirming'">→</span>
          </button>

          <NuxtLink
            to="/"
            class="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono border border-slate-800 text-center transition-colors"
          >
            Cancelar y volver
          </NuxtLink>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- CASO 3: ÉXITO EN LA VERIFICACIÓN (HTTP 200)                           -->
      <!-- ===================================================================== -->
      <div v-else-if="state === 'success'" class="space-y-6 animate-fade-in">
        <div class="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center sm:text-left space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl mx-auto sm:mx-0">
            ✓
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-white font-heading">
            ¡Suscripción confirmada correctamente!
          </h2>
          <p class="text-xs sm:text-sm text-emerald-200 leading-relaxed">
            Tu dirección de correo ha quedado verificada con éxito en nuestra base de datos. A partir de ahora recibirás puntualmente nuestros resúmenes técnicos, tutoriales y novedades sin rastreo comercial invasivo ni spam.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-800">
          <NuxtLink
            to="/guias"
            class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <span>Explorar Catálogo de Guías</span>
            <span>→</span>
          </NuxtLink>

          <NuxtLink
            to="/"
            class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            Ir a la Portada
          </NuxtLink>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- CASO 4: ERROR / TOKEN INVÁLIDO O CADUCADO                             -->
      <!-- ===================================================================== -->
      <div v-else-if="state === 'error'" class="space-y-6 animate-fade-in">
        <div class="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center sm:text-left space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-2xl mx-auto sm:mx-0">
            ⚠️
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-white font-heading">
            Enlace no válido o caducado
          </h2>
          <p class="text-xs sm:text-sm text-rose-200 leading-relaxed">
            {{ errorMessage || 'El enlace de verificación ha expirado (validez máxima de 48 horas) o ya ha sido utilizado previamente para confirmar esta suscripción.' }}
          </p>
        </div>

        <!-- FORMULARIO DE REENVÍO DE VERIFICACIÓN (ANTI-ENUMERACIÓN) -->
        <div class="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div class="space-y-1">
            <h3 class="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              ¿Deseas solicitar un nuevo correo de activación?
            </h3>
            <p class="text-xs text-slate-400">
              Introduce tu correo para recibir un nuevo enlace con validez renovada de 48 horas.
            </p>
          </div>

          <form @submit.prevent="handleResendVerification" class="flex flex-col sm:flex-row gap-3">
            <input
              v-model="resendEmail"
              type="email"
              required
              placeholder="tu-correo@servidor.com"
              class="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              :disabled="isResending"
              class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-colors disabled:opacity-50 shrink-0"
            >
              {{ isResending ? 'Enviando...' : 'Reenviar activación' }}
            </button>
          </form>

          <span v-if="resendError" class="text-xs text-rose-400 block font-mono">
            {{ resendError }}
          </span>

          <div v-if="resendSuccessMessage" class="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
            ✓ {{ resendSuccessMessage }}
          </div>
        </div>

        <div class="flex items-center gap-4 pt-2">
          <button
            type="button"
            @click="state = 'initial'"
            class="text-xs text-slate-400 hover:text-white underline font-mono"
          >
            ← Volver a intentar confirmar
          </button>
        </div>
      </div>

    </div>

  </main>
</template>
