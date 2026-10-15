<!--
  components/CveAlertBanner.vue
  Banner prominente de alerta de seguridad para vulnerabilidades críticas (CVSS >= 9.0) (MOD-16)
  La Guía Linux News — Ecosistema laguialinux.com
  Licencia: GNU AGPLv3
  Autor: Raúl Caro Pastorino (https://raupulus.dev)
-->

<script setup lang="ts">
import { ref, onMounted } from 'vue'

export interface CveAlertData {
  cveId: string
  title: string
  cvssScore: number
  summary: string
  mitigationSlug: string
}

interface Props {
  alert?: CveAlertData | null
}

const props = withDefaults(defineProps<Props>(), {
  alert: () => ({
    cveId: 'CVE-2024-6387',
    title: 'RegreSSHion: Ejecución Remota de Código en OpenSSH',
    cvssScore: 9.8,
    summary: 'Vulnerabilidad crítica en servidores OpenSSH que permite ejecución remota como root.',
    mitigationSlug: '/noticia/alerta-seguridad-cve-2024-6387-regresshion-openssh'
  })
})

const DISMISSED_KEY = 'lgl_dismissed_cves'
const isVisible = ref(false)

onMounted(() => {
  if (!props.alert) return

  if (import.meta.client) {
    try {
      const stored = localStorage.getItem(DISMISSED_KEY)
      const dismissed: string[] = stored ? JSON.parse(stored) : []
      if (!dismissed.includes(props.alert.cveId)) {
        isVisible.value = true
      }
    } catch {
      isVisible.value = true
    }
  }
})

function dismissAlert() {
  if (import.meta.client && props.alert) {
    try {
      const stored = localStorage.getItem(DISMISSED_KEY)
      const dismissed: string[] = stored ? JSON.parse(stored) : []
      if (!dismissed.includes(props.alert.cveId)) {
        dismissed.push(props.alert.cveId)
        localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed))
      }
    } catch {
      // Ignorar fallo de almacenamiento
    }
  }
  isVisible.value = false
}
</script>

<template>
  <aside
    v-if="isVisible && alert"
    class="max-w-7xl mx-auto w-full px-4"
    role="alert"
    aria-live="assertive"
  >
    <div class="p-3.5 sm:p-4 rounded-2xl bg-red-950/80 border border-red-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xl text-red-100">
      
      <!-- Detalle de la Alerta -->
      <div class="flex items-start sm:items-center gap-2.5">
        <span class="flex h-3 w-3 relative shrink-0 mt-0.5 sm:mt-0">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <span class="px-2 py-0.5 rounded-md bg-red-600 text-white font-mono font-black text-[10px] tracking-wider uppercase shrink-0 shadow-sm">
          ALERTA CVE CRÍTICA
        </span>
        <div class="space-y-0.5">
          <span class="font-mono text-red-300 font-bold mr-1">{{ alert.cveId }} (CVSS {{ alert.cvssScore }}):</span>
          <span class="text-slate-200">{{ alert.title }} — {{ alert.summary }}</span>
        </div>
      </div>

      <!-- Acciones (Ver Mitigación y Cerrar) -->
      <div class="flex items-center gap-3 shrink-0 self-end sm:self-center">
        <NuxtLink
          :to="alert.mitigationSlug"
          class="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold font-mono text-[11px] transition-colors shadow flex items-center gap-1 cursor-pointer"
        >
          <span>Ver Mitigación y Parche</span>
          <span>→</span>
        </NuxtLink>
        <button
          type="button"
          @click="dismissAlert"
          class="text-red-300 hover:text-white p-1 rounded-lg hover:bg-red-900/50 transition-colors cursor-pointer"
          aria-label="Descartar esta alerta de seguridad"
          title="Descartar alerta"
        >
          ✕
        </button>
      </div>

    </div>
  </aside>
</template>
