<!--
  pages/herramientas/index.vue
  Hub interactivo y suite completa de herramientas sysadmin (100% Client-Side)
  La Guía Linux — Ecosistema laguialinux.com
  Licencia: GNU AGPLv3
  Autor: Raúl Caro Pastorino (https://raupulus.dev)
-->

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  calculateChmod,
  octalToMatrix,
  symbolicToMatrix,
  CHMOD_PRESETS,
  parseCronExpression,
  CRON_PRESETS,
  searchEquivalences,
  EQUIVALENCES_DATABASE,
  evaluateDistroRecommendation,
  type PermissionMatrix,
  type DistroQuizAnswers
} from '~/utils/sysadminTools'

// SEO y Metadatos de la Suite
useHead({
  title: 'Suite de Herramientas Sysadmin Online · La Guía Linux',
  meta: [
    { name: 'description', content: 'Calculadora Chmod/Umask interactiva, Generador Crontab en castellano, Buscador de Equivalencias Windows a Linux y recomendador Distro Finder. 100% en cliente.' },
    { property: 'og:title', content: 'Suite de Herramientas Sysadmin Online · La Guía Linux' },
    { property: 'og:description', content: 'Herramientas interactivas de administración de sistemas procesadas 100% en tu navegador con 0ms de latencia.' },
    { property: 'og:image', content: 'https://laguialinux.com/assets/img/covers/cover_guias.webp' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        inLanguage: 'es',
        name: 'Suite de Herramientas Sysadmin Online · La Guía Linux',
        description: 'Herramientas interactivas en cliente para administración de sistemas GNU/Linux.',
        url: 'https://laguialinux.com/herramientas'
      })
    }
  ]
})

// Control de Pestañas Activas
type ToolTab = 'chmod' | 'cron' | 'equivalencias' | 'distro'
const activeTab = ref<ToolTab>('chmod')
const route = useRoute()

onMounted(() => {
  const hash = route.hash.replace('#', '') as ToolTab
  if (['chmod', 'cron', 'equivalencias', 'distro'].includes(hash)) {
    activeTab.value = hash
  }
})

function setTab(tab: ToolTab) {
  activeTab.value = tab
  if (import.meta.client) {
    history.replaceState(null, '', `#${tab}`)
  }
}

// Feedback de Copia
const copiedNotice = ref<string | null>(null)
function copyText(text: string, label = 'Comando') {
  if (import.meta.client && navigator.clipboard) {
    navigator.clipboard.writeText(text)
    copiedNotice.value = `${label} copiado al portapapeles`
    setTimeout(() => {
      copiedNotice.value = null
    }, 2500)
  }
}

// ============================================================================
// ESTADO HERRAMIENTA 1: CALCULADORA CHMOD / UMASK
// ============================================================================
const chmodMatrix = ref<PermissionMatrix>({
  user: { read: true, write: true, execute: true },
  group: { read: true, write: false, execute: true },
  others: { read: true, write: false, execute: true },
  special: { suid: false, sgid: false, sticky: false }
})

const chmodResult = computed(() => calculateChmod(chmodMatrix.value))

function applyChmodOctalInput(event: Event) {
  const val = (event.target as HTMLInputElement).value
  if (/^[0-7]{3,4}$/.test(val)) {
    chmodMatrix.value = octalToMatrix(val)
  }
}

function applyChmodSymbolicInput(event: Event) {
  const val = (event.target as HTMLInputElement).value
  if (val.length >= 9) {
    chmodMatrix.value = symbolicToMatrix(val)
  }
}

function applyChmodPreset(octal: string) {
  chmodMatrix.value = octalToMatrix(octal)
}

// ============================================================================
// ESTADO HERRAMIENTA 2: GENERADOR CRON
// ============================================================================
const cronMin = ref('0')
const cronHour = ref('2')
const cronDom = ref('*')
const cronMonth = ref('*')
const cronDow = ref('*')
const cronCmd = ref('/usr/local/bin/backup-sistema.sh')

