<script setup lang="ts">
const copied = ref(false)
const commandSnippet = 'sudo apt update && sudo apt install -y neofetch htop curl'

const copyCommand = async () => {
  try {
    await navigator.clipboard.writeText(commandSnippet)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // Fallback silencioso
  }
}

const categories = [
  {
    slug: 'administracion-de-sistemas',
    name: 'Administración de Sistemas',
    desc: 'Comandos esenciales, control de procesos, usuarios y servicios systemd.',
    icon: 'lucide:server',
    count: 28,
  },
  {
    slug: 'discos-y-almacenamiento',
    name: 'Discos y Almacenamiento',
    desc: 'Formateo, reparación e2fsck, badblocks, testdisk y particiones.',
    icon: 'lucide:hard-drive',
    count: 22,
  },
  {
    slug: 'redes-y-seguridad',
    name: 'Redes y Seguridad',
    desc: 'SSH sin clave, cortafuegos iptables/nftables, escaneo con Nmap y cifrado.',
    icon: 'lucide:shield',
    count: 19,
  },
  {
    slug: 'optimizacion-y-mantenimiento',
    name: 'Optimización & Kernel',
    desc: 'Ajuste de swappiness, limpieza de kernels obsoletos y rendimiento en Debian.',
    icon: 'lucide:cpu',
    count: 14,
  },
  {
    slug: 'distribuciones-linux',
    name: 'Distribuciones Linux',
    desc: 'Guías especializadas para Debian, Ubuntu, Arch Linux, Fedora y Alpine.',
    icon: 'lucide:box',
    count: 12,
  },
  {
    slug: 'equivalencias-windows-linux',
    name: 'Equivalencias Windows ↔ Linux',
    desc: 'Catálogo de software alternativo de ofimática, multimedia y servidores.',
    icon: 'lucide:arrow-left-right',
    count: 10,
  },
]
</script>

