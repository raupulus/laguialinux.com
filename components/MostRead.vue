<template>
  <div class="most-read-container">
    <h3 class="most-read-title">Lo más leído</h3>

    <div v-if="loadingContentFeatured" class="most-read-loading">
      <div class="loading-spinner"></div>
      <p>Cargando contenido...</p>
    </div>

    <div v-else-if="error" class="most-read-error">
      <p>{{ error }}</p>
    </div>

    <div v-else class="most-read-list">
      <div 
        v-for="(item, index) in mixedTrendContent" 
        :key="index" 
        class="most-read-item"
      >
        <NuxtLink :to="`/${item.path}`" class="most-read-link">
          <div class="most-read-image">
            <NuxtImg 
              :src="item.urlImageMedium" 
              :alt="item.title" 
              width="80" 
              height="60" 
              loading="lazy"
            />
          </div>
          <div class="most-read-content">
            <h4 class="most-read-item-title">{{ item.title }}</h4>
            <span class="most-read-date">{{ item.created_at_human }}</span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { ContentType } from '@/types/ContentType';

// Get contentFeatured from the composable
const { contentFeatured, loadingContentFeatured } = useFetchContentFeatured();

// Error state
const error = ref<string | null>(null);

// Mix the 3 arrays of content from contentFeatured?.trend
const mixedTrendContent = computed<ContentType[]>(() => {
  if (!contentFeatured.value?.trend) {
    return [];
  }

  // Combine blog, news, and guides content
  const allContent = [
    ...(contentFeatured.value.trend.blog || []),
    ...(contentFeatured.value.trend.news || []),
    ...(contentFeatured.value.trend.guides || [])
  ];

  // Limit to 4 items and return
  return allContent.slice(0, 4);
});
</script>

<style scoped>
.most-read-container {
  background-color: #2d3748;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.most-read-title {
  margin: 0;
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  background-color: var(--primary);
  text-align: center;
}

.most-read-list {
  padding: 0.5rem;
}

.most-read-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.most-read-item:last-child {
  border-bottom: none;
}

.most-read-link {
  display: flex;
  padding: 0.75rem;
  text-decoration: none;
  color: white;
  transition: background-color 0.2s ease;
}

.most-read-link:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.most-read-image {
  width: 80px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.most-read-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.most-read-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.most-read-item-title {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.most-read-date {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.most-read-loading, 
.most-read-error {
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