const cronExpression = computed(() =>
  `${cronMin.value.trim() || '*'} ${cronHour.value.trim() || '*'} ${cronDom.value.trim() || '*'} ${cronMonth.value.trim() || '*'} ${cronDow.value.trim() || '*'}`
)

const cronParsed = computed(() => parseCronExpression(cronExpression.value, cronCmd.value))

function applyCronPreset(expr: string) {
  const parts = expr.split(' ')
  if (parts.length === 5) {
    cronMin.value = parts[0]
    cronHour.value = parts[1]
    cronDom.value = parts[2]
    cronMonth.value = parts[3]
    cronDow.value = parts[4]
  }
}

function formatRunDate(d: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

// ============================================================================
// ESTADO HERRAMIENTA 3: EQUIVALENCIAS WINDOWS ↔ LINUX
// ============================================================================
const eqSearchQuery = ref('')
const eqSelectedCategory = ref('')
const eqCategories = ['Ofimática', 'Diseño Gráfico', 'Desarrollo', 'Multimedia', 'Utilidades', 'Internet']

const filteredEquivalences = computed(() =>
  searchEquivalences(eqSearchQuery.value, eqSelectedCategory.value)
)

// ============================================================================
// ESTADO HERRAMIENTA 4: DISTRO FINDER
// ============================================================================
const distroAnswers = ref<DistroQuizAnswers>({
  hardware: 'standard',
  experience: 'novice',
  purpose: 'desktop',
  updateCycle: 'stable'
})

const distroResult = computed(() => evaluateDistroRecommendation(distroAnswers.value))
</script>

<template>
  <main class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
    <!-- Migas de Pan -->
    <nav class="flex items-center gap-2 text-xs font-mono text-slate-400" aria-label="Migas de pan">
      <NuxtLink to="/" class="hover:text-emerald-400 transition-colors">Inicio</NuxtLink>
      <span>/</span>
      <span class="text-white font-semibold">Herramientas Sysadmin</span>
    </nav>

    <!-- Notificación Toast Flotante -->
    <Transition name="fade">
      <div
        v-if="copiedNotice"
        class="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500 text-white text-xs font-mono shadow-2xl flex items-center gap-2"
        role="status"
      >
        <span class="text-emerald-400 font-bold">✓</span>
        {{ copiedNotice }}
      </div>
    </Transition>

    <!-- Hero Header -->
    <div class="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        <div class="lg:col-span-8 space-y-3">
          <div class="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
            <span class="w-2.5 h-2.5 rounded-sm bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            Suite 100% Client-Side · 0ms Latencia · Sin Servidores
          </div>
          <h1 class="text-3xl sm:text-4xl font-black text-white tracking-tight font-heading">
            Herramientas y Utilidades Sysadmin
          </h1>
          <p class="text-slate-400 text-sm sm:text-base leading-relaxed">
            Calculadoras de permisos de consola, generadores de sintaxis crontab, tablas de equivalencias libres y selector de distribuciones. Todo ejecutado localmente en tu navegador.
          </p>
        </div>
        <div class="lg:col-span-4 hidden lg:block">
          <img
            src="/assets/img/covers/cover_guias.webp"
            alt="Herramientas Sysadmin La Guía Linux"
            class="w-full rounded-2xl border border-slate-800 shadow-2xl object-cover aspect-video"
            loading="lazy"
          >
        </div>
      </div>

      <!-- Selector de Pestañas / Tabs -->
      <div class="flex flex-wrap items-center gap-2 pt-6 mt-6 border-t border-slate-800" role="tablist">
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'chmod'"
          @click="setTab('chmod')"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'chmod' ? 'bg-emerald-600 text-slate-950 shadow-md' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          ]"
        >
          <span>🔐</span> Calculadora Permisos Chmod & Umask
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'cron'"
          @click="setTab('cron')"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'cron' ? 'bg-emerald-600 text-slate-950 shadow-md' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          ]"
        >
          <span>⏱️</span> Generador y Validador Crontab
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'equivalencias'"
          @click="setTab('equivalencias')"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'equivalencias' ? 'bg-emerald-600 text-slate-950 shadow-md' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          ]"
        >
          <span>🔄</span> Equivalencias Windows ↔ Linux
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'distro'"
          @click="setTab('distro')"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'distro' ? 'bg-emerald-600 text-slate-950 shadow-md' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          ]"
        >
          <span>🐧</span> Selector de Distro ("Distro Finder")
        </button>
      </div>
    </div>

    <!-- ==================================================================== -->
    <!-- 1. HERRAMIENTA: CALCULADORA CHMOD Y UMASK                           -->
    <!-- ==================================================================== -->
    <section v-show="activeTab === 'chmod'" class="space-y-6" aria-label="Calculadora Chmod">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Matriz Interactiva -->
        <div class="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <h2 class="text-lg font-bold text-white flex items-center gap-2">
                <span>🔐</span> Matriz de Permisos (rwx)
              </h2>
              <p class="text-xs text-slate-400 mt-0.5">Sincronización bidireccional inmediata en tiempo real.</p>
            </div>
            <!-- Presets Rápidos -->
            <div class="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              <button
                v-for="p in CHMOD_PRESETS"
                :key="p.octal"
                type="button"
                @click="applyChmodPreset(p.octal)"
                :class="[
                  'px-2.5 py-1 rounded text-xs border transition-colors cursor-pointer',
                  p.badge === 'peligro' ? 'bg-red-950/60 border-red-800 text-red-300 hover:bg-red-900' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                ]"
              >
                {{ p.label }}
              </button>
            </div>
          </div>

          <!-- Tabla de Checkboxes -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-mono">
              <thead>
                <tr class="text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                  <th class="py-2.5">Nivel</th>
                  <th class="py-2.5 text-center">Lectura (r / 4)</th>
                  <th class="py-2.5 text-center">Escritura (w / 2)</th>
                  <th class="py-2.5 text-center">Ejecución (x / 1)</th>
                  <th class="py-2.5 text-right">Octal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                <!-- Propietario -->
                <tr>
                  <td class="py-3 font-bold text-white flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Propietario (u)
                  </td>
                  <td class="py-3 text-center">
                    <input type="checkbox" v-model="chmodMatrix.user.read" class="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer">
                  </td>
                  <td class="py-3 text-center">
                    <input type="checkbox" v-model="chmodMatrix.user.write" class="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer">
                  </td>
                  <td class="py-3 text-center">
                    <input type="checkbox" v-model="chmodMatrix.user.execute" class="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer">
                  </td>
                  <td class="py-3 text-right font-bold text-emerald-400">{{ chmodResult.octal3[0] }}</td>
                </tr>
                <!-- Grupo -->
                <tr>
                  <td class="py-3 font-bold text-white flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-cyan-400"></span> Grupo (g)
                  </td>
                  <td class="py-3 text-center">
                    <input type="checkbox" v-model="chmodMatrix.group.read" class="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer">
                  </td>
                  <td class="py-3 text-center">
                    <input type="checkbox" v-model="chmodMatrix.group.write" class="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer">
                  </td>
                  <td class="py-3 text-center">
                    <input type="checkbox" v-model="chmodMatrix.group.execute" class="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer">
                  </td>
                  <td class="py-3 text-right font-bold text-cyan-400">{{ chmodResult.octal3[1] }}</td>
                </tr>
                <!-- Otros -->
                <tr>
                  <td class="py-3 font-bold text-white flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-slate-400"></span> Otros (o)
                  </td>
                  <td class="py-3 text-center">
                    <input type="checkbox" v-model="chmodMatrix.others.read" class="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer">
                  </td>
                  <td class="py-3 text-center">
                    <input type="checkbox" v-model="chmodMatrix.others.write" class="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer">
                  </td>
                  <td class="py-3 text-center">
                    <input type="checkbox" v-model="chmodMatrix.others.execute" class="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer">
                  </td>
                  <td class="py-3 text-right font-bold text-slate-300">{{ chmodResult.octal3[2] }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Bits Especiales -->
          <div class="pt-4 border-t border-slate-800 space-y-3">
            <span class="text-xs font-mono uppercase tracking-wider text-slate-400 block font-semibold">Bits Especiales (Avanzado)</span>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input type="checkbox" v-model="chmodMatrix.special.suid" class="rounded text-emerald-500 bg-slate-950 border-slate-700">
                <span>SUID (4000)</span>
              </label>
              <label class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input type="checkbox" v-model="chmodMatrix.special.sgid" class="rounded text-emerald-500 bg-slate-950 border-slate-700">
                <span>SGID (2000)</span>
              </label>
              <label class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input type="checkbox" v-model="chmodMatrix.special.sticky" class="rounded text-emerald-500 bg-slate-950 border-slate-700">
                <span>Sticky Bit (1000)</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Panel de Resultados -->
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 class="text-sm font-mono font-bold uppercase tracking-wider text-slate-400">
                Resultado Generado
              </h3>
              <span v-if="chmodResult.securityWarning" class="px-2 py-0.5 rounded text-[10px] bg-red-950/80 text-red-300 border border-red-700 font-mono">
                ⚠️ Atención
              </span>
              <span v-else class="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-mono">
                Estándar Seguro
              </span>
            </div>

            <!-- Valores en Cuadros -->
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <div class="text-[11px] font-mono text-slate-400 mb-1">Octal (3 / 4 Dígitos)</div>
                <div class="text-3xl font-black font-mono text-emerald-400">{{ chmodResult.octal4 }}</div>
                <input
                  type="text"
                  :value="chmodResult.octal4"
                  @input="applyChmodOctalInput"
                  placeholder="Ej: 755"
                  class="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-center font-mono text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                >
              </div>
              <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <div class="text-[11px] font-mono text-slate-400 mb-1">Notación Simbólica</div>
                <div class="text-xl font-bold font-mono text-cyan-300 mt-1">{{ chmodResult.symbolic }}</div>
                <input
                  type="text"
                  :value="chmodResult.symbolic"
                  @input="applyChmodSymbolicInput"
                  placeholder="Ej: -rwxr-xr-x"
                  class="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-center font-mono text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                >
              </div>
            </div>

            <!-- Comando Listo para Copiar -->
            <div>
              <div class="text-[11px] font-mono text-slate-400 mb-2">Comando de Aplicación:</div>
              <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 font-mono text-xs">
                <code class="text-emerald-400 truncate">{{ chmodResult.chmodCommand }}</code>
                <button
                  type="button"
                  @click="copyText(chmodResult.chmodCommand, 'Comando chmod')"
                  class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors shrink-0 cursor-pointer"
                >
                  Copiar
                </button>
              </div>
            </div>

            <!-- Advertencia si existe -->
            <div v-if="chmodResult.securityWarning" class="p-3.5 rounded-2xl bg-red-950/40 border border-red-800/80 text-xs text-red-200">
              {{ chmodResult.securityWarning }}
            </div>

            <!-- Explicación Humana -->
            <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong class="text-white block mb-1">Explicación Semántica:</strong>
              {{ chmodResult.humanExplanation }}
            </div>

            <!-- Umask Inverso y Permisos Efectivos -->
            <div class="space-y-2 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
              <div class="flex items-center justify-between">
                <span>Máscara Umask complementaria:</span>
                <strong class="text-white">umask {{ chmodResult.suggestedUmask }}</strong>
              </div>
              <div class="flex items-center justify-between text-[11px]">
                <span>Efectivo Directorios (base 0777):</span>
                <code class="text-emerald-400">{{ chmodResult.dirEffective }}</code>
              </div>
              <div class="flex items-center justify-between text-[11px]">
                <span>Efectivo Ficheros (base 0666):</span>
                <code class="text-cyan-400">{{ chmodResult.fileEffective }}</code>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ==================================================================== -->
    <!-- 2. HERRAMIENTA: GENERADOR Y VALIDADOR CRONTAB                        -->
    <!-- ==================================================================== -->
    <section v-show="activeTab === 'cron'" class="space-y-6" aria-label="Generador Cron">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div class="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 class="text-lg font-bold text-white flex items-center gap-2">
                <span>⏱️</span> Campos de Programación Cron (5 campos)
              </h2>
              <p class="text-xs text-slate-400 mt-0.5">Sintaxis estándar de crontab para automatización periódica.</p>
            </div>
          </div>

          <!-- Presets Rápidos -->
          <div>
            <span class="text-xs font-mono text-slate-400 block mb-2 font-semibold uppercase tracking-wider">Recetas Comunes (Presets):</span>
            <div class="flex flex-wrap gap-2 text-xs font-mono">
              <button
                v-for="preset in CRON_PRESETS"
                :key="preset.expression"
                type="button"
                @click="applyCronPreset(preset.expression)"
                class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
                :title="preset.description"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <!-- 5 Campos Editables -->
          <div class="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            <div>
              <label class="text-[11px] font-mono text-slate-400 block mb-1">Minuto (0-59)</label>
              <input v-model="cronMin" type="text" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-center text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500">
            </div>
            <div>
              <label class="text-[11px] font-mono text-slate-400 block mb-1">Hora (0-23)</label>
              <input v-model="cronHour" type="text" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-center text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500">
            </div>
            <div>
              <label class="text-[11px] font-mono text-slate-400 block mb-1">Día Mes (1-31)</label>
              <input v-model="cronDom" type="text" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-center text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500">
            </div>
            <div>
              <label class="text-[11px] font-mono text-slate-400 block mb-1">Mes (1-12)</label>
              <input v-model="cronMonth" type="text" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-center text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500">
            </div>
            <div>
              <label class="text-[11px] font-mono text-slate-400 block mb-1">Día Sem (0-6)</label>
              <input v-model="cronDow" type="text" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-center text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500">
            </div>
          </div>

          <!-- Comando a Ejecutar -->
          <div>
            <label class="text-xs font-mono text-slate-400 block mb-1.5">Comando o Script a ejecutar:</label>
            <input v-model="cronCmd" type="text" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500">
          </div>
        </div>

        <!-- Panel de Resultados Cron -->
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 class="text-sm font-mono font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-800">
              Traducción y Línea Crontab
            </h3>

            <!-- Expresión -->
            <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div class="text-[11px] font-mono text-slate-400 mb-1">Expresión Cron resultante:</div>
              <div class="text-3xl font-black font-mono text-amber-400 tracking-wider">{{ cronExpression }}</div>
            </div>

            <!-- Significado en Lenguaje Natural -->
            <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1 leading-relaxed">
              <div class="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Significado en Lenguaje Natural:</div>
              <p class="text-sm font-semibold text-white">{{ cronParsed.humanExplanation }}</p>
            </div>

            <!-- Línea Completa Lista para Copiar -->
            <div>
              <div class="text-[11px] font-mono text-slate-400 mb-2">Línea completa para crontab -e:</div>
              <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 font-mono text-xs">
                <code class="text-emerald-400 select-all truncate">{{ cronParsed.fullLine }}</code>
                <button
                  type="button"
                  @click="copyText(cronParsed.fullLine, 'Línea de crontab')"
                  class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors shrink-0 cursor-pointer"
                >
                  Copiar
                </button>
              </div>
            </div>

            <!-- Próximas 5 Ejecuciones -->
            <div class="pt-3 border-t border-slate-800 space-y-2">
              <span class="text-xs font-mono uppercase tracking-wider text-slate-400 block font-semibold">Próximas 5 Ejecuciones Calculadas:</span>
              <ul v-if="cronParsed.nextRuns.length > 0" class="space-y-1.5 font-mono text-xs text-slate-300">
                <li v-for="(run, idx) in cronParsed.nextRuns" :key="idx" class="flex items-center gap-2 p-1.5 rounded bg-slate-900/70 border border-slate-800/80">
                  <span class="text-emerald-400 font-bold">#{{ idx + 1 }}</span>
                  <span>{{ formatRunDate(run) }}</span>
                </li>
              </ul>
              <div v-else class="text-xs text-slate-500 italic">
                No se han podido proyectar próximas ejecuciones con los parámetros indicados.
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ==================================================================== -->
    <!-- 3. HERRAMIENTA: EQUIVALENCIAS WINDOWS ↔ LINUX                        -->
    <!-- ==================================================================== -->
    <section v-show="activeTab === 'equivalencias'" class="space-y-6" aria-label="Equivalencias Windows y Linux">
      <div class="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 class="text-lg font-bold text-white flex items-center gap-2">
              <span>🔄</span> Catálogo de Alternativas Libres Windows ↔ Linux
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">Encuentra reemplazos libres y nativos para software privativo común.</p>
          </div>

          <!-- Barra de Búsqueda Instantánea -->
          <div class="relative w-full sm:w-80">
            <input
              v-model="eqSearchQuery"
              type="text"
              placeholder="Buscar programa (ej. Photoshop, PuTTY, Office)..."
              class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            >
            <span class="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
          </div>
        </div>

        <!-- Filtros por Categoría -->
        <div class="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            @click="eqSelectedCategory = ''"
            :class="[
              'px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer',
              !eqSelectedCategory ? 'bg-emerald-600 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            ]"
          >
            Todas ({{ EQUIVALENCES_DATABASE.length }})
          </button>
          <button
            v-for="cat in eqCategories"
            :key="cat"
            type="button"
            @click="eqSelectedCategory = cat"
            :class="[
              'px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer',
              eqSelectedCategory === cat ? 'bg-emerald-600 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            ]"
          >
            {{ cat }}
          </button>
        </div>

        <!-- Rejilla de Tarjetas -->
        <div v-if="filteredEquivalences.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="item in filteredEquivalences"
            :key="item.id"
            class="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div class="flex items-center justify-between text-[11px] font-mono mb-2">
                <span class="text-slate-400">{{ item.category }}</span>
                <span class="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold">100% Libre</span>
              </div>
              <div class="text-sm font-bold text-slate-300">
                Windows: <span class="line-through text-slate-400">{{ item.windowsApp }}</span>
              </div>
              
              <!-- Alternativas Linux -->
              <div class="space-y-3 mt-3">
                <div v-for="alt in item.linuxAlternatives" :key="alt.name" class="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="font-extrabold text-white text-sm flex items-center gap-1.5">
                      <span class="text-emerald-400 font-mono">➜</span> {{ alt.name }}
                    </span>
                    <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{{ alt.license }}</span>
                  </div>
                  <p class="text-xs text-slate-400 leading-relaxed">{{ alt.notes }}</p>
                  
                  <!-- Comandos de Instalación -->
                  <div v-if="alt.installCommands.apt" class="pt-2 border-t border-slate-800">
                    <div class="text-[10px] font-mono text-slate-500 mb-1">Comando (APT):</div>
                    <div class="flex items-center justify-between gap-2 p-1.5 rounded bg-slate-900 font-mono text-[11px] text-emerald-400">
                      <code class="truncate">{{ alt.installCommands.apt }}</code>
                      <button type="button" @click="copyText(alt.installCommands.apt, 'Comando apt')" class="text-slate-400 hover:text-white cursor-pointer" title="Copiar comando">📋</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400">
          No se encontraron alternativas para los términos de búsqueda indicados.
        </div>

      </div>
    </section>

    <!-- ==================================================================== -->
    <!-- 4. HERRAMIENTA: SELECTOR DE DISTRO ("DISTRO FINDER")                -->
    <!-- ==================================================================== -->
    <section v-show="activeTab === 'distro'" class="space-y-6" aria-label="Selector de Distribuciones">
      <div class="max-w-4xl mx-auto bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8">
        
        <div class="text-center max-w-xl mx-auto space-y-2">
          <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono uppercase font-bold">
            Cuestionario Guiado en 4 Pasos
          </span>
          <h2 class="text-2xl font-black text-white font-heading">Descubre tu Distribución Linux Ideal</h2>
          <p class="text-xs text-slate-400">
            Ajusta las opciones según tu nivel y propósito para obtener una recomendación algorítmica objetiva.
          </p>
        </div>

        <div class="space-y-6 text-xs">
          <!-- Pregunta 1: Hardware -->
          <div class="space-y-2">
            <label class="font-bold text-white font-mono text-sm block">1. ¿Qué características tiene tu equipo?</label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                @click="distroAnswers.hardware = 'legacy'"
                :class="[
                  'p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                  distroAnswers.hardware === 'legacy' ? 'border-emerald-500 bg-emerald-950/20' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                ]"
              >
                <div class="font-bold text-white mb-0.5">PC Antiguo o Modesto</div>
                <div class="text-[11px] text-slate-400">&lt; 4 GB RAM, procesadores antiguos de bajo consumo.</div>
              </button>
              <button
                type="button"
                @click="distroAnswers.hardware = 'standard'"
                :class="[
                  'p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                  distroAnswers.hardware === 'standard' ? 'border-emerald-500 bg-emerald-950/20' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                ]"
              >
                <div class="font-bold text-white mb-0.5">PC Estándar / Portátil Común</div>
                <div class="text-[11px] text-slate-400">8 - 16 GB RAM, Intel/AMD común para trabajo.</div>
              </button>
              <button
                type="button"
                @click="distroAnswers.hardware = 'modern'"
                :class="[
                  'p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                  distroAnswers.hardware === 'modern' ? 'border-emerald-500 bg-emerald-950/20' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                ]"
              >
                <div class="font-bold text-white mb-0.5">PC Moderno / Gaming / Workstation</div>
                <div class="text-[11px] text-slate-400">&gt; 16 GB RAM, gráfica dedicada NVIDIA o AMD.</div>
              </button>
            </div>
          </div>

          <!-- Pregunta 2: Experiencia -->
          <div class="space-y-2">
            <label class="font-bold text-white font-mono text-sm block">2. ¿Cuál es tu experiencia en GNU/Linux?</label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                @click="distroAnswers.experience = 'novice'"
                :class="[
                  'p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                  distroAnswers.experience === 'novice' ? 'border-emerald-500 bg-emerald-950/20' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                ]"
              >
                <div class="font-bold text-white mb-0.5">Principiante / Novato</div>
                <div class="text-[11px] text-slate-400">Vengo de Windows/Mac y busco interfaz intuitiva sin tocar terminal.</div>
              </button>
              <button
                type="button"
                @click="distroAnswers.experience = 'intermediate'"
                :class="[
                  'p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                  distroAnswers.experience === 'intermediate' ? 'border-emerald-500 bg-emerald-950/20' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                ]"
              >
                <div class="font-bold text-white mb-0.5">Intermedio</div>
                <div class="text-[11px] text-slate-400">Manejo comandos básicos y busco equilibrio y personalización.</div>
              </button>
              <button
                type="button"
                @click="distroAnswers.experience = 'sysadmin'"
                :class="[
                  'p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                  distroAnswers.experience === 'sysadmin' ? 'border-emerald-500 bg-emerald-950/20' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                ]"
              >
                <div class="font-bold text-white mb-0.5">Sysadmin / Avanzado</div>
                <div class="text-[11px] text-slate-400">Control absoluto, empaquetado y servicios en consola.</div>
              </button>
            </div>
          </div>

          <!-- Pregunta 3: Propósito -->
          <div class="space-y-2">
            <label class="font-bold text-white font-mono text-sm block">3. ¿Cuál será el uso primordial?</label>
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <button
                type="button"
                @click="distroAnswers.purpose = 'desktop'"
                :class="[
                  'p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                  distroAnswers.purpose === 'desktop' ? 'border-emerald-500 bg-emerald-950/20' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                ]"
              >
                <div class="font-bold text-white mb-0.5">Escritorio Diario</div>
                <div class="text-[11px] text-slate-400">Navegación, multimedia y ofimática.</div>
              </button>
              <button
                type="button"
                @click="distroAnswers.purpose = 'gaming'"
                :class="[
                  'p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                  distroAnswers.purpose === 'gaming' ? 'border-emerald-500 bg-emerald-950/20' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                ]"
              >
                <div class="font-bold text-white mb-0.5">Gaming / Steam</div>
                <div class="text-[11px] text-slate-400">Proton, drivers NVIDIA y rendimiento GPU.</div>
              </button>
              <button
                type="button"
                @click="distroAnswers.purpose = 'development'"
                :class="[
                  'p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                  distroAnswers.purpose === 'development' ? 'border-emerald-500 bg-emerald-950/20' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                ]"
              >
                <div class="font-bold text-white mb-0.5">Desarrollo</div>
                <div class="text-[11px] text-slate-400">Docker, programación y herramientas CLI.</div>
              </button>
              <button
                type="button"
                @click="distroAnswers.purpose = 'server'"
                :class="[
                  'p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                  distroAnswers.purpose === 'server' ? 'border-emerald-500 bg-emerald-950/20' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                ]"
              >
                <div class="font-bold text-white mb-0.5">Servidor / Homelab</div>
                <div class="text-[11px] text-slate-400">Estabilidad 24/7 sin entorno gráfico.</div>
              </button>
            </div>
          </div>

          <!-- Pregunta 4: Ciclo de Actualización -->
          <div class="space-y-2">
            <label class="font-bold text-white font-mono text-sm block">4. ¿Qué ciclo de actualización prefieres?</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                @click="distroAnswers.updateCycle = 'stable'"
                :class="[
                  'p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                  distroAnswers.updateCycle === 'stable' ? 'border-emerald-500 bg-emerald-950/20' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                ]"
              >
                <div class="font-bold text-white mb-0.5">Estabilidad Roca (Ciclo Fijo / LTS)</div>
                <div class="text-[11px] text-slate-400">Paquetes probados y consistentes, sin sorpresas ni roturas.</div>
              </button>
              <button
                type="button"
                @click="distroAnswers.updateCycle = 'rolling'"
                :class="[
                  'p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                  distroAnswers.updateCycle === 'rolling' ? 'border-emerald-500 bg-emerald-950/20' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                ]"
              >
                <div class="font-bold text-white mb-0.5">Última Versión (Rolling Release)</div>
                <div class="text-[11px] text-slate-400">El kernel más reciente y versiones actualizadas al día.</div>
              </button>
            </div>
          </div>
        </div>

        <!-- Tarjetas de Recomendación Algorítmica -->
        <div class="space-y-4 pt-4 border-t border-slate-800">
          <!-- Recomendación Principal -->
          <div class="p-6 rounded-3xl bg-slate-900 border border-emerald-500/50 space-y-4 shadow-xl">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                🎯 Recomendación Principal (Afinidad {{ distroResult.primary.matchScore }}%)
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                {{ distroResult.primary.distro.badge }}
              </span>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 class="text-2xl font-black text-white font-heading">{{ distroResult.primary.distro.name }}</h3>
                <p class="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">{{ distroResult.primary.reason }}</p>
                <div class="flex flex-wrap gap-2 mt-3 text-[11px] font-mono text-slate-400">
                  <span>Escritorio: <strong class="text-white">{{ distroResult.primary.distro.desktopEnvironment }}</strong></span>
                  <span>·</span>
                  <span>Paquetes: <strong class="text-white">{{ distroResult.primary.distro.packageManager }}</strong></span>
                </div>
              </div>
              <div class="flex flex-col gap-2 shrink-0">
                <a
                  :href="distroResult.primary.distro.downloadUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
                >
                  Descargar Oficial ↗
                </a>
                <NuxtLink
                  :to="`/categoria/${distroResult.primary.distro.guidesSlug}`"
                  class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs text-center transition-colors cursor-pointer"
                >
                  Ver Guías Relacionadas
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Recomendación Secundaria -->
          <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="text-[11px] font-mono text-slate-400 mb-1">Alternativa Secundaria (Afinidad {{ distroResult.secondary.matchScore }}%):</div>
              <h4 class="text-lg font-bold text-white font-heading">{{ distroResult.secondary.distro.name }}</h4>
              <p class="text-xs text-slate-300 mt-1 max-w-lg">{{ distroResult.secondary.reason }}</p>
            </div>
            <a
              :href="distroResult.secondary.distro.downloadUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold shrink-0"
            >
              Sitio Oficial ↗
            </a>
          </div>
        </div>

      </div>
    </section>

  </main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
