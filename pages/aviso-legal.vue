<!-- pages/aviso-legal.vue -->
<script setup lang="ts">
const { platform, isGuides } = usePlatform()

const title = computed(() => `Aviso Legal y Licenciamiento Dual · ${platform.value.name}`)
const description = 'Aviso legal, información societaria e identificativa, condiciones de uso, régimen de doble licencia GNU AGPLv3 / CC BY-SA 4.0 y exención de responsabilidad técnica.'

useHead({
  title: title.value,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title.value },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@raupulus' },
    { name: 'twitter:creator', content: '@raupulus' },
  ],
  link: [
    { rel: 'canonical', href: `https://${platform.value.domain}/aviso-legal` },
  ],
})

// Schema.org WebPage JSON-LD
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title.value,
        description,
        url: `https://${platform.value.domain}/aviso-legal`,
        publisher: {
          '@type': 'Organization',
          name: platform.value.name,
          url: `https://${platform.value.domain}/`,
        },
      }),
    },
  ],
})

const sections = [
  { id: 'titular', num: '01', title: 'Datos Identificativos del Titular' },
  { id: 'objeto', num: '02', title: 'Finalidad y Ámbito del Ecosistema' },
  { id: 'licencias', num: '03', title: 'Régimen Oficial de Doble Licencia Libre' },
  { id: 'responsabilidad', num: '04', title: 'Exención de Responsabilidad Técnica' },
  { id: 'marcas', num: '05', title: 'Propiedad Intelectual de Terceros' },
  { id: 'enlaces', num: '06', title: 'Hipervínculos y Amigos del Open Source' },
  { id: 'jurisdiccion', num: '07', title: 'Legislación y Fuero Jurisdiccional' },
]
</script>

