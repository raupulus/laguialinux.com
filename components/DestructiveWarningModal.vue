<!--
  components/DestructiveWarningModal.vue
  Modal accesible de confirmación para comandos de alto riesgo destructivo
  La Guía Linux — Ecosistema laguialinux.com
  Licencia: GNU AGPLv3
  Autor: Raúl Caro Pastorino (https://raupulus.dev)
-->

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { RiskLevel } from '~/utils/terminalGuard'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    command: string
    reason?: string
    riskLevel?: RiskLevel
  }>(),
  {
    reason: 'Operación de alto riesgo sobre el sistema o almacenamiento detectada.',
    riskLevel: 'critical',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const modalCardRef = ref<HTMLElement | null>(null)
const cancelButtonRef = ref<HTMLButtonElement | null>(null)
let previousActiveElement: HTMLElement | null = null

function closeModal() {
  emit('update:modelValue', false)
  emit('cancel')
}

function confirmAction() {
  emit('update:modelValue', false)
  emit('confirm')
}

// Trampa de foco accesible y captura de tecla Esc
function handleKeyDown(e: KeyboardEvent) {
  if (!props.modelValue) return

  if (e.key === 'Escape') {
    e.preventDefault()
    closeModal()
    return
  }

  if (e.key === 'Tab' && modalCardRef.value) {
    const focusable = modalCardRef.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (!import.meta.client) return

    if (isOpen) {
      previousActiveElement = document.activeElement as HTMLElement | null
      document.body.style.overflow = 'hidden'
      await nextTick()
      cancelButtonRef.value?.focus()
    } else {
      document.body.style.overflow = ''
      previousActiveElement?.focus()
      previousActiveElement = null
    }
  }
)

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('keydown', handleKeyDown)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', handleKeyDown)
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="destructive-modal-title"
        aria-describedby="destructive-modal-desc"
        @click.self="closeModal"
      >
        <div
          ref="modalCardRef"
          class="w-full max-w-md p-6 space-y-4 border-2 rounded-3xl shadow-2xl bg-slate-900 border-amber-500/80"
          :class="{
            'border-red-500/90': riskLevel === 'critical',
            'border-amber-500/80': riskLevel === 'danger',
          }"
        >
          <!-- Cabecera de Alerta con Icono Pulsante -->
          <div class="flex items-start gap-3">
            <div
              class="flex items-center justify-center w-10 h-10 rounded-2xl shrink-0"
              :class="riskLevel === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'"
            >
              <span class="text-2xl animate-pulse">⚠️</span>
            </div>
            <div>
              <h3 id="destructive-modal-title" class="text-base font-bold text-white">
                Comando Potencialmente Destructivo
              </h3>
              <p class="font-mono text-xs text-amber-300/90 mt-0.5">
                {{ reason }}
              </p>
            </div>
          </div>

          <!-- Mensaje Explicativo de Riesgo -->
          <p id="destructive-modal-desc" class="text-xs leading-relaxed text-slate-300">
            Este comando realiza operaciones irreversibles sobre el sistema operativo o dispositivos de bloques.
            Si se ejecuta sobre el disco o partición errónea (como <code class="font-mono text-amber-400">/dev/sda</code> o <code class="font-mono text-amber-400">/dev/nvme0n1</code>),
            <strong class="text-white font-semibold">se perderán datos de forma irrecuperable</strong>.
            Verifica meticulosamente los identificadores de dispositivo antes de continuar.
          </p>

          <!-- Previsualización del Comando a Copiar -->
          <div class="p-3 border rounded-xl bg-slate-950 border-slate-800 text-[11px] font-mono">
            <span class="text-slate-400">Comando a copiar:</span>
            <code class="block mt-1 break-all overflow-x-auto max-h-24 text-emerald-400 select-all font-mono leading-relaxed">
              {{ command }}
            </code>
          </div>

          <!-- Botones de Acción (Foco inicial seguro en Cancelar) -->
          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              ref="cancelButtonRef"
              type="button"
              class="px-4 py-2 font-mono text-xs font-medium transition-colors rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 focus:ring-2 focus:ring-slate-400 focus:outline-none cursor-pointer"
              @click="closeModal"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="px-4 py-2 font-mono text-xs font-bold transition-colors rounded-xl focus:ring-2 focus:outline-none cursor-pointer"
              :class="
                riskLevel === 'critical'
                  ? 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-400'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 focus:ring-amber-300'
              "
              @click="confirmAction"
            >
              Entiendo el riesgo y deseo copiar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
