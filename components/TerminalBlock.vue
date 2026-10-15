<!--
  components/TerminalBlock.vue
  Bloque de código y terminal con copiado inteligente y protección contra comandos destructivos
  La Guía Linux — Ecosistema laguialinux.com
  Licencia: GNU AGPLv3
  Autor: Raúl Caro Pastorino (https://raupulus.dev)
-->

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  formatCommand,
  isDestructiveCommand,
  type CopyMode,
  type DestructiveCheckResult,
} from '~/utils/terminalGuard'
import DestructiveWarningModal from './DestructiveWarningModal.vue'

const props = withDefaults(
  defineProps<{
    code: string
    language?: string
    title?: string
    showControls?: boolean
    allowCopyModes?: boolean
    showLineNumbers?: boolean
    isDangerous?: boolean
  }>(),
  {
    language: 'bash',
    title: 'bash — terminal',
    showControls: true,
    allowCopyModes: true,
    showLineNumbers: false,
    isDangerous: false,
  }
)

// Estado reactivo
const selectedMode = ref<CopyMode>('clean')
const isCopied = ref(false)
const isCopying = ref(false)
const isMenuOpen = ref(false)
const showSafetyModal = ref(false)
const pendingCommand = ref('')
const destructiveInfo = ref<DestructiveCheckResult | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)

// Detección proactiva de comandos destructivos en el código proporcionado
const detectedDestructive = computed<DestructiveCheckResult>(() => {
  if (props.isDangerous) {
    return {
      isDestructive: true,
      riskLevel: 'critical',
      reason: 'Comando marcado como de alto riesgo.',
    }
  }
  return isDestructiveCommand(props.code)
})

// Líneas para numeración opcional
const codeLines = computed(() => props.code.split('\n'))

// Cierre del menú al hacer clic fuera
function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isMenuOpen.value = false
  }
}

onMounted(() => {
  if (import.meta.client) {
    document.addEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.removeEventListener('click', handleClickOutside)
  }
})

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

// Escritura segura al portapapeles con fallback para entornos sin HTTPS o restringidos
async function writeToClipboard(text: string): Promise<boolean> {
  if (!import.meta.client) return false

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch (err) {
    console.warn('[TerminalBlock] navigator.clipboard falló, usando fallback execCommand:', err)
  }

  // Fallback con elemento textarea temporal
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  } catch (fallbackErr) {
    console.error('[TerminalBlock] No se pudo copiar al portapapeles:', fallbackErr)
    return false
  }
}

async function triggerCopyFeedback() {
  isCopied.value = true
  isCopying.value = false
  setTimeout(() => {
    isCopied.value = false
  }, 2000)
}

// Flujo de copia principal
async function handleCopy(mode: CopyMode = selectedMode.value) {
  selectedMode.value = mode
  isMenuOpen.value = false
  isCopying.value = true

  const formatted = formatCommand(props.code, mode)
  const check = isDestructiveCommand(formatted)

  // Si el comando es destructivo, interceptar con el modal
  if (check.isDestructive) {
    pendingCommand.value = formatted
    destructiveInfo.value = check
    showSafetyModal.value = true
    isCopying.value = false
    return
  }

  // Si no es destructivo, volcar inmediatamente
  const ok = await writeToClipboard(formatted)
  if (ok) {
    await triggerCopyFeedback()
  } else {
    isCopying.value = false
  }
}

// Confirmación desde el modal
async function handleModalConfirm() {
  showSafetyModal.value = false
  if (pendingCommand.value) {
    const ok = await writeToClipboard(pendingCommand.value)
    if (ok) {
      await triggerCopyFeedback()
    }
    pendingCommand.value = ''
    destructiveInfo.value = null
  }
}

// Cancelación desde el modal
function handleModalCancel() {
  showSafetyModal.value = false
  pendingCommand.value = ''
  destructiveInfo.value = null
}
</script>

