<script setup lang="ts">
import { ref } from 'vue'
import Swiper from 'swiper'
import { Pagination, Navigation } from 'swiper/modules'

const heroQuery = ref('')

const handleHeroSearch = () => {
  const q = heroQuery.value.trim()
  if (q) {
    navigateTo(`/buscar?q=${encodeURIComponent(q)}`)
  }
}

onMounted(() => {
  new Swiper('.swiper-guides', {
    modules: [Pagination, Navigation],
    grabCursor: true,
    loop: true,
    speed: 450,
    slidesPerView: 1,
    spaceBetween: 16,
    breakpoints: {
      640: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 24,
      },
    },
    pagination: {
      el: '.swiper-pagination-guides',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next-guides',
      prevEl: '.swiper-button-prev-guides',
    },
  })

  new Swiper('.swiper-news', {
    modules: [Pagination, Navigation],
    grabCursor: true,
    loop: true,
    speed: 450,
    slidesPerView: 1,
    spaceBetween: 16,
    breakpoints: {
      640: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 24,
      },
    },
    pagination: {
      el: '.swiper-pagination-news',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next-news',
      prevEl: '.swiper-button-prev-news',
    },
  })

  new Swiper('.swiper-blog', {
    modules: [Pagination, Navigation],
    grabCursor: true,
    loop: true,
    speed: 450,
    slidesPerView: 1,
    spaceBetween: 16,
    breakpoints: {
      640: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 24,
      },
    },
    pagination: {
      el: '.swiper-pagination-blog',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next-blog',
      prevEl: '.swiper-button-prev-blog',
    },
  })
})
</script>

<template>
  <div>
