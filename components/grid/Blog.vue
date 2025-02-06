<template>
    <div class="grid-container">
        <CardBlog v-for="(card, index) in data" :key="index" :title="card.title" :image="card.has_image ? card.urlImageMedium : '/images/banners/placeholder.webp'" :excerpt="card.excerpt"
        :url="card.url" :date="card.updated_at" :categories="card.categories" :section="section"/>
    </div>
</template>

<script setup lang="ts">
import type { ContentType } from '~/types/ContentType';

const props = defineProps({
    data: {
        type: Array as PropType<ContentType[]>,
    },
    section: {
        type: String,
        required: true,
    }
});

</script>

<style scoped>
.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    padding: 20px;
}

@media (max-width: 768px) {
    .grid-container {
        grid-template-columns: repeat(1, 1fr);
    }
}
</style>
