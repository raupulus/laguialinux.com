<script setup lang="ts">
/**
 * pages/[...slug].vue
 * Interceptor de rutas inexistentes para delegar en el gestor 404 error.vue
 * La Guía Linux
 * Licencia: GNU AGPLv3
 */

const route = useRoute()

throw createError({
  statusCode: 404,
  statusMessage: `La ruta "${route.path}" no existe en el sistema.`,
  fatal: true,
})
</script>

<template>
  <div></div>
</template>
