<template>
  <div class="box-advertisement">
    <div v-if="type === 'in-article'" style="width: 100%; height: 100px; background-color: red;">
      <p>Publicidad</p>
    </div>

    <div v-if="type === 'multiplex'" style="width: 100%; height: 100px; background-color: red;">
      <p>Publicidad</p>
    </div>

    <div v-if="type === 'in-feed'" style="width: 100%; height: 100px; background-color: red;">
      Publicidad
    </div>

    <div v-if="type === 'display'" style="width: 100%; height: 100px; background-color: red;">
      <p>Publicidad</p>
    </div>

  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  type: {
    type: String,
    default: 'in-article', // Permitido: in-article, multiplex, in-feed y display

  }
})
</script>

<style scoped>

</style>
