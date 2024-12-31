<template>
    <div>
        <Loader :isLoading="loadingContents"></Loader>

        <section>
            <h2 class="page-h2-title">{{ slugSubCategory }}</h2>
        </section>

        <!-- Noticias -->
        <section v-if="!loadingContents">
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
const route = useRoute();
const slugCategory = ref(route.params.category as string);
const slugSubCategory = ref(route.params.subcategory as string);

/**
 * Procesa la acción de scroll infinito
 * @function handleScroll
 */
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

//const {categories, subcategories, currentCategory, currentSubcategory, categoryActions} = useFetchCategories();
const {results, contentActions, loadingContents} = useFetchContent('new', slugCategory.value, slugSubCategory.value);

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

</style>
