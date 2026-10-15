<script setup lang="ts">
// Layout maestro unificado para La Guía Linux y Noticias
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[#080c14] text-slate-100">
    <!-- Cabecera Modular Adaptable -->
    <AppHeader />

    <!-- Área de Contenido Principal -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Modal de Búsqueda Global (Cmd+K / Ctrl+K) -->
    <SearchModal />

    <!-- Pie de Página Oficial con Licenciamiento Dual -->
    <AppFooter />
  </div>
</template>
