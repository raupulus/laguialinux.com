<template>
  <div v-if="isLoading" class="loader-container">
    <div class="loader"></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  isLoading: Boolean
});
</script>

<style scoped>
.loader-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 9999;
}

.loader {
  border: 8px solid rgba(255, 255, 255, 0.3); /* Color de borde de la rueda */
  border-top: 8px solid #fff; /* Color del borde superior (el que gira) */
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
