<template>
    <div>
        <section>
            <h2 class="font-bold text-center font-w-3">Actualidad</h2>
        </section>

        <!-- Filtros -->
        <section class="box-grid-filter">
            <div>
                <label for="category">Categorías</label>
                <select id="category" v-model="filters.category">
                    <option value="">Cualquiera</option>
                    <option value="cat-1">cat-1</option>
                    <option value="cat-2">cat-2</option>
                    <option value="cat-3">cat-3</option>
                </select>
            </div>

            <div>
                <label for="topic">Tema</label>
                <select id="topic" v-model="filters.topic">
                    <option value="">Cualquiera</option>
                    <option value="topic-1">topic-1</option>
                    <option value="topic-2">topic-2</option>
                    <option value="topic-3">topic-3</option>
                </select>
            </div>

            <div>
                <label for="sort">Ordenar</label>
                <select id="sort" v-model="filters.sort">
                    <option value="recent">Más Recientes</option>
                    <option value="popular">Más Leídas</option>
                </select>
            </div>
        </section>

        <!-- Noticias -->
        <section>
            <section class="box-grid-news">
                <CardBlogHorizontal
                    v-for="post in results.contents"
                    :key="post.slug"
                    :title="post.title"
                    :excerpt="post.excerpt"
                    :image="post.urlImageMedium"
                    :url="'#'"
                    :categories="post.categories"
                />
            </section>
        </section>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import useNews from '@/composables/useNews';
import {type ResponseContentType} from '@/types/ResponseContentType';

// Estático para pruebas
const { news, filters, loadMore } = useNews();

// Manejo del scroll infinito

const handleScroll = () => {

    console.log('results.value.pagination?.hasNextPage:', results.value.pagination?.hasNextPage);
    if (results.value.pagination?.hasNextPage) {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.body.scrollHeight;

        if (scrollTop + windowHeight >= documentHeight - 100) {
            useFetchContentNext()
        }
    }

};



const results = useFetchContent('new');


onMounted(() => {
    window.addEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.box-grid-news {
    display: grid;
    margin-top: 2.3rem;
    grid-template-columns: 1fr;
    gap: 1rem;
}

.box-grid-filter {
    display: grid;
    margin-top: 2.3rem;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
    text-align: center;
}

.box-grid-filter select {
    width: 100%;
    padding: 8px;
    font-size: 1rem;
    border-radius: 4px;
    border: 1px solid var(--gray);
}
</style>
