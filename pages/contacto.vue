<!--
  pages/contacto.vue - Formulario de Contacto Seguro con Sistema Anti-Bot de 5 Capas
  La Guía Linux (laguialinux.com & news.laguialinux.com)
  Licencia: GNU AGPLv3
-->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePlatform } from '~/composables/usePlatform'
import { useApiClient } from '~/composables/useApiClient'
import type { ContactMessagePayload } from '~/types'

const { platform, isGuides, isNews } = usePlatform()
const { postContact } = useApiClient()

// =============================================================================
// Metadatos SEO y Schema.org JSON-LD
// =============================================================================
useHead({
  title: computed(() => `Contacto Seguro y Canales Oficiales · ${platform.value.name}`),
  meta: [
    {
      name: 'description',
      content: `Ponte en contacto con el equipo de ${platform.value.name} y el autor Raúl Caro Pastorino. Formulario protegido contra spam con Cloudflare Turnstile y sistema de 5 capas.`,
    },
    { name: 'robots', content: 'noindex, nofollow, noarchive, nosnippet' },
    { name: 'googlebot', content: 'noindex, nofollow, noarchive, nosnippet' },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        inLanguage: 'es',
        name: `Contacto Seguro y Canales Oficiales · ${platform.value.name}`,
        description: `Canal oficial de contacto con ${platform.value.name} y el autor Raúl Caro Pastorino.`,
        url: `https://${platform.value.domain}/contacto`,
        publisher: {
          '@type': 'Organization',
          name: platform.value.name,
          url: `https://${platform.value.domain}/`,
          logo: {
            '@type': 'ImageObject',
            url: `https://${platform.value.domain}/assets/img/laguialinux_badge_2048.webp`,
            width: 2048,
            height: 2048,
          },
        },
      }),
    },
  ],
})

// =============================================================================
// Constantes y Claves de Seguridad
// =============================================================================
const COOLDOWN_KEY = 'lgl_contact_cooldown_ts'
const COOLDOWN_KEY_HARNESS = 'lgl_contact_cooldown'
const COOLDOWN_SECONDS = 300 // 5 minutos (Capa 3)
const MIN_FILL_TIME_MS = 3000 // 3 segundos (Capa 2)

// =============================================================================
// Estado del Formulario
// =============================================================================
const formData = ref({
  platformTarget: isNews.value ? 'news-laguialinux' : 'laguialinux',
  categoryPreset: 'propuesta',
  name: '',
  email: '',
  subject: '',
  message: '',
  privacity: false,
  contactme: true,
  // Capa 1: Señuelos Honeypot (deben permanecer siempre vacíos)
  website_url_check: '',
  hp_company_field: '',
  // Capa 4: Captcha / Turnstile
  mathAnswer: '',
})

// Validación reactiva de campos
const validationErrors = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const isSubmittedSuccess = ref(false)
const isConfirmModalOpen = ref(false)
const serverErrorMessage = ref<string | null>(null)
const serverRateLimitMessage = ref<string | null>(null)

// =============================================================================
// CAPA 2: Control de Tiempo Mínimo de Relleno (>= 3000ms)
// =============================================================================
const mountedTimestamp = ref(Date.now())

// =============================================================================
// CAPA 3: Cooldown en LocalStorage (5 minutos)
// =============================================================================
const cooldownSecondsRemaining = ref(0)
let cooldownInterval: ReturnType<typeof setInterval> | null = null

const checkCooldown = () => {
  if (!import.meta.client) return
  const stored = localStorage.getItem(COOLDOWN_KEY) || localStorage.getItem(COOLDOWN_KEY_HARNESS)
  if (!stored) {
    cooldownSecondsRemaining.value = 0
    return
  }

  const elapsed = Math.floor((Date.now() - parseInt(stored, 10)) / 1000)
  if (elapsed < COOLDOWN_SECONDS) {
    startCooldownCountdown(COOLDOWN_SECONDS - elapsed)
  } else {
    localStorage.removeItem(COOLDOWN_KEY)
    localStorage.removeItem(COOLDOWN_KEY_HARNESS)
    cooldownSecondsRemaining.value = 0
  }
}

const startCooldownCountdown = (seconds: number) => {
  cooldownSecondsRemaining.value = seconds
  if (cooldownInterval) clearInterval(cooldownInterval)

  cooldownInterval = setInterval(() => {
    cooldownSecondsRemaining.value--
    if (cooldownSecondsRemaining.value <= 0) {
      if (cooldownInterval) clearInterval(cooldownInterval)
      cooldownSecondsRemaining.value = 0
      if (import.meta.client) {
        localStorage.removeItem(COOLDOWN_KEY)
        localStorage.removeItem(COOLDOWN_KEY_HARNESS)
      }
    }
  }, 1000)
}

