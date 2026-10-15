<script setup lang="ts">
const { isNews } = usePlatform()
</script>

<template>
  <footer class="bg-black border-t border-slate-800 text-slate-400 pt-12 pb-8 mt-auto">
    <div class="max-w-7xl mx-auto px-4 lg:px-8">
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
        
        <!-- COLUMNA 1: HECHO CON AMOR Y STACK ANIMADO -->
        <div class="flex flex-col">
          <div class="flex items-center gap-2 mb-3">
            <span class="font-heading font-black text-white text-lg leading-tight">Hecho con</span>
            <!-- CORAZÓN PULSANTE SVG ANIMADO -->
            <svg viewBox="0 0 100 100" class="w-6 h-6 inline-block shrink-0 anim-footer-heart" xmlns="http://www.w3.org/2000/svg">
              <path fill="tomato" d="M92.71,7.27L92.71,7.27c-9.71-9.69-25.46-9.69-35.18,0L50,14.79l-7.54-7.52C32.75-2.42,17-2.42,7.29,7.27v0 c-9.71,9.69-9.71,25.41,0,35.1L50,85l42.71-42.63C102.43,32.68,102.43,16.96,92.71,7.27z"/>
            </svg>
          </div>

          <!-- ANIMATED SVGS DE STACK TÉCNICO -->
          <div class="flex items-center gap-4 py-2">
            <!-- LARAVEL CUBE ANIMADO -->
            <svg viewBox="0 0 50 52" class="w-6 h-6 hover:scale-110 transition-transform anim-footer-laravel shrink-0" xmlns="http://www.w3.org/2000/svg" title="Laravel" aria-label="Laravel">
              <path d="M49.626 11.564a.809.809 0 0 1 .028.209v10.972a.8.8 0 0 1-.402.694l-9.209 5.302V39.25c0 .286-.152.55-.4.694L20.42 51.01c-.044.025-.092.041-.14.058-.018.006-.035.017-.054.022a.805.805 0 0 1-.41 0c-.022-.006-.042-.018-.063-.026-.044-.016-.09-.03-.132-.054L.402 39.944A.801.801 0 0 1 0 39.25V6.334c0-.072.01-.142.028-.21.006-.023.02-.044.028-.067.015-.042.029-.085.051-.124.015-.026.037-.047.055-.071.023-.032.044-.065.071-.093.023-.023.053-.04.079-.06.029-.024.055-.05.088-.069h.001l9.61-5.533a.802.802 0 0 1 .8 0l9.61 5.533h.002c.032.02.059.045.088.068.026.02.055.038.078.06.028.029.048.062.072.094.017.024.04.045.054.071.023.04.036.082.052.124.008.023.022.044.028.068a.809.809 0 0 1 .028.209v20.559l8.008-4.611v-10.51c0-.07.01-.141.028-.208.007-.024.02-.045.028-.068.016-.042.03-.085.052-.124.015-.026.037-.047.054-.071.024-.032.044-.065.072-.093.023-.023.052-.04.078-.06.03-.024.056-.05.088-.069h.001l9.611-5.533a.801.801 0 0 1 .8 0l9.61 5.533c.034.02.06.045.09.068.025.02.054.038.077.06.028.029.048.062.072.094.018.024.04.045.054.071.023.039.036.082.052.124.009.023.022.044.028.068zm-1.574 10.718v-9.124l-3.363 1.936-4.646 2.675v9.124l8.01-4.611zm-9.61 16.505v-9.13l-4.57 2.61-13.05 7.448v9.216l17.62-10.144zM1.602 7.719v31.068L19.22 48.93v-9.214l-9.204-5.209-.003-.002-.004-.002c-.031-.018-.057-.044-.086-.066-.025-.02-.054-.036-.076-.058l-.002-.003c-.026-.025-.044-.056-.066-.084-.02-.027-.044-.05-.06-.078l-.001-.003c-.018-.03-.029-.066-.042-.1-.013-.03-.03-.058-.038-.09v-.001c-.01-.038-.012-.078-.016-.117-.004-.03-.012-.06-.012-.09v-.002-21.481L4.965 9.654 1.602 7.72zm8.81-5.994L2.405 6.334l8.005 4.609 8.006-4.61-8.006-4.608zm4.164 28.764l4.645-2.674V7.719l-3.363 1.936-4.646 2.675v20.096l3.364-1.937zM39.243 7.164l-8.006 4.609 8.006 4.609 8.005-4.61-8.005-4.608zm-.801 10.605l-4.646-2.675-3.363-1.936v9.124l4.645 2.674 3.364 1.937v-9.124zM20.02 38.33l11.743-6.704 5.87-3.35-8-4.606-9.211 5.303-8.395 4.833 7.993 4.524z" fill="#FF2D20" fill-rule="evenodd"/>
            </svg>

            <!-- VUE.JS ANIMADO -->
            <svg viewBox="0 0 261.76 226.69" class="w-6 h-6 hover:scale-110 transition-transform anim-footer-vue shrink-0" xmlns="http://www.w3.org/2000/svg" title="Vue.js" aria-label="Vue.js">
              <path d="M161.096.001l-30.225 52.351L100.647.001H-.005l130.877 226.688L261.749.001z" fill="#41B883"/>
              <path d="M161.096.001l-30.225 52.351L100.647.001H52.346l78.526 136.01L209.398.001z" fill="#34495E"/>
            </svg>

            <!-- POSTGRESQL ANIMADO -->
            <svg viewBox="0 0 432.071 445.383" class="w-6 h-6 hover:scale-110 transition-transform anim-footer-postgres shrink-0" xmlns="http://www.w3.org/2000/svg" title="PostgreSQL" aria-label="PostgreSQL">
              <g style="fill-rule:nonzero;clip-rule:nonzero;fill:none;stroke:#FFFFFF;stroke-width:12.4651;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;">
                <path style="fill:#000000;stroke:#000000;stroke-width:37.3953;stroke-linecap:butt;stroke-linejoin:miter;" d="M323.205,324.227c2.833-23.601,1.984-27.062,19.563-23.239l4.463,0.392c13.517,0.615,31.199-2.174,41.587-7c22.362-10.376,35.622-27.7,13.572-23.148c-50.297,10.376-53.755-6.655-53.755-6.655c53.111-78.803,75.313-178.836,56.149-203.322 C352.514-5.534,262.036,26.049,260.522,26.869l-0.482,0.089c-9.938-2.062-21.06-3.294-33.554-3.496c-22.761-0.374-40.032,5.967-53.133,15.904c0,0-161.408-66.498-153.899,83.628c1.597,31.936,45.777,241.655,98.47,178.31 c19.259-23.163,37.871-42.748,37.871-42.748c9.242,6.14,20.307,9.272,31.912,8.147l0.897-0.765c-0.281,2.876-0.157,5.689,0.359,9.019c-13.572,15.167-9.584,17.83-36.723,23.416c-27.457,5.659-11.326,15.734-0.797,18.367c12.768,3.193,42.305,7.716,62.268-20.224 l-0.795,3.188c5.325,4.26,4.965,30.619,5.72,49.452c0.756,18.834,2.017,36.409,5.856,46.771c3.839,10.36,8.369,37.05,44.036,29.406c29.809-6.388,52.6-15.582,54.677-101.107"/>
                <path style="fill:#336791;stroke:none;" d="M402.395,271.23c-50.302,10.376-53.76-6.655-53.76-6.655c53.111-78.808,75.313-178.843,56.153-203.326c-52.27-66.785-142.752-35.2-144.262-34.38l-0.486,0.087c-9.938-2.063-21.06-3.292-33.56-3.496c-22.761-0.373-40.026,5.967-53.127,15.902 c0,0-161.411-66.495-153.904,83.63c1.597,31.938,45.776,241.657,98.471,178.312c19.26-23.163,37.869-42.748,37.869-42.748c9.243,6.14,20.308,9.272,31.908,8.147l0.901-0.765c-0.28,2.876-0.152,5.689,0.361,9.019c-13.575,15.167-9.586,17.83-36.723,23.416 c-27.459,5.659-11.328,15.734-0.796,18.367c12.768,3.193,42.307,7.716,62.266-20.224l-0.796,3.188c5.319,4.26,9.054,27.711,8.428,48.969c-0.626,21.259-1.044,35.854,3.147,47.254c4.191,11.4,8.368,37.05,44.042,29.406c29.809-6.388,45.256-22.942,47.405-50.555 c1.525-19.631,4.976-16.729,5.194-34.28l2.768-8.309c3.192-26.611,0.507-35.196,18.872-31.203l4.463,0.392c13.517,0.615,31.208-2.174,41.591-7c22.358-10.376,35.618-27.7,13.573-23.148z"/>
                <path d="M215.866,286.484c-1.385,49.516,0.348,99.377,5.193,111.495c4.848,12.118,15.223,35.688,50.9,28.045c29.806-6.39,40.651-18.756,45.357-46.051c3.466-20.082,10.148-75.854,11.005-87.281"/>
                <path d="M173.104,38.256c0,0-161.521-66.016-154.012,84.109c1.597,31.938,45.779,241.664,98.473,178.316c19.256-23.166,36.671-41.335,36.671-41.335"/>
                <path d="M260.349,26.207c-5.591,1.753,89.848-34.889,144.087,34.417c19.159,24.484-3.043,124.519-56.153,203.329"/>
                <path style="stroke-linejoin:bevel;" d="M348.282,263.953c0,0,3.461,17.036,53.764,6.653c22.04-4.552,8.776,12.774-13.577,23.155c-18.345,8.514-59.474,10.696-60.146-1.069c-1.729-30.355,21.647-21.133,19.96-28.739c-1.525-6.85-11.979-13.573-18.894-30.338 c-6.037-14.633-82.796-126.849,21.287-110.183c3.813-0.789-27.146-99.002-124.553-100.599c-97.385-1.597-94.19,119.762-94.19,119.762"/>
                <path d="M188.604,274.334c-13.577,15.166-9.584,17.829-36.723,23.417c-27.459,5.66-11.326,15.733-0.797,18.365c12.768,3.195,42.307,7.718,62.266-20.224l-0.796,3.188c5.319,4.26,9.054,27.711,8.428,48.969c-0.626,21.259-1.044,35.854,3.147,47.254c4.191,11.4,8.368,37.05,44.042,29.406c29.809-6.388,45.256-22.942,47.405-50.555 c1.525-19.631,4.976-16.729,5.194-34.28l2.768-8.309c3.192-26.611,0.507-35.196,18.872-31.203l4.463,0.392c13.517,0.615,31.208-2.174,41.591-7c22.358-10.376,35.618-27.7,13.573-23.148z"/>
                <path d="M187.715,274.069c-1.368-8.917,2.93-19.528,7.536-31.942c6.922-18.626,22.893-37.255,10.117-96.339c-9.523-44.029-73.396-9.163-73.436-3.193c-0.039,5.968,2.889,30.26-1.067,58.548c-5.162,36.913,23.488,68.132,56.479,64.938"/>
                <path style="fill:#FFFFFF;stroke-width:4.155;stroke-linecap:butt;stroke-linejoin:miter;" d="M172.517,141.7c-0.288,2.039,3.733,7.48,8.976,8.207c5.234,0.73,9.714-3.522,9.998-5.559c0.284-2.039-3.732-4.285-8.977-5.015c-5.237-0.731-9.719,0.333-9.996,2.367z"/>
                <path style="fill:#FFFFFF;stroke-width:2.0775;stroke-linecap:butt;stroke-linejoin:miter;" d="M331.941,137.543c0.284,2.039-3.732,7.48-8.976,8.207c-5.238,0.73-9.718-3.522-10.005-5.559c-0.277-2.039,3.74-4.285,8.979-5.015c5.239-0.73,9.718,0.333,10.002,2.368z"/>
                <path d="M350.676,123.432c0.863,15.994-3.445,26.888-3.988,43.914c-0.804,24.748,11.799,53.074-7.191,81.435"/>
                <path style="stroke-width:3;" d="M0,60.232"/>
              </g>
            </svg>
          </div>

          <p class="text-xs text-slate-300 mt-2 font-mono">
            Código libre y documentación técnica para sysadmins desde Chipiona para el mundo.
          </p>
        </div>

        <!-- COLUMNA 2: ENLACES DEL PROYECTO -->
        <div>
          <h4 class="font-heading font-bold text-white text-xs uppercase tracking-wider mb-3">Proyecto</h4>
          <ul class="space-y-2 text-xs">
            <li><NuxtLink to="/" class="hover:text-emerald-400 transition-colors">Portada de Guías</NuxtLink></li>
            <li><NuxtLink to="/guias" class="hover:text-emerald-400 transition-colors">Catálogo de Guías</NuxtLink></li>
            <li><NuxtLink to="/herramientas" class="hover:text-emerald-400 transition-colors">Suite de Herramientas</NuxtLink></li>
            <li><NuxtLink to="/blog" class="hover:text-emerald-400 transition-colors">Bitácora & Experiencias</NuxtLink></li>
            <li><a href="https://news.laguialinux.com" target="_blank" rel="noopener noreferrer" class="hover:text-amber-400 transition-colors">Portal de Noticias ↗</a></li>
          </ul>
        </div>

        <!-- COLUMNA 3: AUTOR Y REPOSITORIOS (OFICIALES) -->
        <div>
          <h4 class="font-heading font-bold text-white text-xs uppercase tracking-wider mb-3">Autor & Código</h4>
          <ul class="space-y-2 text-xs">
            <li><a href="https://raupulus.dev" target="_blank" rel="noopener noreferrer" class="hover:text-emerald-400 transition-colors">Web de Raúl Caro (@raupulus)</a></li>
            <li><a href="https://gitlab.com/raupulus" target="_blank" rel="noopener noreferrer" class="hover:text-emerald-400 transition-colors">Código en GitLab</a></li>
            <li><a href="https://github.com/raupulus" target="_blank" rel="noopener noreferrer" class="hover:text-emerald-400 transition-colors">Código en GitHub</a></li>
            <li><NuxtLink to="/contacto" class="hover:text-emerald-400 transition-colors">Contactar con la plataforma</NuxtLink></li>
            <li><a href="mailto:public@laguialinux.com" class="font-mono text-emerald-400/90 hover:underline">public@laguialinux.com</a></li>
          </ul>
        </div>

        <!-- COLUMNA 4: SÍGUENOS CON BOTÓN RESCATADO -->
        <div>
          <h4 class="font-heading font-bold text-white text-xs uppercase tracking-wider mb-3">Síguenos</h4>
          <p class="text-xs text-slate-300 mb-4 font-normal">
            Mantente al tanto de nuevas guías, chuletas y directos técnicos.
          </p>
          <a
            href="https://www.youtube.com/@raupulus"
            target="_blank"
            rel="noopener noreferrer" 
            class="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition-all"
          >
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            <span>Canales y Redes Sociales</span>
          </a>
        </div>

      </div>

      <!-- CRÉDITOS Y COPY -->
      <div class="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-4">
        <p>© 2001 - 2026 La Guía Linux · Raúl Caro Pastorino (@raupulus) · Código bajo GNU AGPLv3 · Contenidos bajo CC BY-SA 4.0</p>
        <div class="flex items-center gap-4">
          <NuxtLink to="/aviso-legal" class="hover:text-white transition-colors">Aviso Legal</NuxtLink>
          <span class="text-slate-500">·</span>
          <NuxtLink to="/privacidad" class="hover:text-white transition-colors">Privacidad</NuxtLink>
          <span class="text-slate-500">·</span>
          <NuxtLink to="/cookies" class="hover:text-white transition-colors">Cookies</NuxtLink>
          <span class="text-slate-500">·</span>
          <NuxtLink to="/feeds" class="hover:text-amber-400 transition-colors font-mono">RSS Feeds</NuxtLink>
        </div>
      </div>

    </div>
  </footer>
</template>
