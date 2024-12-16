<template>
  <div class="blog-card">
    <h2 class="blog-card-title">{{ title }}</h2>
    <NuxtImg :src="image" :alt="title" class="blog-card-image" loading="lazy" />

    <div class="blog-card-badges" v-if="categories && categories.length">
      <span v-for="category in categories" :key="String(category)" class="blog-card-badge">{{ category }}</span>
    </div>

    <div class="blog-card-content">
      <div class="blog-card-meta" v-if="date">
        <time :datetime="date">{{ formattedDate }}</time>
      </div>
      <p class="blog-card-excerpt">{{ excerpt }}</p>

      <div class="blog-card-footer">
        <span class="blog-card-comments">
          <svg class="icon-comments" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7l-4 4v-4H5a2 2 0 0 1-2-2V5z"/>
          </svg>
          {{ comments || 0 }}
        </span>
        <NuxtLink :to="url" class="blog-card-button">Leer artículo</NuxtLink>
      </div>
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
  },
  categories: {
    type: Array,
    required: false,
    default: () => []
  },
  comments: {
    type: Number,
    required: false,
    default: 0
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
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 1fr;
  background-color: var(--white);
  color: var(--darkblue);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
  min-height: 300px;
}

.blog-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.blog-card-title {
  font-size: 1.5rem;
  font-weight: bold;
  padding: 16px;
  margin: 0;
  background-color: var(--white);
  color: var(--blue);
}

.blog-card-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.blog-card-badges {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row-reverse;
  gap: 8px;
  margin: 8px 16px 0;
}

.blog-card-badge {
  background-color: var(--blue);
  color: var(--white);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
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

.blog-card-excerpt {
  font-size: 1rem;
  color: var(--darkblue);
  line-height: 1.5;
}

.blog-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.blog-card-comments {
  font-size: 0.875rem;
  color: var(--darkblue);
  display: flex;
  align-items: center;
  gap: 4px;
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
    font-size: 1rem;
  }

  .blog-card-excerpt {
    font-size: 0.875rem;
  }
}
</style>
