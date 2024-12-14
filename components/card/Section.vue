<template>
    <div class="card">
        <NuxtImg :src="image" :alt="title" class="card-image" />

        <div class="card-content">
            <h2 class="card-title">{{ title }}</h2>
            <p class="card-text">{{ text }}</p>
            <NuxtLink :to="url" class="card-button">Leer más</NuxtLink>
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
    text: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
});


</script>

<style scoped>
.card {
    background-color: var(--secondary);
    color: var(--white);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
    text-align: center;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.3);
}

.card-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.card-content {
    padding: 16px;
}

.card-title {
    font-size: 1.5rem;
    margin: 0 0 8px;
}

.card-text {
    font-size: 1rem;
    margin: 0 0 16px;
}

.card-button {
    display: inline-block;
    padding: 10px 20px;
    background-color: var(--primary);
    color: var(--white);
    text-decoration: none;
    font-weight: bold;
    border-radius: 4px;
    transition: background-color 0.3s ease;
}

.card-button:hover {
    background-color: var(--warning);
}
</style>
