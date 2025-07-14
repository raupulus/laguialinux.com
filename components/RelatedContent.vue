<template>
  <div class="related-content-container">
    <h3 class="related-content-title">Contenido relacionado</h3>

    <div v-if="loading" class="related-content-loading">
      <div class="loading-spinner"></div>
      <p>Cargando contenido...</p>
    </div>

    <div v-else-if="error" class="related-content-error">
      <p>{{ error }}</p>
    </div>

    <div v-else class="related-content-list">
      <div 
        v-for="(item, index) in relatedContent" 
        :key="index" 
        class="related-content-item"
      >
        <NuxtLink :to="`/${item.path}`" class="related-content-link">
          <div class="related-content-image">
            <NuxtImg 
              :src="item.urlImageMedium" 
              :alt="item.title" 
              width="80" 
              height="60" 
              loading="lazy"
            />
          </div>
          <div class="related-content-info">
            <h4 class="related-content-item-title">{{ item.title }}</h4>
            <span class="related-content-date">{{ item.created_at_human }}</span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useFetchContentRelated } from '~/composables/useFetchContentRelated';

// Obtenemos la función useRelatedContent del composable
const { useRelatedContent } = useFetchContentRelated();

const props = defineProps({
  contentSlug: {
    type: String,
    default: ''
  },
  contentType: {
    type: String,
    default: 'all'
  },
  limit: {
    type: Number,
    default: 4
  }
});

const { relatedContent, loading, error } = useRelatedContent(
  props.contentSlug, 
  props.contentType, 
  props.limit
);
</script>

<style scoped>
.related-content-container {
  background-color: #2d3748;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.related-content-title {
  margin: 0;
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  background-color: var(--warning);
  text-align: center;
}

.related-content-list {
  padding: 0.5rem;
}

.related-content-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.related-content-item:last-child {
  border-bottom: none;
}

.related-content-link {
  display: flex;
  padding: 0.75rem;
  text-decoration: none;
  color: white;
  transition: background-color 0.2s ease;
}

.related-content-link:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.related-content-image {
  width: 80px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.related-content-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-content-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.related-content-item-title {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-content-date {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.related-content-loading, 
.related-content-error {
  padding: 2rem;
  text-align: center;
  color: white;
}

.loading-spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