<!-- 3. HERO / CABECERA PRINCIPAL -->
  <section class="relative overflow-hidden pt-12 pb-16 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/50 via-[#080c14] to-[#080c14]">
    <div class="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>
    <div class="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 text-center">
      
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs mb-6 shadow-sm">
        <span>Ecosistema de Software Libre y Administración GNU/Linux</span>
      </div>

      <h1 class="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight max-w-4xl mx-auto mb-6">
        Aprender, Administrar y Compartir <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">GNU/Linux</span>
      </h1>

      <p class="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
        Tutoriales técnicos contrastados, chuletas de comandos para la terminal, guías de formateo seguro y herramientas interactivas para sysadmins.
      </p>

      <!-- BUSCADOR CENTRAL CON SUGERENCIAS POPULARES -->
      <div class="max-w-2xl mx-auto mb-6">
        <form @submit.prevent="handleHeroSearch" class="relative flex items-center shadow-2xl rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900/90 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <span class="pl-4 text-slate-400 font-mono text-lg">$</span>
          <input
            v-model="heroQuery"
            type="text"
            placeholder="Ej: systemctl status, fdisk -l, iptables, umask..." 
            class="w-full bg-transparent py-4 pl-3 pr-28 text-white placeholder-slate-400 focus:outline-none font-mono text-sm"
          >
          <button type="submit" class="absolute right-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow cursor-pointer">
            Buscar
          </button>
        </form>
      </div>

      <!-- PÍLDORAS DE COMANDOS FRECUENTES -->
      <div class="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-400">
        <span class="text-slate-400 font-medium">Comandos rápidos:</span>
        <NuxtLink to="/categoria/comandos" class="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 hover:text-emerald-400 border border-slate-700/60 transition-colors">systemctl</NuxtLink>
        <NuxtLink to="/categoria/almacenamiento" class="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 hover:text-emerald-400 border border-slate-700/60 transition-colors">fdisk</NuxtLink>
        <NuxtLink to="/categoria/redes" class="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 hover:text-emerald-400 border border-slate-700/60 transition-colors">iptables</NuxtLink>
        <NuxtLink to="/herramientas" class="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 hover:text-emerald-400 border border-slate-700/60 transition-colors">chmod calc</NuxtLink>
        <NuxtLink to="/categoria/almacenamiento" class="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 hover:text-emerald-400 border border-slate-700/60 transition-colors">btrfs snapshot</NuxtLink>
      </div>

    </div>
  </section>

  <!-- 4. SECCIÓN SWIPER: ÚLTIMAS GUÍAS Y TUTORIALES TÉCNICOS -->
  <section class="py-14 border-b border-slate-800/80 bg-slate-900/30">
    <div class="max-w-7xl mx-auto px-4 lg:px-8">
      
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div class="text-emerald-400 text-xs font-mono uppercase font-bold tracking-wider mb-1">
            Tutoriales y Referencia Técnica
          </div>
          <h2 class="font-heading text-2xl sm:text-3xl font-black text-white tracking-tight">
            Últimas Guías de Administración y Sistemas
          </h2>
        </div>
        <NuxtLink to="/guias" class="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 self-start sm:self-auto">
          <span>Ver catálogo completo de guías</span>
          <span>→</span>
        </NuxtLink>
      </div>

      <!-- CONTENEDOR SWIPER GUÍAS -->
      <div class="relative py-4 px-2 sm:px-12">
        <div class="swiper swiper-guides overflow-hidden pb-12">
          <div class="swiper-wrapper items-stretch">
            
            <!-- GUÍA 1 -->
            <div class="swiper-slide h-auto">
              <article class="bg-slate-900/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col h-full hover:border-emerald-500/50 transition-colors group">
                <div class="p-5 pb-3">
                  <h3 class="font-heading font-bold text-lg text-white group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
                    <NuxtLink to="/guia/comandos-linux-gestionar-archivos-y-directorios">
                      Comandos Indispensables para la Administración de Sistemas GNU/Linux
                    </NuxtLink>
                  </h3>
                </div>
                <div class="px-5 py-2">
                  <div class="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-950 flex items-center justify-center border border-slate-800">
                    <img src="/assets/img/covers/cover_guias.webp" alt="Comandos Indispensables" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 shadow-md">
                      Comandos & CLI
                    </span>
                  </div>
                </div>
                <div class="p-5 pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-mono block mb-2">hace 3 días · 10 min de lectura</span>
                    <p class="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      Chuleta definitiva de comandos esenciales: diagnóstico de procesos, inspección de puertos en red, gestión de permisos y sintaxis recomendada para sysadmins.
                    </p>
                  </div>
                  <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
                    <span class="text-slate-400 text-xs flex items-center gap-1 font-mono">
                      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      24 comentarios
                    </span>
                    <NuxtLink to="/guia/comandos-linux-gestionar-archivos-y-directorios" class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow">
                      Leer
                    </NuxtLink>
                  </div>
                </div>
              </article>
            </div>

            <!-- GUÍA 2 -->
            <div class="swiper-slide h-auto">
              <article class="bg-slate-900/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col h-full hover:border-emerald-500/50 transition-colors group">
                <div class="p-5 pb-3">
                  <h3 class="font-heading font-bold text-lg text-white group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
                    <NuxtLink to="/guia/diagnostico-discos-reparacion-sistemas-ficheros-e2fsck-badblocks">
                      Badblocks: Analizar, Diagnosticar y Recuperar Sectores Defectuosos en Discos
                    </NuxtLink>
                  </h3>
                </div>
                <div class="px-5 py-2">
                  <div class="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-950 flex items-center justify-center border border-slate-800">
                    <img src="/assets/img/demo-clean-security.webp" alt="Diagnóstico de Discos" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500 text-slate-950 shadow-md">
                      Almacenamiento
                    </span>
                  </div>
                </div>
                <div class="p-5 pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-mono block mb-2">hace 5 días · 8 min de lectura</span>
                    <p class="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      Guía práctica de formateo de bajo nivel, análisis no destructivo de lectura/escritura y reubicación de bloques dañados con e2fsck en particiones ext4.
                    </p>
                  </div>
                  <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
                    <span class="text-slate-400 text-xs flex items-center gap-1 font-mono">
                      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      18 comentarios
                    </span>
                    <NuxtLink to="/guia/diagnostico-discos-reparacion-sistemas-ficheros-e2fsck-badblocks" class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow">
                      Leer
                    </NuxtLink>
                  </div>
                </div>
              </article>
            </div>

            <!-- GUÍA 3 -->
            <div class="swiper-slide h-auto">
              <article class="bg-slate-900/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col h-full hover:border-emerald-500/50 transition-colors group">
                <div class="p-5 pb-3">
                  <h3 class="font-heading font-bold text-lg text-white group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
                    <NuxtLink to="/guia/optimizacion-memoria-swap-swappiness-servidores-linux">
                      Optimización de Memoria Swap y Configuración de ZRAM en Servidores Debian
                    </NuxtLink>
                  </h3>
                </div>
                <div class="px-5 py-2">
                  <div class="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-950 flex items-center justify-center border border-slate-800">
                    <img src="/assets/img/banners/placeholder.webp" alt="Swap y ZRAM" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 shadow-md">
                      Rendimiento
                    </span>
                  </div>
                </div>
                <div class="p-5 pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-mono block mb-2">hace 1 semana · 7 min de lectura</span>
                    <p class="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      Ajuste óptimo del parámetro vm.swappiness, creación de particiones swap encriptadas y compresión de memoria volátil ultrarrápida con zram-tools.
                    </p>
                  </div>
                  <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
                    <span class="text-slate-400 text-xs flex items-center gap-1 font-mono">
                      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      12 comentarios
                    </span>
                    <NuxtLink to="/guia/optimizacion-memoria-swap-swappiness-servidores-linux" class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow">
                      Leer
                    </NuxtLink>
                  </div>
                </div>
              </article>
            </div>

            <!-- GUÍA 4 -->
            <div class="swiper-slide h-auto">
              <article class="bg-slate-900/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col h-full hover:border-emerald-500/50 transition-colors group">
                <div class="p-5 pb-3">
                  <h3 class="font-heading font-bold text-lg text-white group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
                    <NuxtLink to="/guia/manual-particionado-fdisk-gdisk-formateo-reparacion-e2fsck">
                      Estrategias de Copias de Seguridad en Linux: BorgBackup y Snapshots Btrfs
                    </NuxtLink>
                  </h3>
                </div>
                <div class="px-5 py-2">
                  <div class="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-950 flex items-center justify-center border border-slate-800">
                    <img src="/assets/img/banners/reading.webp" alt="Backups Linux" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500 text-slate-950 shadow-md">
                      Backups & Seguridad
                    </span>
                  </div>
                </div>
                <div class="p-5 pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-mono block mb-2">hace 2 semanas · 12 min de lectura</span>
                    <p class="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      Implementación de respaldos incrementales deduplicados y cifrados de forma remota por SSH con retención automática y validación de snapshots.
                    </p>
                  </div>
                  <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
                    <span class="text-slate-400 text-xs flex items-center gap-1 font-mono">
                      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      35 comentarios
                    </span>
                    <NuxtLink to="/guia/manual-particionado-fdisk-gdisk-formateo-reparacion-e2fsck" class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow">
                      Leer
                    </NuxtLink>
                  </div>
                </div>
              </article>
            </div>

            <!-- GUÍA 5 -->
            <div class="swiper-slide h-auto">
              <article class="bg-slate-900/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col h-full hover:border-emerald-500/50 transition-colors group">
                <div class="p-5 pb-3">
                  <h3 class="font-heading font-bold text-lg text-white group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
                    <NuxtLink to="/guia/configuracion-ssh-seguro-sin-clave-ed25519">
                      Endurecimiento de SSH: Autenticación por Claves Ed25519 y Bloqueo Fail2ban
                    </NuxtLink>
                  </h3>
                </div>
                <div class="px-5 py-2">
                  <div class="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-950 flex items-center justify-center border border-slate-800">
                    <img src="/assets/img/covers/cover_herramientas.webp" alt="Seguridad SSH" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 shadow-md">
                      Ciberseguridad
                    </span>
                  </div>
                </div>
                <div class="p-5 pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-mono block mb-2">hace 2 semanas · 9 min de lectura</span>
                    <p class="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      Desactivación de acceso root directo, rotación de claves criptográficas seguras Ed25519, protección contra ataques de fuerza bruta y túneles seguros.
                    </p>
                  </div>
                  <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
                    <span class="text-slate-400 text-xs flex items-center gap-1 font-mono">
                      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      29 comentarios
                    </span>
                    <NuxtLink to="/guia/configuracion-ssh-seguro-sin-clave-ed25519" class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow">
                      Leer
                    </NuxtLink>
                  </div>
                </div>
              </article>
            </div>

            <!-- GUÍA 6 -->
            <div class="swiper-slide h-auto">
              <article class="bg-slate-900/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col h-full hover:border-emerald-500/50 transition-colors group">
                <div class="p-5 pb-3">
                  <h3 class="font-heading font-bold text-lg text-white group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
                    <NuxtLink to="/guia/comandos-indispensables-para-dpkg-y-apt-limpieza">
                      Gestión de Paquetes con APT y DPKG: Trucos Avanzados y Pinned Packages
                    </NuxtLink>
                  </h3>
                </div>
                <div class="px-5 py-2">
                  <div class="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-950 flex items-center justify-center border border-slate-800">
                    <img src="/assets/img/soft-skills/logotipo.webp" alt="Gestión de Paquetes APT" class="w-28 h-28 object-contain group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500 text-slate-950 shadow-md">
                      Paquetes & Distros
                    </span>
                  </div>
                </div>
                <div class="p-5 pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-mono block mb-2">hace 3 semanas · 6 min de lectura</span>
                    <p class="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      Solución de dependencias rotas, fijado de versiones en /etc/apt/preferences, limpieza profunda de kernels huérfanos y mantenimiento con debfoster.
                    </p>
                  </div>
                  <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
                    <span class="text-slate-400 text-xs flex items-center gap-1 font-mono">
                      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      16 comentarios
                    </span>
                    <NuxtLink to="/guia/comandos-indispensables-para-dpkg-y-apt-limpieza" class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow">
                      Leer
                    </NuxtLink>
                  </div>
                </div>
              </article>
            </div>

          </div>

          <!-- Paginación Swiper -->
          <div class="swiper-pagination swiper-pagination-guides mt-4"></div>
        </div>

        <!-- Botones de Navegación situados fuera del swiper con overflow:hidden -->
        <button type="button" aria-label="Guía anterior" class="swiper-button-prev swiper-button-prev-guides !text-emerald-400 !w-10 !h-10 !bg-slate-900/90 hover:!bg-slate-800 rounded-full border border-slate-700/80 shadow-xl after:!text-sm !left-0 sm:!-left-2 transition-all flex items-center justify-center cursor-pointer"></button>
        <button type="button" aria-label="Guía siguiente" class="swiper-button-next swiper-button-next-guides !text-emerald-400 !w-10 !h-10 !bg-slate-900/90 hover:!bg-slate-800 rounded-full border border-slate-700/80 shadow-xl after:!text-sm !right-0 sm:!-right-2 transition-all flex items-center justify-center cursor-pointer"></button>
      </div>

    </div>
  </section>

  <!-- 5. SECCIÓN SWIPER: ÚLTIMAS NOTICIAS & ACTUALIDAD -->
  <section class="py-14 border-b border-slate-800/80 bg-slate-900/30">
    <div class="max-w-7xl mx-auto px-4 lg:px-8">
      
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div class="text-amber-400 text-xs font-mono uppercase font-bold tracking-wider mb-1">
            Actualidad y Lanzamientos
          </div>
          <h2 class="font-heading text-2xl sm:text-3xl font-black text-white tracking-tight">
            Últimas Noticias de Linux y Software Libre
          </h2>
        </div>
        <a href="https://news.laguialinux.com" class="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 self-start sm:self-auto">
          <span>Abrir portal de noticias completo</span>
          <span>→</span>
        </a>
      </div>

      <!-- CONTENEDOR SWIPER NOTICIAS -->
      <div class="relative py-4 px-2 sm:px-12">
        <div class="swiper swiper-news overflow-hidden pb-12">
          <div class="swiper-wrapper items-stretch">
            
            <!-- SLIDE 1 -->
            <div class="swiper-slide">
              <article class="bg-slate-900/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col h-full hover:border-amber-500/50 transition-colors group">
                <div class="p-5 pb-3">
                  <h3 class="font-heading font-bold text-lg text-white group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
                    <NuxtLink to="/noticia/linux-kernel-6-12-lanzado-real-time">
                      Lanzamiento del Kernel Linux 6.12 LTS con mejoras de rendimiento y soporte extendido
                    </NuxtLink>
                  </h3>
                </div>
                <div class="px-5 py-2">
                  <div class="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-950 flex items-center justify-center border border-slate-800">
                    <img src="/assets/img/banners/1.webp" alt="Kernel Linux" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950 shadow-md">
                      Kernel & Distros
                    </span>
                  </div>
                </div>
                <div class="p-5 pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-mono block mb-2">11 oct 2026 · 4 min de lectura</span>
                    <p class="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      Linus Torvalds anuncia la versión LTS con nuevo planificador EEVDF optimizado, soporte para arquitecturas ARM64 y controladores actualizados.
                    </p>
                  </div>
                  <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
                    <span class="text-slate-400 text-xs flex items-center gap-1 font-mono">
                      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      12 comentarios
                    </span>
                    <NuxtLink to="/noticia/linux-kernel-6-12-lanzado-real-time" class="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors shadow">
                      Leer
                    </NuxtLink>
                  </div>
                </div>
              </article>
            </div>

            <!-- SLIDE 2 -->
            <div class="swiper-slide">
              <article class="bg-slate-900/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col h-full hover:border-amber-500/50 transition-colors group">
                <div class="p-5 pb-3">
                  <h3 class="font-heading font-bold text-lg text-white group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
                    <NuxtLink to="/noticia/debian-13-trixie-primera-fase-congelamiento">
                      Debian 13 Trixie inicia su fase de congelación de paquetes en repositorios
                    </NuxtLink>
                  </h3>
                </div>
                <div class="px-5 py-2">
                  <div class="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-950 flex items-center justify-center border border-slate-800">
                    <img src="/assets/img/soft-skills/logotipo.webp" alt="Debian" class="w-28 h-28 object-contain group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white shadow-md">
                      Debian
                    </span>
                  </div>
                </div>
                <div class="p-5 pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-mono block mb-2">09 oct 2026 · 3 min de lectura</span>
                    <p class="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      El equipo de desarrollo de Debian arranca el ciclo de depuración intensiva para la próxima versión estable, fijando versiones de gcc y systemd.
                    </p>
                  </div>
                  <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
                    <span class="text-slate-400 text-xs flex items-center gap-1 font-mono">
                      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      8 comentarios
                    </span>
                    <NuxtLink to="/noticia/debian-13-trixie-primera-fase-congelamiento" class="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors shadow">
                      Leer
                    </NuxtLink>
                  </div>
                </div>
              </article>
            </div>

            <!-- SLIDE 3 -->
            <div class="swiper-slide">
              <article class="bg-slate-900/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col h-full hover:border-amber-500/50 transition-colors group">
                <div class="p-5 pb-3">
                  <h3 class="font-heading font-bold text-lg text-white group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
                    <NuxtLink to="/noticia/alerta-seguridad-cve-2024-6387-regresshion-openssh">
                      Vulnerabilidad crítica en OpenSSH (CVE-2024-6387): Parche y mitigación inmediata
                    </NuxtLink>
                  </h3>
                </div>
                <div class="px-5 py-2">
                  <div class="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-950 flex items-center justify-center border border-slate-800">
                    <img src="/assets/img/banners/placeholder.webp" alt="Ciberseguridad SSH" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white shadow-md">
                      Ciberseguridad
                    </span>
                  </div>
                </div>
                <div class="p-5 pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-mono block mb-2">05 oct 2026 · 6 min de lectura</span>
                    <p class="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      Análisis detallado del fallo de regresión regreSSHion, vectores de ataque en sistemas glibc de 32 y 64 bits y comandos de actualización inmediata.
                    </p>
                  </div>
                  <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
                    <span class="text-slate-400 text-xs flex items-center gap-1 font-mono">
                      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      19 comentarios
                    </span>
                    <NuxtLink to="/noticia/alerta-seguridad-cve-2024-6387-regresshion-openssh" class="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors shadow">
                      Leer
                    </NuxtLink>
                  </div>
                </div>
              </article>
            </div>

            <!-- SLIDE 4 -->
            <div class="swiper-slide">
              <article class="bg-slate-900/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col h-full hover:border-amber-500/50 transition-colors group">
                <div class="p-5 pb-3">
                  <h3 class="font-heading font-bold text-lg text-white group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
                    <NuxtLink to="/noticia/fedora-41-gestor-dnf5-soporte-wayland">
                      Fedora 41 llega con gestor DNF5 por defecto y soporte mejorado Wayland
                    </NuxtLink>
                  </h3>
                </div>
                <div class="px-5 py-2">
                  <div class="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-950 flex items-center justify-center border border-slate-800">
                    <img src="/assets/img/soft-skills/cloud.webp" alt="Fedora" class="w-28 h-28 object-contain group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500 text-white shadow-md">
                      Fedora
                    </span>
                  </div>
                </div>
                <div class="p-5 pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-mono block mb-2">01 oct 2026 · 5 min de lectura</span>
                    <p class="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      Descubre cómo la reescritura en C++ de DNF5 reduce el consumo de memoria en un 60% y acelera drásticamente la resolución de dependencias.
                    </p>
                  </div>
                  <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
                    <span class="text-slate-400 text-xs flex items-center gap-1 font-mono">
                      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      6 comentarios
                    </span>
                    <NuxtLink to="/noticia/fedora-41-gestor-dnf5-soporte-wayland" class="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors shadow">
                      Leer
                    </NuxtLink>
                  </div>
                </div>
              </article>
            </div>

            <!-- SLIDE 5 -->
            <div class="swiper-slide">
              <article class="bg-slate-900/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col h-full hover:border-amber-500/50 transition-colors group">
                <div class="p-5 pb-3">
                  <h3 class="font-heading font-bold text-lg text-white group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
                    <NuxtLink to="/noticia/arch-linux-adopta-zstandard-nivel-19">
                      Arch Linux adopta soporte para compresión multihilo zstd en empaquetado oficial
                    </NuxtLink>
                  </h3>
                </div>
                <div class="px-5 py-2">
                  <div class="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-950 flex items-center justify-center border border-slate-800">
                    <img src="/assets/img/banners/reading.webp" alt="Arch Linux" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500 text-slate-950 shadow-md">
                      Arch Linux
                    </span>
                  </div>
                </div>
                <div class="p-5 pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-mono block mb-2">28 sep 2026 · 4 min de lectura</span>
                    <p class="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      Tiempos de descompresión ultrarrápidos en pacman gracias a la actualización de niveles zstd y optimización de espejos globales.
                    </p>
                  </div>
                  <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
                    <span class="text-slate-400 text-xs flex items-center gap-1 font-mono">
                      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      15 comentarios
                    </span>
                    <NuxtLink to="/noticia/arch-linux-adopta-zstandard-nivel-19" class="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors shadow">
                      Leer
                    </NuxtLink>
                  </div>
                </div>
              </article>
            </div>

            <!-- SLIDE 6 -->
            <div class="swiper-slide">
              <article class="bg-slate-900/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col h-full hover:border-amber-500/50 transition-colors group">
                <div class="p-5 pb-3">
                  <h3 class="font-heading font-bold text-lg text-white group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
                    <NuxtLink to="/noticia/proxmox-ve-8-3-migracion-caliente-ceph-reef">
                      Proxmox VE 8.3 introduce migración en caliente mejorada y soporte Ceph Reef
                    </NuxtLink>
                  </h3>
                </div>
                <div class="px-5 py-2">
                  <div class="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-950 flex items-center justify-center border border-slate-800">
                    <img src="/assets/img/banners/1.webp" alt="Proxmox VE" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-600 text-white shadow-md">
                      Virtualización
                    </span>
                  </div>
                </div>
                <div class="p-5 pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-mono block mb-2">24 sep 2026 · 5 min de lectura</span>
                    <p class="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      Nuevas capacidades de replicación SDN para centros de datos y aislamiento reforzado para contenedores LXC no privilegiados.
                    </p>
                  </div>
                  <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
                    <span class="text-slate-400 text-xs flex items-center gap-1 font-mono">
                      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      9 comentarios
                    </span>
                    <NuxtLink to="/noticia/proxmox-ve-8-3-migracion-caliente-ceph-reef" class="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors shadow">
                      Leer
                    </NuxtLink>
                  </div>
                </div>
              </article>
            </div>

          </div>

          <!-- Paginación Swiper -->
          <div class="swiper-pagination swiper-pagination-news mt-4"></div>
        </div>

        <!-- Botones de Navegación situados fuera del swiper con overflow:hidden -->
        <button type="button" aria-label="Noticia anterior" class="swiper-button-prev swiper-button-prev-news !text-amber-400 !w-10 !h-10 !bg-slate-900/90 hover:!bg-slate-800 rounded-full border border-slate-700/80 shadow-xl after:!text-sm !left-0 sm:!-left-2 transition-all flex items-center justify-center cursor-pointer"></button>
        <button type="button" aria-label="Noticia siguiente" class="swiper-button-next swiper-button-next-news !text-amber-400 !w-10 !h-10 !bg-slate-900/90 hover:!bg-slate-800 rounded-full border border-slate-700/80 shadow-xl after:!text-sm !right-0 sm:!-right-2 transition-all flex items-center justify-center cursor-pointer"></button>
      </div>

    </div>
  </section>

  <!-- 5. SECCIÓN RESCATADA Y MODERNIZADA: LAS 3 TARJETAS VERTICALES DE PILARES -->
  <section class="py-16 border-b border-slate-800/80 bg-gradient-to-b from-[#080c14] to-slate-950">
    <div class="max-w-7xl mx-auto px-4 lg:px-8">
      
      <div class="text-center max-w-2xl mx-auto mb-14">
        <h2 class="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight mb-3">
          Nuestros 3 Pilares Fundamentales
        </h2>
        <p class="text-slate-400 text-sm">
          Un proyecto nacido para democratizar el conocimiento de sistemas y software libre con rigor técnico y sin muros de pago.
        </p>
      </div>

      <!-- GRID DE LAS 3 TARJETAS VERTICALES -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        
        <!-- PILAR 1: LGL (Comunidad / Aprender, Compartir) -->
        <div class="pilar-card rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-700/60 bg-[#1c2433] relative">
          <!-- PARTE SUPERIOR (55%) -->
          <div class="h-64 sm:h-72 p-6 flex flex-col items-center justify-center relative bg-gradient-to-b from-[#253043] to-[#1c2433]">
            <span class="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-4">Comunidad Técnica</span>
            <img src="/assets/img/soft-skills/logotipo.webp" alt="Aprender, Compartir" class="w-36 h-36 object-contain drop-shadow-2xl">
          </div>

          <!-- INSIGNIA FLOTANTE EN EL CORTE (50% TRANSLATE) -->
          <div class="relative z-10 -mt-5 self-center">
            <span class="px-6 py-2 rounded-full font-heading font-black text-sm uppercase tracking-wider bg-rose-600 text-white shadow-xl shadow-rose-950/50 border border-rose-400/40 block">
              LGL
            </span>
          </div>

          <!-- PARTE INFERIOR (45%) -->
          <div class="p-8 pt-6 flex-1 flex flex-col justify-between bg-black/40 backdrop-blur-sm">
            <div>
              <h3 class="font-heading font-bold text-2xl text-white mb-3 text-center">
                Aprender, Compartir
              </h3>
              <p class="text-slate-300 text-sm leading-relaxed text-center">
                Creamos contenido práctico para compartirlo a la vez que aprendemos, con tutoriales probados en entornos reales.
              </p>
            </div>
            <div class="mt-6 text-center">
              <NuxtLink to="/guias" class="inline-block w-full py-2.5 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-semibold text-xs transition-all border border-rose-500/30">
                Explorar Guías
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- PILAR 2: NOTICIAS (Actualidad y Eventos) -->
        <div class="pilar-card rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-700/60 bg-[#00488f] relative">
          <!-- PARTE SUPERIOR (55%) -->
          <div class="h-64 sm:h-72 p-6 flex flex-col items-center justify-center relative bg-gradient-to-b from-[#005db5] to-[#00488f]">
            <span class="text-xs font-mono text-cyan-300 uppercase tracking-widest mb-4">Actualidad & Hardware</span>
            <img src="/assets/img/soft-skills/cloud.webp" alt="Actualidad y Eventos" class="w-36 h-36 object-contain drop-shadow-2xl">
          </div>

          <!-- INSIGNIA FLOTANTE EN EL CORTE (50% TRANSLATE) -->
          <div class="relative z-10 -mt-5 self-center">
            <span class="px-6 py-2 rounded-full font-heading font-black text-sm uppercase tracking-wider bg-rose-600 text-white shadow-xl shadow-rose-950/50 border border-rose-400/40 block">
              Noticias
            </span>
          </div>

          <!-- PARTE INFERIOR (45%) -->
          <div class="p-8 pt-6 flex-1 flex flex-col justify-between bg-black/40 backdrop-blur-sm">
            <div>
              <h3 class="font-heading font-bold text-2xl text-white mb-3 text-center">
                Actualidad y Eventos
              </h3>
              <p class="text-slate-300 text-sm leading-relaxed text-center">
                Información rigurosa sobre lo que ocurre en el mundo del software libre, ciberseguridad, lanzamientos del kernel y hardware.
              </p>
            </div>
            <div class="mt-6 text-center">
              <a href="https://news.laguialinux.com" class="inline-block w-full py-2.5 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-semibold text-xs transition-all border border-rose-500/30">
                Ver Noticias
              </a>
            </div>
          </div>
        </div>

        <!-- PILAR 3: OPEN SOURCE (Libertad en lo Digital) -->
        <div class="pilar-card rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-700/60 bg-[#a67c10] relative">
          <!-- PARTE SUPERIOR (55%) -->
          <div class="h-64 sm:h-72 p-6 flex flex-col items-center justify-center relative bg-gradient-to-b from-[#c69214] to-[#a67c10]">
            <span class="text-xs font-mono text-amber-200 uppercase tracking-widest mb-4">Filosofía y Código</span>
            <img src="/assets/img/soft-skills/gnu_linux.webp" alt="Libertad en lo Digital" class="w-36 h-36 object-contain drop-shadow-2xl">
          </div>

          <!-- INSIGNIA FLOTANTE EN EL CORTE (50% TRANSLATE) -->
          <div class="relative z-10 -mt-5 self-center">
            <span class="px-6 py-2 rounded-full font-heading font-black text-sm uppercase tracking-wider bg-rose-600 text-white shadow-xl shadow-rose-950/50 border border-rose-400/40 block">
              Open Source
            </span>
          </div>

          <!-- PARTE INFERIOR (45%) -->
          <div class="p-8 pt-6 flex-1 flex flex-col justify-between bg-black/40 backdrop-blur-sm">
            <div>
              <h3 class="font-heading font-bold text-2xl text-white mb-3 text-center">
                Libertad en lo Digital
              </h3>
              <p class="text-slate-300 text-sm leading-relaxed text-center">
                Desarrollo publicando proyectos OSS desde 2001 con software libre, fomentando la soberanía tecnológica y el código abierto.
              </p>
            </div>
            <div class="mt-6 text-center">
              <NuxtLink to="/blog" class="inline-block w-full py-2.5 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-semibold text-xs transition-all border border-rose-500/30">
                Leer Blog del Autor
              </NuxtLink>
            </div>
          </div>
        </div>

      </div>

    </div>
  </section>

  <!-- 6. SECCIÓN RESCATADA Y ENRIQUECIDA: ICONOS SOCIALES EN RELIEVE 3D SQUIRCLE -->
  <section class="py-14 border-b border-slate-800/80 bg-slate-900/40">
    <div class="max-w-7xl mx-auto px-4 lg:px-8 text-center">
      
      <span class="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2 block font-semibold">
        Comunidad & Canales Oficiales
      </span>
      <h2 class="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight mb-8">
        Síguenos y Participa en Nuestras Redes
      </h2>

      <!-- FILA DE BOTONES SQUIRCLE CON RELIEVE Y SOMBRAS TÁCTILES -->
      <div class="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
        
        <!-- YOUTUBE -->
        <a href="https://www.youtube.com/@raupulus" target="_blank" rel="noopener noreferrer" title="Canal de YouTube @raupulus" class="squircle-social-btn bg-[#dc2626] group">
          <div class="squircle-inner-pill">
            <svg class="w-7 h-7 text-[#dc2626] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        </a>

        <!-- GITLAB -->
        <a href="https://gitlab.com/raupulus" target="_blank" rel="noopener noreferrer" title="GitLab @raupulus" class="squircle-social-btn bg-[#fc6d26] group">
          <div class="squircle-inner-pill">
            <svg class="w-7 h-7 text-[#fc6d26] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="m23.6 9.58-1.02-3.13a1.44 1.44 0 0 0-2.73 0l-1.02 3.13H5.17l-1.02-3.13a1.44 1.44 0 0 0-2.73 0L.4 9.58a1.8 1.8 0 0 0 .65 2.01L12 20.34l10.95-8.75a1.8 1.8 0 0 0 .65-2.01zM12 18.2 2.5 10.63h19L12 18.2z"/>
            </svg>
          </div>
        </a>

        <!-- GITHUB -->
        <a href="https://github.com/raupulus" target="_blank" rel="noopener noreferrer" title="GitHub @raupulus" class="squircle-social-btn bg-[#181d22] group">
          <div class="squircle-inner-pill">
            <svg class="w-7 h-7 text-[#181d22] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </div>
        </a>

        <!-- TELEGRAM -->
        <a href="https://t.me/raupulus" target="_blank" rel="noopener noreferrer" title="Canal de Telegram @raupulus" class="squircle-social-btn bg-[#0088cc] group">
          <div class="squircle-inner-pill">
            <svg class="w-7 h-7 text-[#0088cc] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
          </div>
        </a>

        <!-- MASTODON -->
        <a href="https://mastodon.social/@raupulus" target="_blank" rel="noopener noreferrer" title="Mastodon @raupulus" class="squircle-social-btn bg-[#6364ff] group">
          <div class="squircle-inner-pill">
            <svg class="w-7 h-7 text-[#6364ff] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.244 15.16 0 12.02 0c-3.141 0-5.49.244-5.944.309-2.687.394-4.954 2.426-5.304 5.004C.432 7.822.39 10.59.39 13.313c0 2.723.042 5.491.382 8.001.35 2.578 2.617 4.61 5.304 5.004.454.065 2.803.309 5.944.309 3.14 0 5.49-.244 5.944-.309 2.687-.394 4.954-2.426 5.304-5.004.34-2.51.382-5.278.382-8.001 0-2.723-.042-5.491-.382-8.001zm-5.717 11.233h-2.312v-6.398c0-1.472-.614-2.223-1.84-2.223-1.358 0-2.037.88-2.037 2.628v3.693H9.04V10.55c0-1.748-.679-2.628-2.037-2.628-1.226 0-1.84.751-1.84 2.223v6.398H2.85V10.23c0-1.472.376-2.645 1.13-3.517.753-.872 1.74-1.312 2.96-1.312 1.411 0 2.474.542 3.19 1.626L12 8.784l1.87-1.757c.716-1.084 1.779-1.626 3.19-1.626 1.22 0 2.207.44 2.96 1.312.754.872 1.13 2.045 1.13 3.517v6.316z"/>
            </svg>
          </div>
        </a>

        <!-- X (TWITTER) -->
        <a href="https://x.com/raupulus" target="_blank" rel="noopener noreferrer" title="Cuenta en 𝕏 @raupulus" class="squircle-social-btn bg-black border border-slate-700/60 group">
          <div class="squircle-inner-pill">
            <svg class="w-7 h-7 text-black group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
        </a>

      </div>

    </div>
  </section>

  <!-- 7. SECCIÓN SWIPER 3D COVERFLOW: ENTRADAS DESTACADAS DEL BLOG -->
  <section class="py-14 border-b border-slate-800/80 bg-slate-900/30">
    <div class="max-w-7xl mx-auto px-4 lg:px-8">
      
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div class="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase font-bold tracking-wider mb-1">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            Bitácora Técnica
          </div>
          <h2 class="font-heading text-2xl sm:text-3xl font-black text-white tracking-tight">
            Últimas Entradas en Nuestro Blog
          </h2>
        </div>
        <NuxtLink to="/blog" class="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 self-start sm:self-auto">
          <span>Ver todas las entradas del blog</span>
          <span>→</span>
        </NuxtLink>
      </div>

      <!-- CONTENEDOR SWIPER BLOG -->
      <div class="relative py-4 px-2 sm:px-12">
        <div class="swiper swiper-blog overflow-hidden pb-12">
          <div class="swiper-wrapper items-stretch">
            
            <!-- BLOG 1 -->
            <div class="swiper-slide">
              <article class="bg-slate-900/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col h-full hover:border-emerald-500/50 transition-colors group">
                <div class="p-5 pb-3">
                  <h3 class="font-heading font-bold text-lg text-white group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
                    <NuxtLink to="/blog/setup-desarrollo-linux-neovim-tmux">
                      Mi setup de desarrollo en Linux para 2026: Neovim, Tmux y Alacritty
                    </NuxtLink>
                  </h3>
                </div>
                <div class="px-5 py-2">
                  <div class="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-950 flex items-center justify-center border border-slate-800">
                    <img src="/assets/img/banners/placeholder.webp" alt="Setup Neovim" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 shadow-md">
                      Entorno & Productividad
                    </span>
                  </div>
                </div>
                <div class="p-5 pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-mono block mb-2">hace 2 meses · 8 min de lectura</span>
                    <p class="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      Configuración declarativa basada en Lua, atajos de teclado sin despegar los dedos del home row y sincronización de dotfiles con Git bare repo.
                    </p>
                  </div>
                  <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
                    <span class="text-slate-400 text-xs flex items-center gap-1 font-mono">
                      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      14 comentarios
                    </span>
                    <NuxtLink to="/blog/setup-desarrollo-linux-neovim-tmux" class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow">
                      Leer
                    </NuxtLink>
                  </div>
                </div>
              </article>
            </div>

            <!-- BLOG 2 -->
            <div class="swiper-slide">
              <article class="bg-slate-900/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col h-full hover:border-emerald-500/50 transition-colors group">
                <div class="p-5 pb-3">
                  <h3 class="font-heading font-bold text-lg text-white group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
                    <NuxtLink to="/blog/migracion-docker-a-podman-servidores">
                      Por qué migré de Docker a Podman en todos mis servidores locales
                    </NuxtLink>
                  </h3>
                </div>
                <div class="px-5 py-2">
                  <div class="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-950 flex items-center justify-center border border-slate-800">
                    <img src="/assets/img/banners/reading.webp" alt="Podman Servidores" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500 text-slate-950 shadow-md">
                      Contenedores
                    </span>
                  </div>
                </div>
                <div class="p-5 pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-mono block mb-2">hace 2 meses · 7 min de lectura</span>
                    <p class="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      Ventajas de la arquitectura rootless sin demonio central, compatibilidad con docker-compose y generación nativa de unidades systemd con quadlets.
                    </p>
                  </div>
                  <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
                    <span class="text-slate-400 text-xs flex items-center gap-1 font-mono">
                      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      11 comentarios
                    </span>
                    <NuxtLink to="/blog/migracion-docker-a-podman-servidores" class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow">
                      Leer
                    </NuxtLink>
                  </div>
                </div>
              </article>
            </div>

            <!-- BLOG 3 -->
            <div class="swiper-slide">
              <article class="bg-slate-900/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col h-full hover:border-emerald-500/50 transition-colors group">
                <div class="p-5 pb-3">
                  <h3 class="font-heading font-bold text-lg text-white group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
                    <NuxtLink to="/blog/reflexiones-25-anos-software-libre">
                      Reflexiones sobre 25 años usando software libre y GNU/Linux
                    </NuxtLink>
                  </h3>
                </div>
                <div class="px-5 py-2">
                  <div class="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-950 flex items-center justify-center border border-slate-800">
                    <img src="/assets/img/soft-skills/gnu_linux.webp" alt="Reflexiones Linux" class="w-28 h-28 object-contain group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950 shadow-md">
                      Opinión & Filosofía
                    </span>
                  </div>
                </div>
                <div class="p-5 pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-mono block mb-2">hace 2 meses · 10 min de lectura</span>
                    <p class="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      Desde los primeros disquetes de Slackware hasta la nube moderna. Lecciones aprendidas, evolución del kernel y el valor incalculable de la comunidad.
                    </p>
                  </div>
                  <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
                    <span class="text-slate-400 text-xs flex items-center gap-1 font-mono">
                      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      27 comentarios
                    </span>
                    <NuxtLink to="/blog/reflexiones-25-anos-software-libre" class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow">
                      Leer
                    </NuxtLink>
                  </div>
                </div>
              </article>
            </div>

            <!-- BLOG 4 -->
            <div class="swiper-slide">
              <article class="bg-slate-900/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col h-full hover:border-emerald-500/50 transition-colors group">
                <div class="p-5 pb-3">
                  <h3 class="font-heading font-bold text-lg text-white group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
                    <NuxtLink to="/blog/automatizando-backups-restic-backblaze">
                      Automatizando copias de seguridad inmutables con Restic y Backblaze B2
                    </NuxtLink>
                  </h3>
                </div>
                <div class="px-5 py-2">
                  <div class="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-950 flex items-center justify-center border border-slate-800">
                    <img src="/assets/img/banners/placeholder.webp" alt="Backups Restic" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500 text-slate-950 shadow-md">
                      Sysadmin & Backups
                    </span>
                  </div>
                </div>
                <div class="p-5 pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-mono block mb-2">hace 3 semanas · 6 min de lectura</span>
                    <p class="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      Estrategia 3-2-1 con cifrado en reposo del lado cliente, deduplicación a nivel de bloques y ejecución periódica desatendida mediante systemd timers.
                    </p>
                  </div>
                  <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
                    <span class="text-slate-400 text-xs flex items-center gap-1 font-mono">
                      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      18 comentarios
                    </span>
                    <NuxtLink to="/blog/automatizando-backups-restic-backblaze" class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow">
                      Leer
                    </NuxtLink>
                  </div>
                </div>
              </article>
            </div>

            <!-- BLOG 5 -->
            <div class="swiper-slide">
              <article class="bg-slate-900/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col h-full hover:border-emerald-500/50 transition-colors group">
                <div class="p-5 pb-3">
                  <h3 class="font-heading font-bold text-lg text-white group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
                    <NuxtLink to="/blog/de-zsh-a-fish-y-bash-portabilidad">
                      De Zsh a Fish y de vuelta a Bash: Mis aprendizajes sobre portabilidad en scripts
                    </NuxtLink>
                  </h3>
                </div>
                <div class="px-5 py-2">
                  <div class="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-950 flex items-center justify-center border border-slate-800">
                    <img src="/assets/img/soft-skills/cloud.webp" alt="Shell Scripting" class="w-28 h-28 object-contain group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500 text-white shadow-md">
                      Terminal & Shell
                    </span>
                  </div>
                </div>
                <div class="p-5 pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-mono block mb-2">hace 1 mes · 9 min de lectura</span>
                    <p class="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      Por qué la comodidad interactiva no debe comprometer la estricta compatibilidad POSIX cuando redactas automatizaciones críticas de servidores.
                    </p>
                  </div>
                  <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
                    <span class="text-slate-400 text-xs flex items-center gap-1 font-mono">
                      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      22 comentarios
                    </span>
                    <NuxtLink to="/blog/de-zsh-a-fish-y-bash-portabilidad" class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow">
                      Leer
                    </NuxtLink>
                  </div>
                </div>
              </article>
            </div>

            <!-- BLOG 6 -->
            <div class="swiper-slide">
              <article class="bg-slate-900/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col h-full hover:border-emerald-500/50 transition-colors group">
                <div class="p-5 pb-3">
                  <h3 class="font-heading font-bold text-lg text-white group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
                    <NuxtLink to="/blog/home-server-silencioso-debian-12">
                      Montando un Home Server silencioso y de bajo consumo con Debian 12
                    </NuxtLink>
                  </h3>
                </div>
                <div class="px-5 py-2">
                  <div class="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-950 flex items-center justify-center border border-slate-800">
                    <img src="/assets/img/banners/placeholder.webp" alt="Home Server Debian" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 shadow-md">
                      Hardware & Self-Hosting
                    </span>
                  </div>
                </div>
                <div class="p-5 pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span class="text-slate-400 text-xs font-mono block mb-2">hace 1 mes · 12 min de lectura</span>
                    <p class="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      Elección de hardware N100 con 6W de TDP, gestión de almacenamiento con pools ZFS en espejo y servicios esenciales para el hogar inteligente.
                    </p>
                  </div>
                  <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
                    <span class="text-slate-400 text-xs flex items-center gap-1 font-mono">
                      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      31 comentarios
                    </span>
                    <NuxtLink to="/blog/home-server-silencioso-debian-12" class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow">
                      Leer
                    </NuxtLink>
                  </div>
                </div>
              </article>
            </div>

          </div>

          <!-- Paginación Swiper -->
          <div class="swiper-pagination swiper-pagination-blog mt-4"></div>
        </div>

        <!-- Botones de Navegación situados fuera del swiper con overflow:hidden -->
        <button type="button" aria-label="Entrada anterior" class="swiper-button-prev swiper-button-prev-blog !text-emerald-400 !w-10 !h-10 !bg-slate-900/90 hover:!bg-slate-800 rounded-full border border-slate-700/80 shadow-xl after:!text-sm !left-0 sm:!-left-2 transition-all flex items-center justify-center cursor-pointer"></button>
        <button type="button" aria-label="Entrada siguiente" class="swiper-button-next swiper-button-next-blog !text-emerald-400 !w-10 !h-10 !bg-slate-900/90 hover:!bg-slate-800 rounded-full border border-slate-700/80 shadow-xl after:!text-sm !right-0 sm:!-right-2 transition-all flex items-center justify-center cursor-pointer"></button>
      </div>

    </div>
  </section>
  </div>
</template>