<template>
  <div class="space-y-16 py-8">
    
    <!-- 1. HERO SECTION PRINCIPAL -->
    <section class="relative overflow-hidden pt-6 pb-12">
      <!-- Resplandor de fondo esmeralda -->
      <div class="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-full max-w-4xl -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          
          <!-- Texto del Hero -->
          <div class="lg:col-span-7 space-y-6">
            <div class="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs font-semibold text-emerald-400">
              <span class="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Documentación Técnica Libre & Open Source
            </div>

            <h1 class="font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Aprender, Administrar y Compartir <span class="text-emerald-400">GNU/Linux</span>
            </h1>

            <p class="max-w-2xl text-base text-slate-300 sm:text-lg leading-relaxed">
              Portal de referencia técnica en español: guías paso a paso, chuletas de comandos verificadas, optimización de sistemas, almacenamiento y herramientas prácticas para sysadmins.
            </p>

            <!-- Acciones -->
            <div class="flex flex-wrap items-center gap-4 pt-2">
              <NuxtLink
                to="/guias"
                class="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-3 text-sm font-bold text-black transition-all shadow-lg shadow-emerald-500/20"
              >
                <Icon name="lucide:book-open" class="h-4 w-4" />
                Explorar Guías de Comandos
              </NuxtLink>

              <NuxtLink
                to="/herramientas"
                class="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors"
              >
                <Icon name="lucide:wrench" class="h-4 w-4 text-emerald-400" />
                Herramientas Sysadmin
              </NuxtLink>
            </div>
          </div>

          <!-- Terminal Mockup Interactivo -->
          <div class="lg:col-span-5">
            <div class="relative rounded-2xl border border-slate-700/80 bg-[#060a12] p-5 shadow-2xl backdrop-blur-xl">
              <!-- Ventana Header -->
              <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div class="flex items-center gap-2">
                  <span class="h-3 w-3 rounded-full bg-rose-500/80" />
                  <span class="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span class="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <div class="font-mono text-[11px] text-slate-400">
                  bash — raupulus@laguialinux:~
                </div>
                <div class="w-12" />
              </div>

              <!-- Terminal Body -->
              <div class="space-y-4 pt-4 font-mono text-xs text-slate-300">
                <div class="flex items-center justify-between text-slate-400">
                  <span># Comando rápido recomendado</span>
                  <button
                    type="button"
                    @click="copyCommand"
                    class="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/60 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    <Icon :name="copied ? 'lucide:check' : 'lucide:copy'" class="h-3.5 w-3.5" :class="copied ? 'text-emerald-400' : 'text-slate-400'" />
                    <span>{{ copied ? '¡Copiado!' : 'Copiar' }}</span>
                  </button>
                </div>

                <div class="rounded-lg bg-black/60 p-3 font-mono text-xs text-emerald-400 border border-slate-800">
                  <span class="text-slate-500 select-none">$ </span>{{ commandSnippet }}
                </div>

                <!-- Info Box del Sistema -->
                <div class="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                  <div>
                    <span class="text-slate-500">Kernel:</span> Linux 6.12 LTS
                  </div>
                  <div>
                    <span class="text-slate-500">Licencia:</span> AGPLv3 + CC BY-SA
                  </div>
                  <div>
                    <span class="text-slate-500">Guías activas:</span> 95 verificadas
                  </div>
                  <div>
                    <span class="text-slate-500">Estado API:</span> 100% Operativa
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- 2. LOS 3 PILARES FUNDAMENTALES -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        
        <div class="rounded-2xl border border-slate-800 bg-[#0b0f17] p-6 transition-all hover:border-slate-700">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
            <Icon name="lucide:graduation-cap" class="h-6 w-6" />
          </div>
          <h3 class="font-heading text-lg font-bold text-white">1. Aprender</h3>
          <p class="mt-2 text-xs text-slate-400 leading-relaxed">
            Desde la manipulación básica de ficheros y permisos hasta la gestión avanzada de servicios, particiones y almacenamiento RAID.
          </p>
        </div>

        <div class="rounded-2xl border border-slate-800 bg-[#0b0f17] p-6 transition-all hover:border-slate-700">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
            <Icon name="lucide:shield-check" class="h-6 w-6" />
          </div>
          <h3 class="font-heading text-lg font-bold text-white">2. Administrar</h3>
          <p class="mt-2 text-xs text-slate-400 leading-relaxed">
            Configuración segura de servidores en producción: cortafuegos con iptables/nftables, hardening SSH, optimización de memoria swap y monitorización.
          </p>
        </div>

        <div class="rounded-2xl border border-slate-800 bg-[#0b0f17] p-6 transition-all hover:border-slate-700">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
            <Icon name="lucide:share-2" class="h-6 w-6" />
          </div>
          <h3 class="font-heading text-lg font-bold text-white">3. Compartir</h3>
          <p class="mt-2 text-xs text-slate-400 leading-relaxed">
            Filosofía 100% comunitaria sin muros de pago. Código de plataforma bajo GNU AGPLv3 y contenidos educativos bajo Creative Commons CC BY-SA 4.0.
          </p>
        </div>

      </div>
    </section>

    <!-- 3. CATEGORÍAS TÉCNICAS DESTACADAS -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between pb-6">
        <div>
          <h2 class="font-heading text-2xl font-bold tracking-tight text-white">
            Categorías Principales
          </h2>
          <p class="text-xs text-slate-400 mt-1">
            Explora las guías agrupadas por especialidad técnica
          </p>
        </div>
        <NuxtLink to="/guias" class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300">
          Ver todas
          <Icon name="lucide:arrow-right" class="h-3.5 w-3.5" />
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.slug"
          :to="`/categoria/${cat.slug}`"
          class="group rounded-2xl border border-slate-800 bg-[#0b0f17] p-5 transition-all hover:border-emerald-500/40 hover:bg-slate-900/60"
        >
          <div class="flex items-start justify-between">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-emerald-400 border border-slate-800 group-hover:scale-110 transition-transform">
              <Icon :name="cat.icon" class="h-5 w-5" />
            </div>
            <span class="rounded-full bg-slate-800/80 px-2 py-0.5 font-mono text-[11px] text-slate-400">
              {{ cat.count }} guías
            </span>
          </div>
          <h3 class="mt-4 font-heading text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
            {{ cat.name }}
          </h3>
          <p class="mt-1 text-xs text-slate-400 leading-relaxed">
            {{ cat.desc }}
          </p>
        </NuxtLink>
      </div>
    </section>

    <!-- 4. BANNER CROSS-SITE: PORTAL DE NOTICIAS -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-950/40 via-[#0d1017] to-[#080c14] p-8 sm:p-10">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div class="space-y-2 text-center sm:text-left">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-orange-500/20 px-2.5 py-0.5 text-xs font-semibold text-orange-400 border border-orange-500/30">
              <Icon name="lucide:newspaper" class="h-3.5 w-3.5" />
              Portal Hermano de Noticias
            </span>
            <h3 class="font-heading text-xl font-bold text-white sm:text-2xl">
              ¿Buscas la actualidad del mundo Linux y Open Source?
            </h3>
            <p class="max-w-xl text-xs text-slate-400">
              Visita <strong class="text-orange-400">news.laguialinux.com</strong> para estar al día de lanzamientos del Kernel, actualizaciones de distros y alertas de ciberseguridad.
            </p>
          </div>
          <a
            href="https://news.laguialinux.com"
            target="_blank"
            rel="noopener noreferrer"
            class="shrink-0 inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 px-6 py-3 text-sm font-bold text-black transition-all shadow-lg shadow-orange-500/20"
          >
            Ir a Noticias
            <Icon name="lucide:external-link" class="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>

  </div>
</template>
