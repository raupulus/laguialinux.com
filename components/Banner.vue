<template>
    <div class="banner">
        <div class="banner-image">
            <NuxtImg v-if="!image" src="/images/banners/placeholder.webp" :alt="title" loading="lazy" />
            <NuxtImg v-if="image" :src="image" :alt="title" loading="lazy" />
        </div>

        <div class="banner-content">
            <div class="badge">{{ badge }}</div>
            <h2 class="banner-title">{{ title }}</h2>
            <p class="banner-description">{{ description }}</p>

            <NuxtLink v-if="url" :to="url" class="banner-button" :title="title">Ver más</NuxtLink>
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
    color: var(--white);
    border-radius: 8px;
    background-color: var(--primary);
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
    text-align: left;
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
    transform: rotate(5deg); /* Roto la etiqueta */
    transform-origin: center; /* Aseguro giro sobre su centro */
    z-index: 1;
}

.banner-title {
    font-size: 1.6rem;
    font-weight: bold;
    margin: 0;
}

.banner-description {
    font-size: 1.1rem;
    margin: 8px 0;
    padding-bottom: 0.6rem;
}

.banner-button {
    color: var(--secondary);
    padding: 10px 20px;
    font-size: 1rem;
    font-weight: bold;
    text-decoration: none;
    background-color: var(--yellow);
    transition: background-color 0.3s ease;
    cursor: pointer;
    border: none;
    border-radius: 4px;
}

.banner-button:hover {
    background-color: var(--yellow);
}
</style>
