<template>
    <div>
        <section>
            <h2 class="font-bold text-center font-w-3">Actualidad</h2>
        </section>

        <!-- Filtros -->
        <section class="box-grid-filter">
            <div>
                <label for="category">Categorías</label>
                <select id="category" v-model="categorySlug" @change="handleChangeCategory">
                    <option value="" :selected="categorySlug === ''">Cualquiera</option>

                    <option v-for="category in categories" :id="category.slug"
                        :selected="category.slug === categorySlug"
                        :value="category.slug">
                        {{category.name}}
                    </option>
                </select>
            </div>

            <div>
                <label for="topic">Tema</label>
                <select id="topic" v-model="subcategorySlug" @change="handleChangeSubCategory">
                    <option value="" :selected="subcategorySlug === ''">Cualquiera</option>
                    <option v-for="subcategory in subcategories" :id="subcategory.slug"
                        :selected="subcategory.slug === subcategorySlug"
                        :value="subcategory.slug">
                        {{subcategory.name}}
                    </option>
                </select>
            </div>

            <div>
                <label for="sort">Ordenar</label>
                <select id="sort">
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
                    path="news"
                    :categories="post.categories"
                />
            </section>
        </section>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';


// Manejo del scroll infinito
const handleScroll = () => {
    if (results.value.pagination?.hasNextPage) {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.body.scrollHeight;

        if (scrollTop + windowHeight >= documentHeight - 100) {
            useFetchContentNext()
        }
    }

};

let categorySlug = ref('');
let subcategorySlug = ref('');


const {categories, subcategories, currentCategory, currentSubcategory, categoryActions} = useFetchCategories();
const {results, contentActions} = useFetchContent('new');



function handleChangeCategory() {
    categoryActions.setCurrentSubcategory('');
    categoryActions.setCurrentCategory(categorySlug.value);
    subcategorySlug.value = '';

    contentActions.setFilterCategory(categorySlug.value);
    contentActions.setFilterSubCategory('');
    contentActions.fetchResults(1, true);
}


function handleChangeSubCategory() {
    categoryActions.setCurrentSubcategory(subcategorySlug.value);

    if (subcategorySlug.value !== '') {
        categorySlug.value = currentCategory.value?.slug ?? '';
    } else {
        contentActions.setFilterCategory(categorySlug.value);
    }

    contentActions.setFilterSubCategory(subcategorySlug.value);
    contentActions.fetchResults(1, true);
}


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
