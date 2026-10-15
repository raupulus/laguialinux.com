<script setup lang="ts">
/**
 * error.vue
 * Gestor universal de errores HTTP (404, 500) en el ecosistema La Guía Linux
 * Licencia: GNU AGPLv3
 * Autor: Raúl Caro Pastorino (https://raupulus.dev)
 */

import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { platform, isNews } = usePlatform()

const statusCode = computed(() => Number(props.error?.statusCode) || 404)
const is404 = computed(() => statusCode.value === 404)

const errorMessage = computed(() => {
  if (is404.value) {
    return 'Vaya... Este nodo no responde en el filesystem'
  }
  return props.error?.statusMessage || 'Ha ocurrido una incidencia técnica en el servidor'
})

const rescueQuery = ref('')
const router = useRouter()

const handleRescueSearch = () => {
  const q = rescueQuery.value.trim()
  if (q) {
    clearError({ redirect: `/buscar?q=${encodeURIComponent(q)}` })
  }
}

const handleClearError = () => {
  clearError({ redirect: '/' })
}

useSeoMeta({
  title: () => `${statusCode.value} - ${is404.value ? 'Nodo no encontrado' : 'Error del sistema'} · ${platform.value.name}`,
  robots: 'noindex, follow',
})
</script>

<template>
  <div class="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-body selection:bg-emerald-500 selection:text-slate-950">
    <!-- BARRA SUPERIOR DE ECOSISTEMA -->
    <header class="bg-slate-950 border-b border-slate-800 px-4 lg:px-8 py-3">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-3 group" @click="handleClearError">
          <div
            class="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md text-base"
            :class="isNews ? 'bg-orange-600' : 'bg-emerald-600'"
          >
            🐧
          </div>
          <div>
            <div class="font-heading font-black text-lg text-white leading-tight">
              {{ platform.name }}
            </div>
            <div class="text-[11px] font-mono text-slate-400">
              Sistema de rescate y navegación segura
            </div>
          </div>
        </NuxtLink>

        <button
          type="button"
          @click="handleClearError"
          class="px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          :class="isNews
            ? 'bg-orange-600 hover:bg-orange-500 text-white'
            : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'"
        >
          <span>← Volver al Inicio</span>
        </button>
      </div>
    </header>

    <!-- CUERPO PRINCIPAL DEL ERROR -->
    <main class="max-w-5xl mx-auto w-full px-4 lg:px-8 py-12 flex-1 flex flex-col justify-center space-y-10">
      
      <!-- TARJETA DEL ERROR CON TERMINAL CLI -->
      <div class="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <!-- COLUMNA TEXTO Y CONSOLA -->
          <div class="lg:col-span-8 space-y-5 text-center sm:text-left">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border"
              :class="is404
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'"
            >
              <span>{{ is404 ? '🔍' : '⚠️' }}</span>
              <span>HTTP {{ statusCode }} — {{ is404 ? 'File Not Found' : 'Server Execution Error' }}</span>
            </div>

            <h1 class="text-2xl sm:text-4xl font-black text-white tracking-tight font-heading leading-tight">
              {{ errorMessage }}
            </h1>

            <p class="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              {{ is404
                ? 'La ruta solicitada no se encuentra disponible o ha sido reorganizada dentro de la nueva arquitectura de la plataforma.'
                : 'Se ha producido un problema inesperado al procesar la solicitud. Nuestro equipo técnico ha sido notificado.' }}
            </p>

            <!-- TERMINAL CLI SIMULADO -->
            <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-left shadow-inner space-y-2">
              <div class="flex items-center gap-1.5 pb-2 border-b border-slate-800/80 text-[10px] text-slate-500">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                <span class="ml-2">bash — terminal@laguialinux:~</span>
              </div>
              <div class="text-slate-400">
                <span class="text-emerald-400 font-bold">sysadmin@laguialinux:~$</span>
                {{ is404 ? 'find /var/www -name "recurso-solicitado"' : 'journalctl -xe --priority=3' }}
              </div>
              <div :class="is404 ? 'text-rose-400' : 'text-amber-400'">
                {{ is404
                  ? 'find: ‘/var/www/recurso-solicitado’: No such file or directory [ERR_CODE: 404]'
                  : `systemd[1]: Process terminated with exit code ${statusCode} [SERVER_FAULT]` }}
              </div>
              <div class="text-slate-500 text-[11px]">
                Sugerencia: Usa el comando 'cd' para volver a la raíz o utiliza el buscador rápido inferior.
              </div>
            </div>

            <!-- BUSCADOR DE RESCATE -->
            <form @submit.prevent="handleRescueSearch" class="pt-2">
              <div class="relative max-w-lg">
                <input
                  v-model="rescueQuery"
                  type="text"
                  placeholder="Buscar comando, guía o noticia..."
                  class="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-24 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                <button
                  type="submit"
                  class="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
                  :class="isNews
                    ? 'bg-orange-600 hover:bg-orange-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'"
                >
                  Buscar
                </button>
              </div>
            </form>
          </div>

          <!-- COLUMNA ILUSTRACIÓN / MASCOTA -->
          <div class="lg:col-span-4 flex justify-center">
            <div class="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl bg-slate-950 border border-slate-800 p-6 flex flex-col items-center justify-center shadow-2xl text-center">
              <span class="text-6xl mb-2 animate-bounce">🐧</span>
              <span class="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">
                Tux Sysadmin
              </span>
              <span class="text-[11px] text-slate-500 mt-1">
                Estado: {{ is404 ? 'Ruta no encontrada' : 'Recuperando servicio' }}
              </span>
            </div>
          </div>

        </div>
      </div>

      <!-- ATAJOS DE RESCATE SUGERIDOS -->
      <section class="space-y-4">
        <div class="border-b border-slate-800 pb-3 flex items-center justify-between">
          <h2 class="text-sm font-bold text-white font-heading flex items-center gap-2">
            <span>🧭</span> Rutas recomendadas para continuar navegando
          </h2>
          <span class="text-xs font-mono text-slate-500">Atajos rápidos</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NuxtLink
            to="/"
            @click="handleClearError"
            class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500 transition-all group flex flex-col justify-between"
          >
            <div>
              <span class="text-emerald-400 font-mono text-xs font-bold block mb-1">01 · Portada</span>
              <span class="text-sm font-bold text-white group-hover:text-emerald-300 block mb-1">Página Principal</span>
              <span class="text-xs text-slate-400 block">Vuelve al punto de partida del ecosistema.</span>
            </div>
            <span class="text-xs text-emerald-400 font-bold mt-4">Ir al inicio →</span>
          </NuxtLink>

          <NuxtLink
            to="/guias"
            @click="handleClearError"
            class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500 transition-all group flex flex-col justify-between"
          >
            <div>
              <span class="text-cyan-400 font-mono text-xs font-bold block mb-1">02 · Catálogo</span>
              <span class="text-sm font-bold text-white group-hover:text-cyan-300 block mb-1">Guías Técnicas</span>
              <span class="text-xs text-slate-400 block">Explora el manual completo organizado por distros.</span>
            </div>
            <span class="text-xs text-cyan-400 font-bold mt-4">Explorar guías →</span>
          </NuxtLink>

          <NuxtLink
            to="/herramientas"
            @click="handleClearError"
            class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500 transition-all group flex flex-col justify-between"
          >
            <div>
              <span class="text-amber-400 font-mono text-xs font-bold block mb-1">03 · Utilidades</span>
              <span class="text-sm font-bold text-white group-hover:text-amber-300 block mb-1">Suite Sysadmin</span>
              <span class="text-xs text-slate-400 block">Calculadora Chmod, Crontab y selector de distros.</span>
            </div>
            <span class="text-xs text-amber-400 font-bold mt-4">Abrir herramientas →</span>
          </NuxtLink>

          <NuxtLink
            to="/contacto"
            @click="handleClearError"
            class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500 transition-all group flex flex-col justify-between"
          >
            <div>
              <span class="text-rose-400 font-mono text-xs font-bold block mb-1">04 · Asistencia</span>
              <span class="text-sm font-bold text-white group-hover:text-rose-300 block mb-1">Notificar Errata</span>
              <span class="text-xs text-slate-400 block">Avísanos si un enlace antiguo está roto.</span>
            </div>
            <span class="text-xs text-rose-400 font-bold mt-4">Contactar →</span>
          </NuxtLink>
        </div>
      </section>

    </main>

    <!-- FOOTER SIMPLE -->
    <footer class="bg-slate-950 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
      <div class="max-w-7xl mx-auto px-4">
        <span>La Guía Linux — Código bajo GNU AGPLv3 · Contenidos bajo CC BY-SA 4.0</span>
      </div>
    </footer>
  </div>
</template>