<template>
  <div
    class="relative my-6 overflow-hidden rounded-2xl bg-slate-950 shadow-2xl transition-all"
    :class="[
      detectedDestructive.isDestructive
        ? detectedDestructive.riskLevel === 'critical'
          ? 'border-2 border-red-500/70'
          : 'border-2 border-amber-500/60'
        : 'border border-slate-800',
    ]"
  >
    <!-- 1. Franja Superior de Advertencia Destructiva (Si aplica) -->
    <div
      v-if="detectedDestructive.isDestructive"
      class="flex items-center justify-between px-4 py-1.5 text-[11px] font-mono border-b"
      :class="
        detectedDestructive.riskLevel === 'critical'
          ? 'bg-red-500/10 border-red-500/30 text-red-300'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
      "
    >
      <span class="flex items-center gap-1.5 font-bold">
        <span>⚠️</span> COMANDO DE ALTO RIESGO: {{ detectedDestructive.reason || 'Operación destructiva' }}
      </span>
      <span class="hidden sm:inline opacity-80">Requiere confirmación previa</span>
    </div>

    <!-- 2. Barra de Control de Ventana y Botón de Copiado -->
    <div
      v-if="showControls"
      class="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400"
    >
      <!-- Puntos de Control macOS (Rojo, Amarillo, Verde) + Título -->
      <div class="flex items-center gap-2">
        <span class="inline-block w-3 h-3 rounded-full bg-red-500/80" title="Cerrar" />
        <span class="inline-block w-3 h-3 rounded-full bg-yellow-500/80" title="Minimizar" />
        <span class="inline-block w-3 h-3 rounded-full bg-green-500/80" title="Maximizar" />
        <span class="ml-2 font-semibold text-slate-300 font-mono text-xs select-none">
          {{ title }}
        </span>
      </div>

      <!-- Botón de Copiado Inteligente con Selector de Modo -->
      <div ref="dropdownRef" class="relative inline-flex items-center p-0.5 rounded-xl bg-slate-800 border border-slate-700">
        <!-- Botón Principal -->
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-lg font-mono text-xs font-bold transition-all cursor-pointer"
          :class="
            isCopied
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
          "
          :title="isCopied ? '¡Copiado al portapapeles!' : 'Copiar comando sin prompts'"
          @click="handleCopy(selectedMode)"
        >
          <Icon v-if="isCopied" name="lucide:check" class="w-3.5 h-3.5" />
          <Icon v-else name="lucide:copy" class="w-3.5 h-3.5" />
          <span>{{ isCopied ? '¡Copiado!' : isCopying ? 'Copiando...' : 'Copiar' }}</span>
        </button>

        <!-- Desplegable de Modos (Si allowCopyModes = true) -->
        <button
          v-if="allowCopyModes"
          type="button"
          class="px-2 py-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white transition-colors rounded-r-lg cursor-pointer"
          title="Opciones de copiado avanzadas"
          aria-label="Opciones de copiado avanzadas"
          :aria-expanded="isMenuOpen"
          @click.stop="toggleMenu"
        >
          <Icon name="lucide:chevron-down" class="w-3.5 h-3.5 transition-transform" :class="{ 'rotate-180': isMenuOpen }" />
        </button>

        <!-- Menú Desplegable Flotante -->
        <div
          v-if="isMenuOpen && allowCopyModes"
          class="absolute right-0 top-full mt-1.5 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-30 text-xs font-mono space-y-0.5 animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            type="button"
            class="w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer"
            :class="selectedMode === 'clean' ? 'bg-slate-800 text-emerald-400 font-bold' : 'hover:bg-slate-800/60 text-slate-200'"
            @click="handleCopy('clean')"
          >
            <span>✓ Copiar limpio (sin prompt)</span>
          </button>

          <button
            type="button"
            class="w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer"
            :class="selectedMode === 'sudo' ? 'bg-slate-800 text-emerald-400 font-bold' : 'hover:bg-slate-800/60 text-slate-300'"
            @click="handleCopy('sudo')"
          >
            <span>Copiar con sudo</span>
          </button>

          <button
            type="button"
            class="w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer"
            :class="selectedMode === 'single-line' ? 'bg-slate-800 text-emerald-400 font-bold' : 'hover:bg-slate-800/60 text-slate-300'"
            @click="handleCopy('single-line')"
          >
            <span>Copiar en una línea (&&)</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 3. Contenedor de Código de Terminal con Numeración Opcional -->
    <div class="relative flex overflow-x-auto">
      <!-- Numeración de Líneas Opcional -->
      <div
        v-if="showLineNumbers"
        class="py-4 pl-4 pr-3 font-mono text-xs sm:text-sm text-slate-400 select-none border-r border-slate-800/60 text-right shrink-0"
      >
        <div v-for="(_, index) in codeLines" :key="index" class="leading-relaxed">
          {{ index + 1 }}
        </div>
      </div>

      <!-- Bloque Preformatado de Comandos -->
      <pre
        class="flex-1 p-4 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed text-slate-200 select-text"
      ><code><slot>{{ code }}</slot></code></pre>
    </div>

    <!-- 4. Modal Interceptor de Seguridad para Comandos Destructivos -->
    <DestructiveWarningModal
      v-model="showSafetyModal"
      :command="pendingCommand"
      :reason="destructiveInfo?.reason"
      :risk-level="destructiveInfo?.riskLevel"
      @confirm="handleModalConfirm"
      @cancel="handleModalCancel"
    />
  </div>
</template>