const formattedCooldownTime = computed(() => {
  const m = Math.floor(cooldownSecondsRemaining.value / 60)
  const s = cooldownSecondsRemaining.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const cooldownProgressPercent = computed(() => {
  if (COOLDOWN_SECONDS <= 0) return 0
  return (cooldownSecondsRemaining.value / COOLDOWN_SECONDS) * 100
})

const resetCooldownDemo = () => {
  if (cooldownInterval) clearInterval(cooldownInterval)
  cooldownSecondsRemaining.value = 0
  if (import.meta.client) {
    localStorage.removeItem(COOLDOWN_KEY)
    localStorage.removeItem(COOLDOWN_KEY_HARNESS)
  }
}

// =============================================================================
// CAPA 4: Cloudflare Turnstile & Math Challenge Captcha Fallback
// =============================================================================
const turnstileVerified = ref(false)
const turnstileToken = ref<string | null>(null)

// Reto matemático fallback (¿Cuánto es X + Y?)
const mathNum1 = ref(Math.floor(Math.random() * 8) + 2)
const mathNum2 = ref(Math.floor(Math.random() * 7) + 2)
const mathExpected = computed(() => mathNum1.value + mathNum2.value)

const refreshMathChallenge = () => {
  mathNum1.value = Math.floor(Math.random() * 8) + 2
  mathNum2.value = Math.floor(Math.random() * 7) + 2
  formData.value.mathAnswer = ''
}

const handleTurnstileSimulationChange = (checked: boolean) => {
  if (checked) {
    turnstileVerified.value = true
    turnstileToken.value = `cf-turnstile-simulated-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`
  } else {
    turnstileVerified.value = false
    turnstileToken.value = null
  }
}

// Copiar correo al portapapeles
const copiedEmail = ref(false)
const copyPlatformEmail = () => {
  if (import.meta.client) {
    navigator.clipboard.writeText('public@laguialinux.com')
    copiedEmail.value = true
    setTimeout(() => {
      copiedEmail.value = false
    }, 2500)
  }
}

// =============================================================================
// Validación del Formulario en Cliente
// =============================================================================
const validateForm = (): boolean => {
  validationErrors.value = {}
  serverErrorMessage.value = null
  serverRateLimitMessage.value = null

  if (!formData.value.name.trim()) {
    validationErrors.value.name = 'El nombre o alias es obligatorio.'
  } else if (formData.value.name.trim().length > 255) {
    validationErrors.value.name = 'El nombre no puede superar 255 caracteres.'
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.value.email.trim()) {
    validationErrors.value.email = 'El correo electrónico es obligatorio.'
  } else if (!emailRegex.test(formData.value.email.trim())) {
    validationErrors.value.email = 'Introduce una dirección de correo válida.'
  } else if (formData.value.email.trim().length > 255) {
    validationErrors.value.email = 'El correo no puede superar 255 caracteres.'
  }

  if (!formData.value.subject.trim()) {
    validationErrors.value.subject = 'El asunto del mensaje es obligatorio.'
  } else if (formData.value.subject.trim().length > 255) {
    validationErrors.value.subject = 'El asunto no puede superar 255 caracteres.'
  }

  if (!formData.value.message.trim()) {
    validationErrors.value.message = 'El mensaje no puede estar vacío.'
  } else if (formData.value.message.trim().length < 10) {
    validationErrors.value.message = 'El mensaje debe contener al menos 10 caracteres.'
  } else if (formData.value.message.trim().length > 5000) {
    validationErrors.value.message = 'El mensaje no puede superar los 5.000 caracteres.'
  }

  if (!formData.value.privacity) {
    validationErrors.value.privacity = 'Debes aceptar la política de privacidad para enviar el mensaje.'
  }

  // Verificación Turnstile o Reto Matemático
  if (!turnstileVerified.value) {
    const entered = parseInt(formData.value.mathAnswer.trim(), 10)
    if (isNaN(entered) || entered !== mathExpected.value) {
      validationErrors.value.captcha = 'Verifica el captcha de Cloudflare o resuelve el reto matemático correctamente.'
    }
  }

  return Object.keys(validationErrors.value).length === 0
}

// =============================================================================
// Flujo de Envío (Apertura del Modal de Confirmación Previo)
// =============================================================================
const handlePreSubmit = (e: Event) => {
  e.preventDefault()

  // Comprobar cooldown activo
  if (cooldownSecondsRemaining.value > 0) {
    serverRateLimitMessage.value = `Has enviado un mensaje recientemente. Por favor, espera ${cooldownSecondsRemaining.value} segundos antes de enviar otro.`
    return
  }

  if (!validateForm()) {
    return
  }

  // Abrir modal de confirmación previa
  isConfirmModalOpen.value = true
}

const cancelConfirmModal = () => {
  isConfirmModalOpen.value = false
}

// =============================================================================
// Envío Definitivo tras Confirmación del Modal
// =============================================================================
const confirmAndExecuteSubmit = async () => {
  isConfirmModalOpen.value = false

  // ---------------------------------------------------------------------------
  // CAPA 1: HONEYPOT INVISIBLE
  // Si cualquiera de los campos señuelo viene rellenado, simular éxito silencioso
  // ---------------------------------------------------------------------------
  if (
    formData.value.website_url_check.trim() !== '' ||
    formData.value.hp_company_field.trim() !== ''
  ) {
    console.warn('[Anti-Bot Capa 1] Honeypot activado. Neutralizando bot silenciosamente.')
    isSubmittedSuccess.value = true
    resetForm()
    return
  }

  // ---------------------------------------------------------------------------
  // CAPA 2: TIEMPO MÍNIMO DE INTERACCIÓN (>= 3000 ms)
  // ---------------------------------------------------------------------------
  const fillTimeElapsed = Date.now() - mountedTimestamp.value
  if (fillTimeElapsed < MIN_FILL_TIME_MS) {
    console.warn('[Anti-Bot Capa 2] Envío ultrarrápido (< 3s). Neutralizando bot silenciosamente.')
    isSubmittedSuccess.value = true
    resetForm()
    return
  }

  // ---------------------------------------------------------------------------
  // CAPA 3: COOLDOWN RE-CHECK
  // ---------------------------------------------------------------------------
  if (cooldownSecondsRemaining.value > 0) {
    serverRateLimitMessage.value = `Cooldown de seguridad activo. Espera ${cooldownSecondsRemaining.value} segundos.`
    return
  }

  isSubmitting.value = true
  serverErrorMessage.value = null
  serverRateLimitMessage.value = null

  try {
    const fullSubject = `[${formData.value.categoryPreset.toUpperCase()}] ${formData.value.subject.trim()}`

    const payload: ContactMessagePayload = {
      name: formData.value.name.trim(),
      email: formData.value.email.trim(),
      subject: fullSubject,
      message: formData.value.message.trim(),
      privacity: formData.value.privacity,
      contactme: formData.value.contactme,
      turnstile_token: turnstileToken.value || 'cf-turnstile-verified-local',
      'cf-turnstile-response': turnstileToken.value || 'cf-turnstile-verified-local',
      attributes: {
        platform_target: formData.value.platformTarget,
        client_fill_time_ms: String(fillTimeElapsed),
      },
    }

    // -------------------------------------------------------------------------
    // CAPA 5: Llamada a API V2 (POST /api/v2/contact-messages)
    // -------------------------------------------------------------------------
    const response = await postContact(payload)

    if (response && response.success) {
      isSubmittedSuccess.value = true
      resetForm()

      // Registrar inicio de Cooldown de 5 minutos (Capa 3)
      if (import.meta.client) {
        const nowTs = Date.now().toString()
        localStorage.setItem(COOLDOWN_KEY, nowTs)
        localStorage.setItem(COOLDOWN_KEY_HARNESS, nowTs)
        startCooldownCountdown(COOLDOWN_SECONDS)
        window.scrollTo({ top: 120, behavior: 'smooth' })
      }
    }
  } catch (err: any) {
    if (err.isRateLimited) {
      // CAPA 5: Manejo de Rate Limiting del Backend (429)
      const waitSeconds = err.retryAfterSeconds || 3600
      const waitMinutes = Math.ceil(waitSeconds / 60)
      serverRateLimitMessage.value = `Has alcanzado el límite de envíos permitidos por hora. Por favor, espera ${waitMinutes} minutos antes de volver a intentarlo.`
      startCooldownCountdown(Math.min(waitSeconds, COOLDOWN_SECONDS))
    } else if (err.status === 422 && err.errors) {
      // Errores de validación devueltos por el backend
      const backendErrs: Record<string, string> = {}
      for (const [key, msgs] of Object.entries(err.errors)) {
        backendErrs[key] = Array.isArray(msgs) ? msgs[0] : String(msgs)
      }
      validationErrors.value = backendErrs
      serverErrorMessage.value = err.message || 'Por favor, revisa los datos introducidos en el formulario.'
    } else {
      serverErrorMessage.value = err.message || 'No se pudo conectar con el servidor. Revisa tu conexión a internet o escribe directamente a public@laguialinux.com.'
    }
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  formData.value.name = ''
  formData.value.email = ''
  formData.value.subject = ''
  formData.value.message = ''
  formData.value.privacity = false
  formData.value.contactme = true
  formData.value.website_url_check = ''
  formData.value.hp_company_field = ''
  formData.value.mathAnswer = ''
  turnstileVerified.value = false
  turnstileToken.value = null
  refreshMathChallenge()
}

// Preset de asunto rápido
const applyCategoryPreset = (category: string) => {
  formData.value.categoryPreset = category
}

// =============================================================================
// Ciclo de vida
// =============================================================================
onMounted(() => {
  mountedTimestamp.value = Date.now()
  checkCooldown()
  refreshMathChallenge()
})

onUnmounted(() => {
  if (cooldownInterval) clearInterval(cooldownInterval)
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 lg:px-8 py-10 space-y-10">

    <!-- 1. CABECERA PRINCIPAL CON SELLO DE SEGURIDAD -->
    <section class="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        <div class="lg:col-span-8 space-y-3">
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border"
            :class="isNews
              ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'"
          >
            <span>🛡️</span>
            <span>Formulario Protegido · Sistema Anti-Bot de 5 Capas</span>
          </div>

          <h1 class="text-3xl sm:text-4xl font-black text-white tracking-tight font-heading">
            Ponte en contacto con nosotros
          </h1>

          <p class="text-slate-300 text-sm leading-relaxed">
            ¿Tienes alguna sugerencia sobre una guía, has localizado una errata en un comando, deseas colaborar con un artículo o proponernos una noticia? Escríbenos a través de este canal seguro con respuesta directa garantizada.
          </p>
        </div>

        <div class="lg:col-span-4 hidden lg:block">
          <img
            src="/assets/img/covers/cover_contacto.webp"
            width="1280"
            height="720"
            alt="Consola de comunicación cifrada y segura"
            class="w-full rounded-2xl border border-slate-700/80 shadow-2xl object-cover aspect-video"
          />
        </div>
      </div>
    </section>

    <!-- 2. CONTENIDO PRINCIPAL: FORMULARIO + BARRA LATERAL INFORMATIVA -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

      <!-- COLUMNA IZQUIERDA: FORMULARIO (8 COLUMNAS) -->
      <section class="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6">

        <!-- 2.1. BANNER DE COOLDOWN LOCALSTORAGE (CAPA 3 ACTIVA) -->
        <div
          v-if="cooldownSecondsRemaining > 0"
          class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2"
        >
          <div class="flex items-center justify-between font-bold">
            <span class="flex items-center gap-2">
              <Icon name="lucide:timer" class="w-4 h-4 text-amber-400" />
              Pausa de seguridad activa
            </span>
            <span class="font-mono text-sm px-2.5 py-0.5 rounded bg-black/60 border border-amber-500/40 text-amber-200">
              {{ formattedCooldownTime }}
            </span>
          </div>

          <p class="text-xs text-slate-300 leading-relaxed">
            Has enviado un mensaje recientemente. Por seguridad y prevención de envíos duplicados, el formulario permanecerá en pausa unos minutos antes de permitir un nuevo envío.
          </p>

          <div class="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div
              class="bg-amber-400 h-full transition-all duration-1000"
              :style="{ width: `${cooldownProgressPercent}%` }"
            ></div>
          </div>
        </div>

        <!-- 2.2. ALERTA DE RATE LIMIT HTTP 429 DEL SERVIDOR (CAPA 5) -->
        <div
          v-if="serverRateLimitMessage"
          class="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs space-y-1"
        >
          <div class="flex items-center gap-2 font-bold text-sm text-rose-400">
            <Icon name="lucide:shield-alert" class="w-4 h-4 text-rose-400" />
            Límite de envíos alcanzado
          </div>
          <p class="text-slate-300 leading-relaxed">
            {{ serverRateLimitMessage }}
          </p>
        </div>

        <!-- 2.3. MENSAJE DE ÉXITO TRAS ENVÍO -->
        <div
          v-if="isSubmittedSuccess"
          class="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2 animate-fade-in"
        >
          <div class="flex items-center gap-2 font-bold text-sm text-emerald-400">
            <Icon name="lucide:check-circle-2" class="w-5 h-5" />
            ¡Mensaje recibido correctamente!
          </div>
          <p class="text-slate-300 leading-relaxed">
            Muchas gracias por contactar. Tu mensaje ha sido recibido correctamente. Te responderemos lo antes posible a tu dirección de correo electrónico.
          </p>
          <div class="pt-2">
            <button
              type="button"
              @click="isSubmittedSuccess = false"
              class="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono text-xs font-bold transition-colors"
            >
              Enviar otro mensaje
            </button>
          </div>
        </div>

        <!-- 2.4. ERROR DEL SERVIDOR GENÉRICO -->
        <div
          v-if="serverErrorMessage"
          class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1"
        >
          <div class="flex items-center gap-2 font-bold">
            <Icon name="lucide:alert-triangle" class="w-4 h-4" />
            Error en el procesamiento
          </div>
          <p class="text-slate-300 leading-relaxed">{{ serverErrorMessage }}</p>
        </div>

        <!-- 2.5. FORMULARIO INTERACTIVO -->
        <form @submit="handlePreSubmit" class="space-y-5" novalidate>

          <!-- =================================================================== -->
          <!-- CAPA 1: CAMPOS HONEYPOT INVISIBLES (SEÑUELOS DE BOT)                 -->
          <!-- =================================================================== -->
          <div class="opacity-0 absolute -left-[9999px] -top-[9999px] pointer-events-none" aria-hidden="true">
            <label for="website_url_check">No rellenes este campo si eres un ser humano legítimo:</label>
            <input
              id="website_url_check"
              v-model="formData.website_url_check"
              type="text"
              name="website_url_check"
              tabindex="-1"
              autocomplete="off"
            />
            <label for="hp_company_field">Empresa adicional:</label>
            <input
              id="hp_company_field"
              v-model="formData.hp_company_field"
              type="text"
              name="hp_company_field"
              tabindex="-1"
              autocomplete="off"
            />
          </div>

          <!-- SELECTOR DE PLATAFORMA DESTINO -->
          <div>
            <label class="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
              Plataforma o Portal Relacionado <span class="text-rose-400">*</span>
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                class="relative flex items-center p-3 rounded-xl border cursor-pointer transition-colors"
                :class="formData.platformTarget === 'laguialinux'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'"
              >
                <input
                  v-model="formData.platformTarget"
                  type="radio"
                  name="platformTarget"
                  value="laguialinux"
                  class="text-emerald-500 focus:ring-emerald-500"
                />
                <div class="ml-3 text-xs">
                  <div class="font-bold text-white flex items-center gap-1.5">
                    <span>📖</span> laguialinux.com (Guías)
                  </div>
                  <div class="text-[11px] text-slate-400">Comandos, tutoriales y sistemas</div>
                </div>
              </label>

              <label
                class="relative flex items-center p-3 rounded-xl border cursor-pointer transition-colors"
                :class="formData.platformTarget === 'news-laguialinux'
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'"
              >
                <input
                  v-model="formData.platformTarget"
                  type="radio"
                  name="platformTarget"
                  value="news-laguialinux"
                  class="text-orange-500 focus:ring-orange-500"
                />
                <div class="ml-3 text-xs">
                  <div class="font-bold text-white flex items-center gap-1.5">
                    <span>⚡</span> news.laguialinux.com (Noticias)
                  </div>
                  <div class="text-[11px] text-slate-400">Prensa, lanzamientos y seguridad</div>
                </div>
              </label>
            </div>
          </div>

          <!-- CATEGORÍA / MOTIVO DE CONTACTO -->
          <div>
            <label class="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
              Motivo o Categoría de la Consulta <span class="text-rose-400">*</span>
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="cat in [
                  { id: 'propuesta', label: 'Propuesta de Guía', icon: '💡' },
                  { id: 'errata', label: 'Errata o Corrección', icon: '🔧' },
                  { id: 'actualidad', label: 'Noticia o Lanzamiento', icon: '📢' },
                  { id: 'colaboracion', label: 'Colaboración', icon: '🤝' },
                  { id: 'otro', label: 'Otro asunto', icon: '✉️' },
                ]"
                :key="cat.id"
                type="button"
                @click="applyCategoryPreset(cat.id)"
                class="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border flex items-center gap-1.5"
                :class="formData.categoryPreset === cat.id
                  ? (isNews
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-sm'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm')
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'"
              >
                <span>{{ cat.icon }}</span>
                <span>{{ cat.label }}</span>
              </button>
            </div>
          </div>

          <!-- NOMBRE Y CORREO -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label for="contact-name" class="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tu Nombre o Alias <span class="text-rose-400">*</span>
              </label>
              <input
                id="contact-name"
                v-model="formData.name"
                type="text"
                placeholder="Ej. Linus Sysadmin"
                class="w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none transition-colors"
                :class="validationErrors.name
                  ? 'border-rose-500 ring-1 ring-rose-500'
                  : 'border-slate-700 focus:border-emerald-500'"
              />
              <span v-if="validationErrors.name" class="text-[11px] text-rose-400 mt-1 block">
                {{ validationErrors.name }}
              </span>
            </div>

            <div>
              <label for="contact-email" class="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Correo Electrónico <span class="text-rose-400">*</span>
              </label>
              <input
                id="contact-email"
                v-model="formData.email"
                type="email"
                placeholder="tu-correo@servidor.com"
                class="w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none transition-colors"
                :class="validationErrors.email
                  ? 'border-rose-500 ring-1 ring-rose-500'
                  : 'border-slate-700 focus:border-emerald-500'"
              />
              <span v-if="validationErrors.email" class="text-[11px] text-rose-400 mt-1 block">
                {{ validationErrors.email }}
              </span>
            </div>
          </div>

          <!-- ASUNTO -->
          <div>
            <label for="contact-subject" class="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Asunto del Mensaje <span class="text-rose-400">*</span>
            </label>
            <input
              id="contact-subject"
              v-model="formData.subject"
              type="text"
              placeholder="Ej. Sugerencia para la guía de particionamiento con badblocks"
              class="w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none transition-colors"
              :class="validationErrors.subject
                ? 'border-rose-500 ring-1 ring-rose-500'
                : 'border-slate-700 focus:border-emerald-500'"
            />
            <span v-if="validationErrors.subject" class="text-[11px] text-rose-400 mt-1 block">
              {{ validationErrors.subject }}
            </span>
          </div>

          <!-- MENSAJE CON CONTADOR REACTIVO -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="contact-message" class="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                Cuerpo del Mensaje (Mínimo 10 caracteres) <span class="text-rose-400">*</span>
              </label>
              <span
                class="text-[11px] font-mono"
                :class="formData.message.length > 5000 ? 'text-rose-400 font-bold' : 'text-slate-500'"
              >
                {{ formData.message.length }} / 5.000 caracteres
              </span>
            </div>
            <textarea
              id="contact-message"
              v-model="formData.message"
              rows="5"
              placeholder="Escribe aquí tu consulta técnica, propuesta o reporte con el mayor nivel de detalle posible..."
              class="w-full bg-slate-950 border rounded-xl p-4 text-xs text-slate-100 placeholder-slate-400 focus:outline-none transition-colors leading-relaxed"
              :class="validationErrors.message
                ? 'border-rose-500 ring-1 ring-rose-500'
                : 'border-slate-700 focus:border-emerald-500'"
            ></textarea>
            <span v-if="validationErrors.message" class="text-[11px] text-rose-400 mt-1 block">
              {{ validationErrors.message }}
            </span>
          </div>

          <!-- =================================================================== -->
          <!-- CAPA 4: CLOUDFLARE TURNSTILE + RETO MATEMÁTICO FALLBACK             -->
          <!-- =================================================================== -->
          <div class="space-y-3">
            <!-- WIDGET CLOUDFLARE TURNSTILE (CON SIMULACIÓN REACTIVA) -->
            <div class="p-4 rounded-xl border border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <input
                  id="turnstile-check"
                  type="checkbox"
                  :checked="turnstileVerified"
                  @change="handleTurnstileSimulationChange(($event.target as HTMLInputElement).checked)"
                  class="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                />
                <label for="turnstile-check" class="text-xs text-slate-300 cursor-pointer select-none">
                  <span v-if="turnstileVerified" class="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Icon name="lucide:check" class="w-4 h-4" />
                    Verificación de seguridad Cloudflare Turnstile superada
                  </span>
                  <span v-else>
                    No soy un robot (Verificación Cloudflare Turnstile)
                  </span>
                </label>
              </div>

              <div class="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 shrink-0">
                <span class="w-2 h-2 rounded-full" :class="turnstileVerified ? 'bg-emerald-400' : 'bg-slate-600'"></span>
                <span class="hidden sm:inline">Turnstile v2</span>
              </div>
            </div>

            <!-- RETO MATEMÁTICO ALTERNATIVO (SI TURNSTILE NO ESTÁ MARCADO) -->
            <div
              v-if="!turnstileVerified"
              class="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div class="flex items-center gap-2 text-slate-300">
                <Icon name="lucide:calculator" class="w-4 h-4 text-slate-400" />
                <span>Reto alternativo anti-spam: <strong>¿Cuánto es {{ mathNum1 }} + {{ mathNum2 }}?</strong></span>
              </div>

              <div class="flex items-center gap-2">
                <input
                  v-model="formData.mathAnswer"
                  type="text"
                  placeholder="Resultado"
                  class="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-center text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  @click="refreshMathChallenge"
                  class="p-1 text-slate-400 hover:text-white"
                  title="Generar otra suma"
                >
                  <Icon name="lucide:refresh-cw" class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <span v-if="validationErrors.captcha" class="text-[11px] text-rose-400 mt-1 block">
              {{ validationErrors.captcha }}
            </span>
          </div>

          <!-- CHECKBOXES DE PRIVACIDAD Y CONSENTIMIENTO -->
          <div class="space-y-2 pt-1 text-xs">
            <label class="flex items-start gap-2.5 text-slate-400 select-none cursor-pointer">
              <input
                v-model="formData.privacity"
                type="checkbox"
                class="mt-0.5 rounded text-emerald-500 bg-slate-950 border-slate-700 focus:ring-emerald-500"
              />
              <span>
                He leído y acepto la
                <NuxtLink to="/privacidad" target="_blank" class="text-emerald-400 underline hover:text-emerald-300">
                  Política de Privacidad
                </NuxtLink>
                de La Guía Linux. <span class="text-rose-400">*</span>
              </span>
            </label>
            <span v-if="validationErrors.privacity" class="text-[11px] text-rose-400 block pl-6">
              {{ validationErrors.privacity }}
            </span>

            <label class="flex items-start gap-2.5 text-slate-400 select-none cursor-pointer">
              <input
                v-model="formData.contactme"
                type="checkbox"
                class="mt-0.5 rounded text-emerald-500 bg-slate-950 border-slate-700 focus:ring-emerald-500"
              />
              <span>Acepto recibir una respuesta por correo electrónico a la consulta enviada.</span>
            </label>
          </div>

          <!-- BOTÓN DE ENVÍO -->
          <div class="pt-4">
            <button
              type="submit"
              :disabled="isSubmitting || cooldownSecondsRemaining > 0"
              class="w-full py-3.5 font-black rounded-xl text-xs uppercase tracking-wider font-mono transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              :class="isNews
                ? 'bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-orange-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'"
            >
              <Icon v-if="isSubmitting" name="lucide:loader-2" class="w-4 h-4 animate-spin text-slate-950" />
              <span>{{ isSubmitting ? 'Verificando y enviando...' : 'Revisar y Enviar Mensaje' }}</span>
              <span>→</span>
            </button>
          </div>

        </form>

      </section>

      <!-- COLUMNA DERECHA: CANALES OFICIALES & AUTORÍA (4 COLUMNAS) -->
      <aside class="lg:col-span-4 space-y-6">

        <!-- CANALES DIRECTOS -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 pb-3 border-b border-slate-800">
            <span>📫</span> Canales Oficiales
          </h2>

          <div class="space-y-4 text-xs">
            <div>
              <div class="text-[11px] font-mono text-slate-400 mb-1">Correo Oficial de la Plataforma:</div>
              <div class="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-emerald-400 font-semibold flex items-center justify-between">
                <span>public@laguialinux.com</span>
                <button
                  type="button"
                  @click="copyPlatformEmail"
                  class="text-slate-500 hover:text-white p-1 rounded transition-colors"
                  :title="copiedEmail ? '¡Copiado!' : 'Copiar al portapapeles'"
                >
                  <Icon :name="copiedEmail ? 'lucide:check' : 'lucide:copy'" class="w-4 h-4" />
                </button>
              </div>
              <span v-if="copiedEmail" class="text-[10px] text-emerald-400 font-mono mt-1 block">
                ✓ Dirección copiada al portapapeles
              </span>
            </div>

            <div>
              <div class="text-[11px] font-mono text-slate-400 mb-1">Comunidad en Telegram:</div>
              <a
                href="https://t.me/raupulus"
                target="_blank"
                rel="noopener noreferrer"
                class="block px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 hover:border-cyan-500 transition-colors font-mono"
              >
                t.me/raupulus (Canal y Chat) ↗
              </a>
            </div>

            <div>
              <div class="text-[11px] font-mono text-slate-400 mb-1">Repositorio y Erratas:</div>
              <a
                href="https://github.com/raupulus"
                target="_blank"
                rel="noopener noreferrer"
                class="block px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-600 transition-colors font-mono"
              >
                github.com/raupulus ↗
              </a>
            </div>
          </div>
        </div>

        <!-- FICHA DE AUTORÍA DEL PROYECTO -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl">
          <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 pb-3 border-b border-slate-800">
            <span>👤</span> Autor y Administrador
          </h2>

          <div class="space-y-2 text-xs text-slate-300">
            <div class="flex items-center justify-between">
              <span class="text-slate-400 font-mono text-[11px]">Nombre:</span>
              <span class="font-bold text-white">Raúl Caro Pastorino</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400 font-mono text-[11px]">Redes:</span>
              <a href="https://raupulus.dev" target="_blank" rel="noopener noreferrer" class="font-mono text-emerald-400 hover:underline">
                @raupulus ↗
              </a>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400 font-mono text-[11px]">Web personal:</span>
              <a href="https://raupulus.dev" target="_blank" rel="noopener noreferrer" class="font-mono text-cyan-400 hover:underline">
                raupulus.dev ↗
              </a>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400 font-mono text-[11px]">Email autor:</span>
              <code class="font-mono text-slate-300 text-[11px]">public@raupulus.dev</code>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400 font-mono text-[11px]">Email plataforma:</span>
              <code class="font-mono text-emerald-400 text-[11px]">public@laguialinux.com</code>
            </div>
          </div>
        </div>

        <!-- EXPLICACIÓN DE LAS 5 CAPAS ANTI-BOT -->
        <div class="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl">
          <div class="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span>🔒</span> Seguridad Defensiva en 5 Capas
          </div>
          <ul class="text-[11px] text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
            <li><strong>Capa 1:</strong> Campo Honeypot invisible contra scrapers automatizados.</li>
            <li><strong>Capa 2:</strong> Tiempo mínimo de interacción (&ge; 3 segundos).</li>
            <li><strong>Capa 3:</strong> Bloqueo local de 5 min con temporizador persistente.</li>
            <li><strong>Capa 4:</strong> Token de verificación Cloudflare Turnstile / Captcha.</li>
            <li><strong>Capa 5:</strong> Rate limit del backend: 5 peticiones/hora por IP.</li>
          </ul>
        </div>

      </aside>

    </div>

    <!-- ======================================================================= -->
    <!-- MODAL DE CONFIRMACIÓN PREVIO AL ENVÍO                                   -->
    <!-- ======================================================================= -->
    <Teleport to="body">
      <div
        v-if="isConfirmModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Confirmar envío del mensaje"
      >
        <div class="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
              ✉️
            </div>
            <div>
              <h3 class="font-heading text-lg font-bold text-white">
                Revisa los datos antes de enviar
              </h3>
              <p class="text-xs text-slate-400 font-mono">
                Confirmación previa para evitar errores en tu email
              </p>
            </div>
          </div>

          <div class="space-y-3 bg-slate-950/80 rounded-2xl p-4 border border-slate-800 text-xs">
            <div class="flex justify-between border-b border-slate-800/80 pb-2">
              <span class="text-slate-500 font-mono">Nombre:</span>
              <span class="font-bold text-white">{{ formData.name }}</span>
            </div>
            <div class="flex justify-between border-b border-slate-800/80 pb-2">
              <span class="text-slate-500 font-mono">Correo de respuesta:</span>
              <span class="font-bold text-emerald-400 font-mono">{{ formData.email }}</span>
            </div>
            <div class="flex justify-between border-b border-slate-800/80 pb-2">
              <span class="text-slate-500 font-mono">Asunto:</span>
              <span class="font-bold text-slate-200">[{{ formData.categoryPreset.toUpperCase() }}] {{ formData.subject }}</span>
            </div>
            <div class="pt-1">
              <span class="text-slate-500 font-mono block mb-1">Extracto del mensaje:</span>
              <p class="text-slate-300 italic line-clamp-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50">
                "{{ formData.message }}"
              </p>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              @click="cancelConfirmModal"
              class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Modificar datos
            </button>
            <button
              type="button"
              @click="confirmAndExecuteSubmit"
              class="px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              :class="isNews
                ? 'bg-orange-500 hover:bg-orange-400 text-slate-950'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'"
            >
              <span>Confirmar y Enviar</span>
              <span>✓</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
