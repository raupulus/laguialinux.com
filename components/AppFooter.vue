<script setup lang="ts">
const { platform, isGuides } = usePlatform()
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-slate-800/80 bg-[#05080f] text-slate-400 mt-auto">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      
      <div class="grid grid-cols-1 gap-8 md:grid-cols-4 pb-10 border-b border-slate-800/80">
        
        <!-- COLUMNA 1: HECHO CON AMOR Y STACK ANIMADO -->
        <div class="flex flex-col">
          <div class="flex items-center gap-2 mb-3">
            <span class="font-heading font-extrabold text-white text-base">Hecho con</span>
            <!-- CORAZÓN PULSANTE SVG ANIMADO -->
            <svg viewBox="0 0 100 100" class="w-5 h-5 inline-block shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path fill="#ef4444" d="M92.71,7.27L92.71,7.27c-9.71-9.69-25.46-9.69-35.18,0L50,14.79l-7.54-7.52C32.75-2.42,17-2.42,7.29,7.27v0 c-9.71,9.69-9.71,25.41,0,35.1L50,85l42.71-42.63C102.43,32.68,102.43,16.96,92.71,7.27z"/>
              <animateTransform attributeName="transform" type="scale" values="1; 1.35; 1.15; 1.35; 1;" dur="1.2s" repeatCount="indefinite" transform-origin="50 50"/>
            </svg>
            <span class="font-heading font-extrabold text-white text-base">y código libre</span>
          </div>

          <p class="text-xs text-slate-400 leading-relaxed">
            Plataforma comunitaria dedicada a la divulgación técnica, formación práctica y documentación abierta del ecosistema GNU/Linux y software libre.
          </p>

          <!-- ANIMATED SVGS DE STACK TÉCNICO -->
          <div class="flex items-center gap-4 pt-4">
            <!-- VUE 3 LOGO -->
            <svg viewBox="0 0 256 221" class="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg" title="Vue 3">
              <path fill="#41B883" d="M204.8 0H256L128 220.8 0 0h97.92L128 51.2 158.08 0h46.72z"/>
              <path fill="#34495E" d="m0 0 128 220.8L256 0h-51.2L128 132.48 50.56 0H0z"/>
              <animateTransform attributeName="transform" type="translate" values="0 0; 0 -4; 0 0;" dur="2s" repeatCount="indefinite"/>
            </svg>

            <!-- NUXT ICON -->
            <Icon name="logos:nuxt-icon" class="h-5 w-5" title="Nuxt" />

            <!-- TAILWIND ICON -->
            <Icon name="logos:tailwindcss-icon" class="h-5 w-5" title="Tailwind CSS" />

            <!-- TYPESCRIPT ICON -->
            <Icon name="logos:typescript-icon" class="h-5 w-5" title="TypeScript" />
          </div>
        </div>

        <!-- COLUMNA 2: NAVEGACIÓN -->
        <div>
          <h4 class="font-heading text-xs font-bold uppercase tracking-wider text-white mb-3">
            Ecosistema
          </h4>
          <ul class="space-y-2 text-xs">
            <li>
              <NuxtLink to="/" class="hover:text-white transition-colors">Portada {{ platform.name }}</NuxtLink>
            </li>
            <li v-if="isGuides">
              <NuxtLink to="/guias" class="hover:text-white transition-colors">Catálogo de Guías</NuxtLink>
            </li>
            <li v-if="isGuides">
              <NuxtLink to="/herramientas" class="hover:text-white transition-colors">Herramientas Sysadmin</NuxtLink>
            </li>
            <li v-if="!isGuides">
              <NuxtLink to="/categoria/distribuciones" class="hover:text-white transition-colors">Distribuciones</NuxtLink>
            </li>
            <li v-if="!isGuides">
              <NuxtLink to="/categoria/seguridad" class="hover:text-white transition-colors">Ciberseguridad</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/feeds" class="hover:text-white transition-colors">Canales RSS / Atom</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/amigos" class="hover:text-white transition-colors">Enlaces Amigos</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- COLUMNA 3: LEGAL Y PRIVACIDAD -->
        <div>
          <h4 class="font-heading text-xs font-bold uppercase tracking-wider text-white mb-3">
            Legal & Privacidad
          </h4>
          <ul class="space-y-2 text-xs">
            <li>
              <NuxtLink to="/aviso-legal" class="hover:text-white transition-colors">Aviso Legal</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/privacidad" class="hover:text-white transition-colors">Política de Privacidad (RGPD)</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/cookies" class="hover:text-white transition-colors">Política de Cookies</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/sobre-nosotros" class="hover:text-white transition-colors">Sobre el Proyecto</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contacto" class="hover:text-white transition-colors">Contacto Oficial</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- COLUMNA 4: COMUNIDAD Y AUTOR -->
        <div>
          <h4 class="font-heading text-xs font-bold uppercase tracking-wider text-white mb-3">
            Comunidad & Autor
          </h4>
          <p class="text-xs text-slate-400 mb-3">
            Creado y mantenido por <strong class="text-slate-200">Raúl Caro Pastorino</strong> (<a href="https://raupulus.dev" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:underline">@raupulus</a>).
          </p>
          <div class="flex items-center gap-2 pt-1">
            <a href="https://github.com/raupulus" target="_blank" rel="noopener noreferrer" class="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800" title="GitHub">
              <Icon name="lucide:github" class="h-4 w-4" />
            </a>
            <a href="https://twitter.com/raupulus" target="_blank" rel="noopener noreferrer" class="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800" title="X (Twitter)">
              <Icon name="lucide:twitter" class="h-4 w-4" />
            </a>
            <a href="mailto:public@laguialinux.com" class="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800" title="Email de Contacto">
              <Icon name="lucide:mail" class="h-4 w-4" />
            </a>
          </div>
        </div>

      </div>

      <!-- BARRA INFERIOR CANÓNICA DE LICENCIAS -->
      <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>
          {{ platform.name }} &copy; 2001 - {{ currentYear }} &middot; Todos los derechos reservados.
        </p>
        <p class="font-mono text-[11px] text-slate-400">
          Código bajo <strong class="text-slate-300">GNU AGPLv3</strong> &middot; Contenidos bajo <strong class="text-slate-300">CC BY-SA 4.0</strong>
        </p>
      </div>

    </div>
  </footer>
</template>
