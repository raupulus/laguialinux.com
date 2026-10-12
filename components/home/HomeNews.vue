<script setup lang="ts">
const { platform } = usePlatform()
</script>

<template>
  <div>
<!-- BANNER ÚLTIMA HORA (BREAKING NEWS TICKER) -->
  <div class="bg-slate-900/90 border-b border-slate-800 text-xs px-4 py-2">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-3">
      <div class="flex items-center gap-2 overflow-hidden">
        <span class="px-2 py-0.5 rounded bg-red-600 text-white font-black font-mono uppercase text-[10px] shrink-0 tracking-wider animate-pulse">
          Última Hora
        </span>
        <span class="text-slate-200 truncate text-xs">
          Publicada actualización de seguridad crítica para OpenSSH (CVE-2026-...) frente a posibles ataques de denegación de servicio.
        </span>
      </div>
      <a href="/noticia" class="shrink-0 text-red-300 hover:text-white font-bold underline font-mono text-[11px]">
        Leer comunicado →
      </a>
    </div>
  </div>
  <!-- MONITOR DE ALERTAS CVE CRÍTICAS (4.13) -->
  <div id="lgl-cve-alert" class="max-w-7xl mx-auto w-full px-4 mt-4">
    <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-red-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-lg">
      <div class="flex items-start sm:items-center gap-2.5">
        <span class="px-2 py-0.5 rounded-md bg-red-600 text-white font-mono font-black text-[10px] tracking-wider uppercase shrink-0 shadow-sm">
          ALERTA CVE CRÍTICA
        </span>
        <div class="space-y-0.5">
          <span class="font-mono text-red-300 font-bold">CVE-2024-6387 (RegreSSHion):</span>
          <span class="text-slate-300">Vulnerabilidad de ejecución remota de código en OpenSSH (CVSS 9.8). Afecta a servidores con glibc.</span>
        </div>
      </div>
      <div class="flex items-center gap-3 shrink-0 self-end sm:self-center">
        <a href="/noticia" class="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold font-mono text-[11px] transition-colors shadow">
          Ver Mitigación y Parche →
        </a>
        <button type="button" onclick="dismissCveAlert()" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-red-900/40 transition-colors" title="Descartar alerta">✕</button>
      </div>
    </div>
  </div>

  <!-- WIDGET KERNEL WATCHER (4.12 - CLIENT-SIDE AUTOMATIZADO SIN NODEJS) -->
  <div class="max-w-7xl mx-auto w-full px-4 mt-3">
    <div class="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono shadow-md">
      <div class="flex items-center gap-2 text-slate-300">
        <span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
        <span class="font-bold text-white flex items-center gap-1.5">
          <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/></svg>
          Kernel Watcher:
        </span>
        <span class="text-slate-500 hidden lg:inline">Versiones oficiales activas de kernel.org</span>
      </div>

      <div class="flex flex-wrap items-center gap-2.5 text-[11px]" id="kernel-releases-container">
        <span class="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
          Mainline: <strong id="k-mainline" class="font-bold">6.14-rc1</strong>
        </span>
        <span class="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
          Stable: <strong id="k-stable" class="font-bold">6.13.2</strong>
        </span>
        <span class="px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300">
          LTS: <strong id="k-lts" class="font-bold">6.6.77 · 6.1.128</strong>
        </span>
        <a href="https://www.kernel.org" target="_blank" rel="noopener" class="text-slate-500 hover:text-slate-300 text-[10px] underline ml-1 font-sans">
          kernel.org ↗
        </a>
      </div>
    </div>
  </div>

  <!-- BANNER ADSENSE TOP DISPLAY (728x90) -->
  <div class="max-w-7xl mx-auto w-full px-4 mt-4">
    <div class="w-full min-h-[90px] rounded-xl border border-dashed border-slate-800 bg-slate-900/40 flex flex-col items-center justify-center text-xs text-slate-500">
      <span class="font-semibold text-slate-400 uppercase tracking-widest text-[10px]">Espacio Publicitario</span>
      <span>Google AdSense — Top Leaderboard (728x90 / 320x100)</span>
    </div>
  </div>

  <!-- MAIN CONTENT -->
  <main class="max-w-7xl mx-auto w-full px-4 lg:px-8 py-8 flex-1 space-y-12">
    
    <!-- 1. PORTADA EDITORIAL (HERO LEAD STORY + STACK SECUNDARIO) -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- NOTICIA PRINCIPAL DE PORTADA (LEAD STORY) -->
      <article class="lg:col-span-8 bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-3xl overflow-hidden transition-all duration-300 shadow-2xl group flex flex-col justify-between">
        <div class="relative aspect-video sm:aspect-[21/9] w-full bg-slate-950 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
          <img src="/assets/img/covers/hero_news.webp" width="1280" height="720" alt="La Guía Linux News · Actualidad y Kernel Linux" class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500">
          <div class="absolute top-4 left-4 z-20 flex items-center gap-2">
            <span class="px-3 py-1 rounded-full bg-orange-600 text-white font-black text-xs uppercase tracking-wider shadow-lg">
              Kernel 6.12
            </span>
            <span class="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur text-slate-300 text-[11px] font-mono border border-slate-700">
              LKML Oficial
            </span>
          </div>
        </div>

        <div class="p-6 sm:p-8 space-y-4">
          <div class="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span>⏱️ 3 min de lectura</span>
            <span>·</span>
            <span class="text-orange-400 font-bold">Hace 45 minutos</span>
            <span>·</span>
            <span>Por Raúl Caro Pastorino</span>
          </div>

          <h1 class="font-heading text-2xl sm:text-4xl font-black text-white group-hover:text-orange-400 transition-colors leading-tight">
            <a href="/noticia">
              Linux Kernel 6.12 lanzado con soporte oficial para Real-Time (PREEMPT_RT)
            </a>
          </h1>

          <p class="text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3 font-normal">
            Linus Torvalds ha anunciado oficialmente la disponibilidad de Linux 6.12. La gran novedad histórica es la integración definitiva de los parches PREEMPT_RT en la rama principal, abriendo la puerta a sistemas de control industrial, robótica y audio profesional sin bifurcaciones de terceros.
          </p>

          <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div class="flex flex-wrap gap-2 text-xs font-mono">
              <span class="text-slate-400 bg-slate-950 border border-slate-800/80 px-2.5 py-1 rounded-lg">#kernel</span>
              <span class="text-slate-400 bg-slate-950 border border-slate-800/80 px-2.5 py-1 rounded-lg">#realtime</span>
              <span class="text-slate-400 bg-slate-950 border border-slate-800/80 px-2.5 py-1 rounded-lg">#preempt-rt</span>
            </div>
            <a href="/noticia" class="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md">
              <span>Leer Noticia Completa</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </article>

      <!-- STACK LATERAL DE TITULARES DESTACADOS -->
      <div class="lg:col-span-4 space-y-4">
        <div class="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold px-1 flex items-center justify-between">
          <span>Actualidad Destacada</span>
          <span class="text-amber-400">En Tiempo Real</span>
        </div>

        <!-- Titular Secundario 1 -->
        <article class="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all group shadow-lg">
          <div class="flex items-center justify-between gap-2 text-xs mb-2">
            <span class="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20 text-[10px] font-mono">
              Distribuciones
            </span>
            <span class="text-[11px] text-slate-500 font-mono">Hace 2 horas</span>
          </div>
          <h3 class="font-heading text-base font-bold text-white group-hover:text-orange-400 transition-colors leading-snug mb-2">
            <a href="/noticia">
              Debian 13 "Trixie" entra en su primera fase de congelamiento con base Linux 6.12
            </a>
          </h3>
          <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
            El equipo de lanzamiento de Debian detalla el cronograma hacia la versión estable, confirmando arquitectura RISC-V de 64 bits como objetivo oficial.
          </p>
        </article>

        <!-- Titular Secundario 2 -->
        <article class="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all group shadow-lg">
          <div class="flex items-center justify-between gap-2 text-xs mb-2">
            <span class="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-bold border border-red-500/20 text-[10px] font-mono">
              Ciberseguridad
            </span>
            <span class="text-[11px] text-slate-500 font-mono">Hace 4 horas</span>
          </div>
          <h3 class="font-heading text-base font-bold text-white group-hover:text-orange-400 transition-colors leading-snug mb-2">
            <a href="/noticia">
              Vulnerabilidad Zero-Day detectada en servidores de impresión CUPS: parches listos
            </a>
          </h3>
          <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
            Múltiples distribuciones lanzan actualizaciones urgentes para neutralizar paquetes maliciosos enviados por el puerto 631 UDP.
          </p>
        </article>

        <!-- Titular Secundario 3 -->
        <article class="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all group shadow-lg">
          <div class="flex items-center justify-between gap-2 text-xs mb-2">
            <span class="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20 text-[10px] font-mono">
              Software
            </span>
            <span class="text-[11px] text-slate-500 font-mono">Hace 6 horas</span>
          </div>
          <h3 class="font-heading text-base font-bold text-white group-hover:text-orange-400 transition-colors leading-snug mb-2">
            <a href="/noticia">
              KDE Plasma 6.2 introduce mejoras de escalado fraccional y gestión de color HDR
            </a>
          </h3>
          <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
            La nueva actualización del entorno de escritorio perfecciona el renderizado en Wayland para paneles multimonitor de alta densidad.
          </p>
        </article>

      </div>
    </section>

    <!-- 2. PÍLDORAS DE FILTRADO RÁPIDO POR SECCIÓN -->
    <div class="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-800 text-xs">
      <span class="text-slate-500 font-semibold uppercase tracking-wider text-[11px] whitespace-nowrap mr-1">Filtrar flujo:</span>
      <a href="/categoria" class="px-3.5 py-1.5 rounded-full bg-orange-600 text-white font-bold whitespace-nowrap shadow-sm shadow-orange-500/20">Todas las noticias</a>
      <a href="/categoria/kernel-desarrollo" class="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white whitespace-nowrap transition-colors border border-slate-800">Kernel Linux</a>
      <a href="/categoria/distribuciones" class="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white whitespace-nowrap transition-colors border border-slate-800">Distribuciones</a>
      <a href="/categoria/ciberseguridad" class="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap transition-colors">Ciberseguridad</a>
      <a href="/categoria/software-apps" class="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap transition-colors">Software y Apps</a>
      <a href="/categoria/hardware-dispositivos" class="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap transition-colors">Hardware y ARM</a>
      <a href="/categoria/comunidad-open-source" class="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap transition-colors">Comunidad</a>
    </div>

    <!-- 3. FEED DE NOTICIAS CRONOLÓGICAS (LATEST) + SIDEBAR TENDENCIAS -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- FLUJO DE NOTICIAS PERIODÍSTICAS CON TARJETAS POP-OUT ESTILO EDITORIAL -->
      <section class="lg:col-span-8 space-y-10 pl-0 md:pl-10">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 class="font-heading text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <span class="w-3 h-3 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50"></span>
            Últimas Noticias de la Comunidad
          </h2>
          <span class="text-xs text-slate-400 font-mono">Actualizado continuamente</span>
        </div>

        <div class="space-y-10">
          
          <!-- Noticia Pop-Out 1: Hardware y ARM -->
          <article class="group rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl relative overflow-visible hover:border-orange-500/50 transition-all duration-300">
            <div class="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-stretch">
              
              <!-- COLUMNA IZQUIERDA: IMAGEN POP-OUT LATERAL -->
              <div class="p-6 md:py-8 flex items-center justify-center">
                <div class="w-36 h-36 sm:w-44 sm:h-44 pop-img-horizontal rounded-3xl bg-slate-950 p-2.5 border-4 border-slate-800 shadow-2xl shadow-emerald-500/10 flex items-center justify-center shrink-0">
                  <img src="/assets/img/soft-skills/cloud.webp" width="176" height="176" alt="Raspberry Pi 5" class="w-full h-full object-contain">
                </div>
              </div>

              <!-- COLUMNA CENTRAL: CONTENIDO PRINCIPAL -->
              <div class="p-6 md:py-8 md:pl-2 md:pr-6 flex flex-col justify-center">
                <div class="flex flex-wrap items-center gap-2.5 mb-2.5">
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Hardware y ARM
                  </span>
                  <span class="text-slate-400 text-xs italic font-serif">Ayer a las 18:30</span>
                  <span class="text-slate-600">•</span>
                  <span class="text-slate-400 text-xs font-mono">3 min lectura</span>
                </div>

                <h3 class="font-heading font-black text-xl lg:text-2xl text-white group-hover:text-orange-400 transition-colors leading-snug mb-3">
                  <a href="/noticia">
                    Raspberry Pi Foundation presenta la Raspberry Pi 5 con 2GB de RAM a precio reducido
                  </a>
                </h3>

                <p class="text-slate-300 text-xs sm:text-sm leading-relaxed mb-5 font-normal line-clamp-3">
                  La nueva variante de bajo coste reduce el precio de entrada a la quinta generación manteniendo el procesador Broadcom BCM2712 a 2.4 GHz, con bus PCIe 2.0 y soporte oficial de Raspberry Pi OS de 64 bits.
                </p>

                <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                  <a href="/noticia" class="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-colors">
                    <span>Leer noticia completa</span>
                    <span>→</span>
                  </a>
                  <div class="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span class="text-slate-500">Fuente:</span>
                    <span class="text-slate-300 font-semibold">raspberrypi.com</span>
                    <span>·</span>
                    <span>💬 14</span>
                  </div>
                </div>
              </div>

              <!-- COLUMNA DERECHA: SIDEBAR DE ACCIONES / FUENTE OFICIAL -->
              <aside aria-label="Acciones de la noticia" class="bg-slate-950/80 border-t md:border-t-0 md:border-l border-slate-800/80 rounded-b-3xl md:rounded-b-none md:rounded-r-3xl px-3 py-6 flex md:flex-col items-center justify-around gap-4 text-slate-400">
                <a href="https://www.raspberrypi.com/news/" target="_blank" rel="noopener noreferrer" title="Ir a la fuente original externa" class="p-2 rounded-xl hover:bg-slate-800 hover:text-orange-400 transition-all text-base" aria-label="Fuente original">
                  🌐
                </a>
                <button type="button" onclick="copyNewsLink(this, '/noticia')" title="Copiar enlace" class="p-2 rounded-xl hover:bg-slate-800 hover:text-white transition-all text-base" aria-label="Copiar enlace">
                  🔗
                </button>
                <a href="../feeds.html" title="Canal RSS" class="p-2 rounded-xl hover:bg-slate-800 hover:text-amber-400 transition-all text-base" aria-label="Canal RSS">
                  📡
                </a>
                <a href="/noticia" title="Comentar" class="p-2 rounded-xl hover:bg-slate-800 hover:text-emerald-400 transition-all text-base" aria-label="Comentarios">
                  💬
                </a>
              </aside>

            </div>
          </article>

          <!-- Noticia Pop-Out 2: Comunidad -->
          <article class="group rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl relative overflow-visible hover:border-amber-500/50 transition-all duration-300">
            <div class="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-stretch">
              
              <!-- COLUMNA IZQUIERDA: IMAGEN POP-OUT LATERAL -->
              <div class="p-6 md:py-8 flex items-center justify-center">
                <div class="w-36 h-36 sm:w-44 sm:h-44 pop-img-horizontal rounded-3xl bg-slate-950 p-2.5 border-4 border-slate-800 shadow-2xl shadow-amber-500/10 flex items-center justify-center shrink-0">
                  <img src="/assets/img/soft-skills/gnu_linux.webp" width="176" height="176" alt="FOSDEM 2027" class="w-full h-full object-contain">
                </div>
              </div>

              <!-- COLUMNA CENTRAL: CONTENIDO PRINCIPAL -->
              <div class="p-6 md:py-8 md:pl-2 md:pr-6 flex flex-col justify-center">
                <div class="flex flex-wrap items-center gap-2.5 mb-2.5">
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Comunidad Open Source
                  </span>
                  <span class="text-slate-400 text-xs italic font-serif">Ayer a las 14:15</span>
                  <span class="text-slate-600">•</span>
                  <span class="text-slate-400 text-xs font-mono">4 min lectura</span>
                </div>

                <h3 class="font-heading font-black text-xl lg:text-2xl text-white group-hover:text-amber-400 transition-colors leading-snug mb-3">
                  <a href="/noticia">
                    Abre el registro de charlas para FOSDEM 2027: devrooms de Rust, Kernel y Sysadmin
                  </a>
                </h3>

                <p class="text-slate-300 text-xs sm:text-sm leading-relaxed mb-5 font-normal line-clamp-3">
                  El mayor encuentro europeo de desarrolladores de software libre en Bruselas abre su convocatoria de propuestas (CfP). Se esperan más de 8.000 asistentes en las salas temáticas de virtualización, contenedores y seguridad del kernel.
                </p>

                <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                  <a href="/noticia" class="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-md transition-colors">
                    <span>Leer noticia completa</span>
                    <span>→</span>
                  </a>
                  <div class="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span class="text-slate-500">Fuente:</span>
                    <span class="text-slate-300 font-semibold">fosdem.org</span>
                    <span>·</span>
                    <span>💬 28</span>
                  </div>
                </div>
              </div>

              <!-- COLUMNA DERECHA: SIDEBAR DE ACCIONES -->
              <aside aria-label="Acciones de la noticia" class="bg-slate-950/80 border-t md:border-t-0 md:border-l border-slate-800/80 rounded-b-3xl md:rounded-b-none md:rounded-r-3xl px-3 py-6 flex md:flex-col items-center justify-around gap-4 text-slate-400">
                <a href="https://fosdem.org" target="_blank" rel="noopener noreferrer" title="Ir a la web de FOSDEM" class="p-2 rounded-xl hover:bg-slate-800 hover:text-amber-400 transition-all text-base" aria-label="Web oficial">
                  🌐
                </a>
                <button type="button" onclick="copyNewsLink(this, '/noticia')" title="Copiar enlace" class="p-2 rounded-xl hover:bg-slate-800 hover:text-white transition-all text-base" aria-label="Copiar enlace">
                  🔗
                </button>
                <a href="../feeds.html" title="Canal RSS" class="p-2 rounded-xl hover:bg-slate-800 hover:text-amber-400 transition-all text-base" aria-label="Canal RSS">
                  📡
                </a>
                <a href="/noticia" title="Comentar" class="p-2 rounded-xl hover:bg-slate-800 hover:text-emerald-400 transition-all text-base" aria-label="Comentarios">
                  💬
                </a>
              </aside>

            </div>
          </article>

          <!-- BANNER ADSENSE IN-FEED (ANTI-CLS) -->
          <div class="w-full min-h-[100px] rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-4 flex flex-col items-center justify-center text-xs text-slate-500 shadow-inner">
            <span class="font-semibold text-slate-400 uppercase tracking-widest text-[10px] mb-1">Espacio Publicitario</span>
            <span>Google AdSense — In-Feed Native Editorial (Adaptable)</span>
          </div>

          <!-- Noticia Pop-Out 3: Distribuciones -->
          <article class="group rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl relative overflow-visible hover:border-indigo-500/50 transition-all duration-300">
            <div class="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-stretch">
              
              <!-- COLUMNA IZQUIERDA: IMAGEN POP-OUT LATERAL -->
              <div class="p-6 md:py-8 flex items-center justify-center">
                <div class="w-36 h-36 sm:w-44 sm:h-44 pop-img-horizontal rounded-3xl bg-slate-950 p-2.5 border-4 border-slate-800 shadow-2xl shadow-indigo-500/10 flex items-center justify-center shrink-0">
                  <img src="/assets/img/soft-skills/logotipo.webp" width="176" height="176" alt="Arch Linux" class="w-full h-full object-contain">
                </div>
              </div>

              <!-- COLUMNA CENTRAL: CONTENIDO PRINCIPAL -->
              <div class="p-6 md:py-8 md:pl-2 md:pr-6 flex flex-col justify-center">
                <div class="flex flex-wrap items-center gap-2.5 mb-2.5">
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Distribuciones
                  </span>
                  <span class="text-slate-400 text-xs italic font-serif">09 Oct 2026</span>
                  <span class="text-slate-600">•</span>
                  <span class="text-slate-400 text-xs font-mono">5 min lectura</span>
                </div>

                <h3 class="font-heading font-black text-xl lg:text-2xl text-white group-hover:text-indigo-400 transition-colors leading-snug mb-3">
                  <a href="/noticia">
                    Arch Linux adopta Zstandard con nivel 19 como compresión estándar para repositorios
                  </a>
                </h3>

                <p class="text-slate-300 text-xs sm:text-sm leading-relaxed mb-5 font-normal line-clamp-3">
                  La medida optimiza el ancho de banda global de los servidores réplica y acelera de forma dramática la descompresión de paquetes en instalaciones limpias y actualizaciones de sistema con pacman.
                </p>

                <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                  <a href="/noticia" class="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors">
                    <span>Leer noticia completa</span>
                    <span>→</span>
                  </a>
                  <div class="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span class="text-slate-500">Fuente:</span>
                    <span class="text-slate-300 font-semibold">archlinux.org</span>
                    <span>·</span>
                    <span>💬 19</span>
                  </div>
                </div>
              </div>

              <!-- COLUMNA DERECHA: SIDEBAR DE ACCIONES -->
              <aside aria-label="Acciones de la noticia" class="bg-slate-950/80 border-t md:border-t-0 md:border-l border-slate-800/80 rounded-b-3xl md:rounded-b-none md:rounded-r-3xl px-3 py-6 flex md:flex-col items-center justify-around gap-4 text-slate-400">
                <a href="https://archlinux.org/news/" target="_blank" rel="noopener noreferrer" title="Ir a la web de Arch Linux" class="p-2 rounded-xl hover:bg-slate-800 hover:text-indigo-400 transition-all text-base" aria-label="Web oficial">
                  🌐
                </a>
                <button type="button" onclick="copyNewsLink(this, '/noticia')" title="Copiar enlace" class="p-2 rounded-xl hover:bg-slate-800 hover:text-white transition-all text-base" aria-label="Copiar enlace">
                  🔗
                </button>
                <a href="../feeds.html" title="Canal RSS" class="p-2 rounded-xl hover:bg-slate-800 hover:text-indigo-400 transition-all text-base" aria-label="Canal RSS">
                  📡
                </a>
                <a href="/noticia" title="Comentar" class="p-2 rounded-xl hover:bg-slate-800 hover:text-emerald-400 transition-all text-base" aria-label="Comentarios">
                  💬
                </a>
              </aside>

            </div>
          </article>

          <!-- Noticia Pop-Out 4: Ciberseguridad -->
          <article class="group rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl relative overflow-visible hover:border-red-500/50 transition-all duration-300">
            <div class="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-stretch">
              
              <!-- COLUMNA IZQUIERDA: IMAGEN POP-OUT LATERAL -->
              <div class="p-6 md:py-8 flex items-center justify-center">
                <div class="w-36 h-36 sm:w-44 sm:h-44 pop-img-horizontal rounded-3xl bg-slate-950 p-2.5 border-4 border-slate-800 shadow-2xl shadow-red-500/10 flex items-center justify-center shrink-0">
                  <img src="/assets/img/banners/placeholder.webp" width="176" height="176" alt="Ciberseguridad Linux" class="w-full h-full object-cover rounded-2xl">
                </div>
              </div>

              <!-- COLUMNA CENTRAL: CONTENIDO PRINCIPAL -->
              <div class="p-6 md:py-8 md:pl-2 md:pr-6 flex flex-col justify-center">
                <div class="flex flex-wrap items-center gap-2.5 mb-2.5">
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    Ciberseguridad & Sysadmin
                  </span>
                  <span class="text-slate-400 text-xs italic font-serif">07 Oct 2026</span>
                  <span class="text-slate-600">•</span>
                  <span class="text-slate-400 text-xs font-mono">6 min lectura</span>
                </div>

                <h3 class="font-heading font-black text-xl lg:text-2xl text-white group-hover:text-red-400 transition-colors leading-snug mb-3">
                  <a href="/noticia">
                    Auditoría de elevación de privilegios: nuevos vectores de ataque en configuraciones de Sudo y Polkit
                  </a>
                </h3>

                <p class="text-slate-300 text-xs sm:text-sm leading-relaxed mb-5 font-normal line-clamp-3">
                  Investigadores de seguridad detallan cómo reglas permisivas en sudoers y tokens mal configurados en polkit permiten escapes locales a root en servidores desatendidos.
                </p>

                <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                  <a href="/noticia" class="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-colors">
                    <span>Leer noticia completa</span>
                    <span>→</span>
                  </a>
                  <div class="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span class="text-slate-500">Fuente:</span>
                    <span class="text-slate-300 font-semibold">seclists.org</span>
                    <span>·</span>
                    <span>💬 31</span>
                  </div>
                </div>
              </div>

              <!-- COLUMNA DERECHA: SIDEBAR DE ACCIONES -->
              <aside aria-label="Acciones de la noticia" class="bg-slate-950/80 border-t md:border-t-0 md:border-l border-slate-800/80 rounded-b-3xl md:rounded-b-none md:rounded-r-3xl px-3 py-6 flex md:flex-col items-center justify-around gap-4 text-slate-400">
                <a href="https://seclists.org" target="_blank" rel="noopener noreferrer" title="Ir a seclists" class="p-2 rounded-xl hover:bg-slate-800 hover:text-red-400 transition-all text-base" aria-label="Web oficial">
                  🌐
                </a>
                <button type="button" onclick="copyNewsLink(this, '/noticia')" title="Copiar enlace" class="p-2 rounded-xl hover:bg-slate-800 hover:text-white transition-all text-base" aria-label="Copiar enlace">
                  🔗
                </button>
                <a href="../feeds.html" title="Canal RSS" class="p-2 rounded-xl hover:bg-slate-800 hover:text-red-400 transition-all text-base" aria-label="Canal RSS">
                  📡
                </a>
                <a href="/noticia" title="Comentar" class="p-2 rounded-xl hover:bg-slate-800 hover:text-emerald-400 transition-all text-base" aria-label="Comentarios">
                  💬
                </a>
              </aside>

            </div>
          </article>

        </div>
      </section>

      <!-- BARRA LATERAL NEWS (TENDENCIAS 72H + BOLETÍN + ADSENSE) -->
      <aside class="lg:col-span-4 space-y-6">
        
        <!-- Tendencias (Ranking de Lectura 72h) -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 class="font-heading text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <span class="text-orange-500">🔥</span> Lo Más Leído (72 horas)
            </h3>
            <span class="text-[10px] font-mono text-slate-400">Tendencia</span>
          </div>

          <div class="space-y-4 text-xs">
            <a href="/noticia" class="flex items-start gap-3 group">
              <span class="font-mono font-black text-orange-500 text-base">01</span>
              <div>
                <h4 class="font-heading font-semibold text-slate-200 group-hover:text-orange-400 transition-colors leading-snug">
                  Linux Kernel 6.12 lanzado con soporte oficial PREEMPT_RT
                </h4>
                <div class="text-[11px] text-slate-400 font-mono mt-0.5">hace 45 min · 2,410 lecturas</div>
              </div>
            </a>

            <a href="/noticia" class="flex items-start gap-3 group">
              <span class="font-mono font-black text-slate-500 group-hover:text-orange-400 transition-colors text-base">02</span>
              <div>
                <h4 class="font-heading font-semibold text-slate-200 group-hover:text-orange-400 transition-colors leading-snug">
                  Vulnerabilidad Zero-Day en CUPS: cómo verificar si tu servidor está expuesto
                </h4>
                <div class="text-[11px] text-slate-400 font-mono mt-0.5">hace 4 h · 1,930 lecturas</div>
              </div>
            </a>

            <a href="/noticia" class="flex items-start gap-3 group">
              <span class="font-mono font-black text-slate-500 group-hover:text-orange-400 transition-colors text-base">03</span>
              <div>
                <h4 class="font-heading font-semibold text-slate-200 group-hover:text-orange-400 transition-colors leading-snug">
                  Debian 13 "Trixie" congela sus paquetes base
                </h4>
                <div class="text-[11px] text-slate-400 font-mono mt-0.5">hace 2 h · 1,220 lecturas</div>
              </div>
            </a>

            <a href="/noticia" class="flex items-start gap-3 group">
              <span class="font-mono font-black text-slate-500 group-hover:text-orange-400 transition-colors text-base">04</span>
              <div>
                <h4 class="font-heading font-semibold text-slate-200 group-hover:text-orange-400 transition-colors leading-snug">
                  Lanzamiento de KDE Plasma 6.2 con Wayland perfeccionado
                </h4>
                <div class="text-[11px] text-slate-400 font-mono mt-0.5">hace 6 h · 980 lecturas</div>
              </div>
            </a>
          </div>
        </div>

        <!-- BOLETÍN DE NOTICIAS -->
        <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-orange-500/30 rounded-2xl p-6 shadow-xl">
          <div class="flex items-center gap-2 text-xs font-mono text-orange-400 font-bold mb-2">
            <span>⚡</span> Resumen Semanal News
          </div>
          <h3 class="font-heading text-base font-bold text-white mb-2">Las noticias clave de Linux sin ruido</h3>
          <p class="text-xs text-slate-300 mb-4 leading-relaxed font-normal">
            Cada viernes un boletín condensado con los parches del kernel, lanzamientos de distros y alertas de seguridad. Sin spam.
          </p>
          <form class="space-y-3" onsubmit="event.preventDefault(); alert('Suscripción a News recibida.');">
            <input type="email" required placeholder="tu-correo@ejemplo.com" class="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono">
            <button type="submit" class="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition-colors font-mono uppercase tracking-wider shadow-md">
              Suscribirme a News
            </button>
          </form>
        </div>

        <!-- ESPACIO PUBLICITARIO SIDEBAR (300x250) -->
        <div class="w-full min-h-[250px] rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-4 flex flex-col items-center justify-center text-xs text-slate-500 shadow-inner">
          <span class="font-semibold text-slate-400 uppercase tracking-widest text-[10px] mb-1">Espacio Publicitario</span>
          <span>Google AdSense — Sidebar Sticky (300x250)</span>
        </div>

      </aside>

    </div>

  </main>
  </div>
</template>
