<template>
  <div class="banner">
    <div class="banner-image">
      <NuxtImg v-if="!image" src="/images/banners/placeholder.webp" :alt="title" loading="lazy"/>
      <NuxtImg v-if="image" :src="image" :alt="title" loading="lazy"/>
    </div>

    <div class="banner-content">
      <div class="badge">{{ badge }}</div>
      <h2 class="banner-title">{{ title }}</h2>
      <p class="banner-description">{{ description }}</p>

      <NuxtLink v-if="url" :to="url" class="banner-button">Ver más</NuxtLink>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    badge: {
      type: String,
      default: "Tendencia"
    },
    url: {
      type: String,
      required: false,
      default: null
    }
  }
};
</script>

<style scoped>
.banner {
  position: relative;
  display: flex;
  align-items: center;
  margin-top: 12px;
  padding: 16px;
  width: 100%;
  max-width: 100%;
  color: var(--black);
  border-radius: 8px;
  background-color: var(--yellow);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
}

.banner-image img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .banner-image img {
    width: 80px;
  }
}

.banner-content {
  margin-left: 16px;
  flex: 1;
  text-align: center;
}

.badge {
  position: absolute;
  top: -14px;
  right: 12px;
  background-color: var(--blue);
  color: var(--white);
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: bold;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.4);
  transform: rotate(5deg); /* Rota la etiqueta */
  transform-origin: center; /* Asegura que gire sobre su centro */
  z-index: 1;
}

.banner-title {
  font-size: 1.5rem;
  margin: 0;
}

.banner-description {
  font-size: 1rem;
  margin: 8px 0;
}

.banner-button {
  background-color: var(--primary);
  color: var(--white);
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-decoration: none;
}

.banner-button:hover {
  background-color: var(--warning);
}
</style>
