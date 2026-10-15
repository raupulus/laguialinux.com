<!--
  components/KernelWatcherWidget.vue
  Widget interactivo de versiones activas del núcleo Linux con caché en localStorage y fallback offline (MOD-15)
  La Guía Linux News — Ecosistema laguialinux.com
  Licencia: GNU AGPLv3
  Autor: Raúl Caro Pastorino (https://raupulus.dev)
-->

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface KernelState {
  mainline: string
  stable: string
  lts: string[]
  isStale?: boolean
}

const STORAGE_DATA_KEY = 'lgl_kernel_releases_data'
const STORAGE_TS_KEY = 'lgl_kernel_releases_ts'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 horas

const FALLBACK_KERNEL_DATA: KernelState = {
  mainline: '6.14-rc1',
  stable: '6.13.2',
  lts: ['6.6.77', '6.1.128'],
  isStale: true
}

const kernelData = ref<KernelState>(FALLBACK_KERNEL_DATA)
const isLoading = ref(false)

onMounted(async () => {
  // 1. Revisar caché local en cliente (0ms)
  if (import.meta.client) {
    try {
      const stored = localStorage.getItem(STORAGE_DATA_KEY)
      const storedTs = localStorage.getItem(STORAGE_TS_KEY)
      const now = Date.now()

      if (stored && storedTs && (now - parseInt(storedTs, 10) < CACHE_TTL_MS)) {
        kernelData.value = JSON.parse(stored)
        return
      }
    } catch {
      // Ignorar fallo de parseo y continuar a la red
    }
  }

  // 2. Fetch asíncrono hacia el proxy interno /api/kernel-releases
  isLoading.value = true
  try {
    const res = await $fetch<{ mainline: string; stable: string; lts: string[] }>('/api/kernel-releases')
    if (res && res.mainline) {
      const parsed: KernelState = {
        mainline: res.mainline,
        stable: res.stable,
        lts: res.lts || [],
        isStale: false
      }
      kernelData.value = parsed
      if (import.meta.client) {
        localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(parsed))
        localStorage.setItem(STORAGE_TS_KEY, Date.now().toString())
      }
    }
  } catch {
    kernelData.value.isStale = true
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="w-full">
    <aside
      class="max-w-7xl mx-auto px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono shadow-md"
      aria-label="Estado actual de versiones del Kernel Linux"
    >
      <div class="flex items-center gap-2 text-slate-300">
        <span class="font-bold text-white flex items-center gap-1.5">
          <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
          </svg>
          Kernel Watcher:
        </span>
        <span class="text-slate-500 hidden lg:inline">Versiones oficiales activas de kernel.org</span>
        <span v-if="kernelData.isStale" class="text-[10px] text-amber-500/80 italic hidden sm:inline">(snapshot)</span>
      </div>

      <div class="flex flex-wrap items-center gap-2.5 text-[11px]">
        <!-- Mainline -->
        <span class="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
          Mainline: <strong class="font-bold text-amber-200">{{ kernelData.mainline }}</strong>
        </span>

        <!-- Stable -->
        <span class="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
          Stable: <strong class="font-bold text-emerald-200">{{ kernelData.stable }}</strong>
        </span>

        <!-- Longterm (LTS) -->
        <span class="px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300">
          LTS: <strong class="font-bold text-blue-200">{{ kernelData.lts.join(' · ') || '6.6 · 6.1' }}</strong>
        </span>

        <!-- Enlace a kernel.org -->
        <a
          href="https://www.kernel.org"
          target="_blank"
          rel="noopener noreferrer"
          class="text-slate-400 hover:text-slate-200 text-[10px] underline ml-1 font-sans transition-colors"
          aria-label="Consultar árbol de versiones en kernel.org (abre en nueva pestaña)"
        >
          kernel.org ↗
        </a>
      </div>
    </aside>
  </div>
</template>
