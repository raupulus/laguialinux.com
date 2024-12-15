<template>
  <div class="blog-card">
    <NuxtImg :src="image" :alt="title" class="blog-card-image" loading="lazy"/>

    <div class="blog-card-content">
      <div class="blog-card-meta" v-if="date">
        <time :datetime="date">{{ formattedDate }}</time>
      </div>

      <h2 class="blog-card-title">{{ title }}</h2>
      <p class="blog-card-excerpt">{{ excerpt }}</p>
      <NuxtLink :to="url" class="blog-card-button">Leer artículo</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: false
  },
  date: {
    type: String,
    required: false
  }
});

const formattedDate = computed(() => {
  if (!props.date) return '';
  const dateObj = new Date(props.date);
  return dateObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
});
</script>

<style scoped>
.blog-card {
  display: flex;
  flex-direction: column;
  background-color: var(--white);
  color: var(--darkblue);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.blog-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.blog-card-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.blog-card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.blog-card-meta {
  font-size: 0.875rem;
  color: var(--gray);
  font-weight: 500;
}

.blog-card-title {
  font-size: 1.5rem;
  margin: 0;
  font-weight: bold;
}

.blog-card-excerpt {
  font-size: 1rem;
  color: var(--darkblue);
  line-height: 1.5;
}

.blog-card-button {
  align-self: start;
  padding: 8px 16px;
  background-color: var(--primary);
  color: var(--white);
  text-decoration: none;
  font-weight: bold;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.blog-card-button:hover {
  background-color: var(--danger);
}

@media (max-width: 768px) {
  .blog-card {
    border-radius: 8px;
  }

  .blog-card-image {
    height: 200px;
  }

  .blog-card-title {
    font-size: 1.25rem;
  }

  .blog-card-excerpt {
    font-size: 0.875rem;
  }
}
</style>
