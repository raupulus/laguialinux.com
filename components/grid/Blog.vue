<template>
    <div class="grid-container">
        <CardBlog v-for="(card, index) in data" :key="index" :title="card.title" :image="card.image" :excerpt="card.excerpt"
            :url="card.url" :date="card.date" :categories="card.categories"/>
    </div>
</template>

<script setup lang="ts">

const props = defineProps({
    data: {
        type: Array as PropType<Array<{ title: string; excerpt: string; image: string; url?: string; date?: string; categories?: Array<String>; }>>,
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
