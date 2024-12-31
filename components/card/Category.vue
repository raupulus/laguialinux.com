<template>
  <div
    @click="goToCategory"
    class="category-card"
  >
    <div class="category-content">
      <NuxtImg
        :src="icon || 'logo_128x128.webp'"
        alt="Category Icon"
        class="category-icon"
      />
      <div class="category-text">
        <h3 class="category-title">{{ name }}</h3>
        <p class="category-description">{{ description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type CategoryType } from '@/types/CategoryType';

const props = defineProps({
  category: {
    type: Object as PropType<CategoryType> || undefined,
    required: false,
    default: () => undefined,
  },
  subcategory: {
    type: Object as PropType<CategoryType> || undefined,
    required: true
  },
  name: String,
  description: String,
  icon: String
})

const goToCategory = () => {
  window.location.href = `/news/${props.category?.slug}/${props.subcategory.slug}`
}
</script>

<style scoped>
.category-card {
  width: 95%;
  margin: auto;
  background-color: #2d3748;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 16px;
  transition: transform 0.3s ease, background-color 0.3s ease;
  box-sizing: border-box;
}

.category-card:hover {
  transform: scale(1.05);
  background-color: var(--danger);
}

.category-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.category-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 16px;
}

.category-text {
  color: white;
}

.category-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.category-description {
  font-size: 0.875rem;
  color: #E8E8E8;
}

/* Estilo para el hover en el texto */
.category-card:hover .category-title {
  color: white;
}

.category-card:hover .category-description {
  color: #D1D5DB; /* Color más claro para el texto al hacer hover */
}
</style>