<template>
  <div class="max-w-5xl mx-auto w-full px-4 lg:px-8 py-8 flex-1">
    <!-- CABECERA -->
    <header class="mb-10 space-y-3">
      <div
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border"
        :class="platform.themeAccent === 'orange'
          ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'"
      >
        <span>⚖️</span> Marco Jurídico y Régimen de Licencias
      </div>
      <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight font-heading">
        Aviso Legal y Condiciones de Uso
      </h1>
      <p class="text-slate-400 text-sm leading-relaxed max-w-3xl">
        Información legal obligatoria conforme a la Ley 34/2002 (LSSI-CE), condiciones de acceso y consulta, régimen oficial de doble licencia libre y exención de responsabilidad técnica para el ecosistema <strong class="text-slate-200">{{ platform.name }}</strong>.
      </p>
      <div class="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 pt-2 border-t border-slate-800/80">
        <span>Última revisión: Octubre 2026</span>
        <span>·</span>
        <span>Ámbito: <code :class="platform.themeAccent === 'orange' ? 'text-orange-400' : 'text-emerald-400'">{{ platform.domain }}</code></span>
      </div>
    </header>

    <!-- CUERPO DISTRIBUIDO -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- ÍNDICE LATERAL FLOTANTE DESKTOP -->
      <aside class="hidden lg:block lg:col-span-4">
        <div class="sticky top-24 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div class="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>📑</span> Secciones del Documento
          </div>
          <nav class="space-y-1.5 text-xs">
            <a
              v-for="item in sections"
              :key="item.id"
              :href="`#${item.id}`"
              class="block py-1.5 px-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {{ item.num }}. {{ item.title }}
            </a>
          </nav>
          <div class="pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            ¿Dudas legales o erratas? Escríbenos a <a href="mailto:public@laguialinux.com" class="text-emerald-400 hover:underline">public@laguialinux.com</a>
          </div>
        </div>
      </aside>

      <!-- CONTENIDO PRINCIPAL -->
      <main class="lg:col-span-8 space-y-10 text-slate-300 text-sm leading-relaxed">
        <!-- SECCIÓN 1: DATOS IDENTIFICATIVOS -->
        <section id="titular" class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <h2 class="text-xl sm:text-2xl font-bold text-white font-heading flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-sm font-bold border border-emerald-500/20">01</span>
            Datos Identificativos del Titular
          </h2>
          <p>
            En cumplimiento del artículo 10 de la <strong>Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE)</strong>, se ponen a disposición de los usuarios los datos identificativos del responsable de la plataforma:
          </p>
          <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2 font-mono text-xs">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/60 pb-2">
              <span class="text-slate-500">Titular y Creador:</span>
              <span class="text-white font-bold">Raúl Caro Pastorino (@raupulus)</span>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/60 pb-2">
              <span class="text-slate-500">Sitio Web Personal del Autor:</span>
              <a href="https://raupulus.dev" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:underline">https://raupulus.dev</a>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/60 pb-2">
              <span class="text-slate-500">Correo Electrónico de la Plataforma:</span>
              <code class="text-emerald-400">public@laguialinux.com</code>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/60 pb-2">
              <span class="text-slate-500">Correo Electrónico del Autor:</span>
              <code class="text-slate-300">public@raupulus.dev</code>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between">
              <span class="text-slate-500">Actividad:</span>
              <span class="text-slate-300">Divulgación técnica, documentación de software libre y periodismo tecnológico</span>
            </div>
          </div>
        </section>

        <!-- SECCIÓN 2: OBJETO Y ÁMBITO -->
        <section id="objeto" class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <h2 class="text-xl sm:text-2xl font-bold text-white font-heading flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-sm font-bold border border-emerald-500/20">02</span>
            Finalidad y Ámbito del Ecosistema
          </h2>
          <p>El ecosistema web comprende los siguientes portales y servicios vinculados:</p>
          <ul class="space-y-3 list-disc list-inside text-slate-300">
            <li>
              <strong class="text-emerald-400">laguialinux.com:</strong> Portal de guías, chuletas interactivas de terminal, tutoriales de administración de sistemas, almacenamiento, redes y seguridad en GNU/Linux.
            </li>
            <li>
              <strong class="text-orange-400">news.laguialinux.com:</strong> Portal informativo y de actualidad centrado en lanzamientos de distribuciones, kernel Linux, ciberseguridad (alertas CVE), hardware y novedades del mundo Open Source.
            </li>
          </ul>
          <p>
            El acceso y la navegación por cualquiera de estos sitios es completamente <strong>libre, gratuito y no requiere registro previo</strong> de usuario.
          </p>
        </section>

        <!-- SECCIÓN 3: LICENCIAMIENTO DUAL OFICIAL -->
        <section id="licencias" class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 sm:p-8 space-y-6 scroll-mt-24">
          <h2 class="text-xl sm:text-2xl font-bold text-white font-heading flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-sm font-bold border border-emerald-500/20">03</span>
            Régimen Oficial de Doble Licencia Libre
          </h2>
          <p>
            Fieles a los principios de la Free Software Foundation y la cultura abierta, todo el ecosistema se rige por un esquema de <strong>doble licencia estricta</strong>:
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Software y Plataforma</span>
                <span class="text-[11px] font-mono text-slate-500">Copyleft en Red</span>
              </div>
              <h3 class="text-base font-bold text-white">GNU AGPLv3</h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                Todo el código fuente de la plataforma, componentes y scripts se publican bajo la <strong>GNU Affero General Public License v3.0</strong>. Si ejecutas una versión modificada en un servidor o servicio accesible por red, estás obligado a proporcionar el código fuente completo a los usuarios remotos.
              </p>
            </div>
            <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-cyan-400 uppercase bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">Contenido Editorial</span>
                <span class="text-[11px] font-mono text-slate-500">Cultura Libre</span>
              </div>
              <h3 class="text-base font-bold text-white">CC BY-SA 4.0</h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                Los textos, tutoriales, chuletas y artículos técnicos se licencian bajo <strong>Creative Commons Atribución-CompartirIgual 4.0 Internacional</strong>. Puedes compartir y adaptar el contenido citando la autoría original de Raúl Caro Pastorino (<code class="text-slate-300">@raupulus</code>) y compartiendo con idéntica licencia libre.
              </p>
            </div>
          </div>
        </section>

        <!-- SECCIÓN 4: EXENCIÓN DE RESPONSABILIDAD TÉCNICA -->
        <section id="responsabilidad" class="bg-slate-900/60 border border-amber-500/30 rounded-2xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <h2 class="text-xl sm:text-2xl font-bold text-amber-400 font-heading flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono text-sm font-bold border border-amber-500/20">04</span>
            Exención de Responsabilidad Técnica (Comandos y Sysadmin)
          </h2>
          <div class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 leading-relaxed space-y-2">
            <p><strong>⚠️ ADVERTENCIA CRÍTICA PARA ADMINISTRADORES DE SISTEMAS Y USUARIOS DE TERMINAL:</strong></p>
            <p>
              La administración de sistemas GNU/Linux implica la ejecución de comandos con privilegios elevados (<code class="bg-slate-900 px-1 py-0.5 rounded text-amber-300">root</code> o <code class="bg-slate-900 px-1 py-0.5 rounded text-amber-300">sudo</code>), así como operaciones destructivas irreversibles (particionado de discos con <code class="text-amber-300">fdisk</code> / <code class="text-amber-300">dd</code>, formateo con <code class="text-amber-300">mkfs</code>, reglas de firewall con <code class="text-amber-300">iptables</code> / <code class="text-amber-300">nftables</code> y borrado recursivo).
            </p>
          </div>
          <p>
            Aunque todo el material técnico publicado en La Guía Linux es rigurosamente verificado y probado, <strong>se proporciona «tal cual» (AS IS), sin garantías de ningún tipo</strong>, expresas o implícitas.
          </p>
          <ul class="space-y-2 list-disc list-inside text-slate-300 text-xs">
            <li>El titular de la plataforma <strong>no asume ninguna responsabilidad</strong> por pérdida de datos, corrupción de sistemas de ficheros, interrupción de servicios o daños derivados de la aplicación de las guías.</li>
            <li>Es <strong>responsabilidad exclusiva del usuario</strong> verificar la sintaxis, comprender el impacto de cada comando y realizar copias de seguridad (<em class="text-white">backups</em>) antes de ejecutar órdenes en entornos productivos.</li>
          </ul>
        </section>

        <!-- SECCIÓN 5: MARCAS DE TERCEROS -->
        <section id="marcas" class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <h2 class="text-xl sm:text-2xl font-bold text-white font-heading flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-sm font-bold border border-emerald-500/20">05</span>
            Propiedad Intelectual de Terceros y Marcas Registradas
          </h2>
          <p>
            Todas las marcas registradas, logotipos y nombres comerciales citados en este sitio web pertenecen a sus legítimos propietarios y se mencionan con carácter meramente <strong>descriptivo, educativo e informativo</strong>:
          </p>
          <ul class="space-y-1.5 list-disc list-inside text-xs text-slate-400">
            <li><strong class="text-slate-200">Linux®</strong> es una marca registrada de Linus Torvalds en Estados Unidos y otros países.</li>
            <li><strong class="text-slate-200">Debian®</strong> es una marca registrada de Software in the Public Interest, Inc.</li>
            <li><strong class="text-slate-200">Ubuntu®</strong> y Canonical son marcas registradas de Canonical Ltd.</li>
            <li><strong class="text-slate-200">Red Hat®, Fedora®</strong> son marcas registradas de Red Hat, Inc. / IBM.</li>
            <li>Otras marcas y logotipos de software libre son propiedad de sus respectivas fundaciones o proyectos.</li>
          </ul>
        </section>

        <!-- SECCIÓN 6: ENLACES EXTERNOS -->
        <section id="enlaces" class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <h2 class="text-xl sm:text-2xl font-bold text-white font-heading flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-sm font-bold border border-emerald-500/20">06</span>
            Hipervínculos y Amigos del Open Source
          </h2>
          <p>
            El portal incluye enlaces hacia recursos externos (blogs, podcasts, canales de YouTube y comunidades en nuestro directorio <NuxtLink to="/amigos" class="text-emerald-400 underline font-medium">Enlaces Amigos</NuxtLink>).
          </p>
          <p class="text-xs text-slate-400">
            La Guía Linux no ejerce control editorial sobre sitios web de terceros ni asume responsabilidad alguna por sus contenidos, políticas o disponibilidad. El establecimiento de un enlace no implica patrocinio mercantil ni endoso mutuo.
          </p>
        </section>

        <!-- SECCIÓN 7: JURISDICCIÓN -->
        <section id="jurisdiccion" class="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 sm:p-8 space-y-4 scroll-mt-24">
          <h2 class="text-xl sm:text-2xl font-bold text-white font-heading flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-sm font-bold border border-emerald-500/20">07</span>
            Legislación y Fuero Jurisdiccional
          </h2>
          <p>
            Las relaciones entre el titular de La Guía Linux y los usuarios se regirán por la <strong>legislación española y la normativa comunitaria europea</strong> aplicable.
          </p>
          <p class="text-xs text-slate-400">
            Para cualquier litigio o controversia que pudiera suscitarse, las partes acuerdan someterse, con renuncia expresa a cualquier otro fuero, a los Juzgados y Tribunales de la provincia de Cádiz (España).
          </p>
        </section>
      </main>
    </div>
  </div>
</template>
