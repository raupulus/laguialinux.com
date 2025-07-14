<template>
  <div class="related-slider-container">
    <h3 class="related-slider-title">Contenido relacionado</h3>

    <div v-if="loading" class="related-slider-loading">
      <div class="loading-spinner"></div>
      <p>Cargando contenido...</p>
    </div>

    <div v-else-if="error" class="related-slider-error">
      <p>{{ error }}</p>
    </div>

    <div v-else class="related-slider">
      <ClientOnly>
        <div class="slider-navigation">
          <button class="nav-button prev-button" @click="prevSlide" :disabled="currentIndex === 0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path fill="none" d="M0 0h24v24H0z"/>
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/>
            </svg>
            <span>Anterior</span>
          </button>

          <div class="slider-pagination">
            {{ currentIndex + 1 }} / {{ sliderContent.length }}
          </div>

          <button class="nav-button next-button" @click="nextSlide" :disabled="currentIndex === sliderContent.length - 1">
            <span>Siguiente</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path fill="none" d="M0 0h24v24H0z"/>
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <div class="slider-content">
          <transition name="slide">
            <div v-if="currentContent" class="slider-item">
              <div class="slider-item-image">
                <NuxtImg 
                  :src="currentContent.urlImage" 
                  :alt="currentContent.title" 
                  width="400" 
                  height="250" 
                  loading="lazy"
                />
              </div>
              <div class="slider-item-info">
                <h4 class="slider-item-title">{{ currentContent.title }}</h4>
                <p class="slider-item-excerpt">{{ currentContent.excerpt }}</p>
                <div class="slider-item-meta">
                  <span class="slider-item-date">{{ currentContent.created_at_human }}</span>
                </div>
                <NuxtLink :to="`/${currentContent.path}`" class="slider-item-button">
                  Leer más
                </NuxtLink>
              </div>
            </div>
          </transition>
        </div>
      </ClientOnly>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { useFetchContentRelated } from '~/composables/useFetchContentRelated';

// Obtenemos la función useRelatedContentSlider del composable
const { useRelatedContentSlider } = useFetchContentRelated();

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

const { sliderContent, loading, error } = useRelatedContentSlider(
  props.contentSlug, 
  props.contentType, 
  props.limit
);

const currentIndex = ref(0);

// Obtener el contenido actual basado en el índice
const currentContent = computed(() => {
  if (sliderContent.value && sliderContent.value.length > 0) {
    return sliderContent.value[currentIndex.value];
  }
  return null;
});

// Funciones para navegar por el slider
const nextSlide = () => {
  if (currentIndex.value < sliderContent.value.length - 1) {
    currentIndex.value++;
  }
};

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

// Reiniciar el índice cuando cambia el contenido
watch(sliderContent, () => {
  currentIndex.value = 0;
});
</script>

<style scoped>
.related-slider-container {
  background-color: #2d3748;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.related-slider-title {
  margin: 0;
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  background-color: var(--primary);
  text-align: center;
}

.related-slider {
  padding: 1rem;
}

.slider-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.nav-button {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.nav-button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.prev-button svg {
  margin-right: 0.5rem;
}

.next-button svg {
  margin-left: 0.5rem;
}

.slider-pagination {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.slider-content {
  position: relative;
  min-height: 300px;
}

.slider-item {
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

.slider-item-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.slider-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slider-item-info {
  padding: 1rem;
  color: white;
}

.slider-item-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.slider-item-excerpt {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.8);
}

.slider-item-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.slider-item-button {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: var(--primary);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.slider-item-button:hover {
  background-color: #0056b3;
}

.related-slider-loading, 
.related-slider-error {
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

/* Transition animations */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

@media (min-width: 768px) {
  .slider-item {
    flex-direction: row;
  }

  .slider-item-image {
    width: 40%;
    height: auto;
  }

  .slider-item-info {
    width: 60%;
  }
}
</style>
