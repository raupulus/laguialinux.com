<template>
    <div>
        <Loader :isLoading="loadingContents && !loadingCategories"></Loader>

        <section>
            <h2 class="page-h2-title">
                <span class="text-primary font-bold">Actual</span>idad
            </h2>
        </section>

        <!-- Filtro por Categorías y Subcategorías -->
        <FormFilterCategorySelect v-if="!loadingCategories" @clear-category="handleClearCategory"
            @clear-subcategory="handleClearSubcategory" @change-category="handleChangeCategory"
            @change-subcategory="handleChangeSubCategory" :categories="categories" :subcategories="subcategories"
            :loadingCategories="loadingCategories" />


        <!-- Noticias -->
        <section v-if="!loadingContents" class="box-grid-news">
            <CardBlogHorizontal v-for="post in results.contents" :key="post.slug" :content="post" platform="news" />
        </section>
    </div>
</template>

<script setup lang="ts">
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

const { categories, subcategories, currentCategory, currentSubcategory, categoryActions } = useFetchCategories();
const { results, contentActions, loadingContents } = useFetchContent('news');

/**
 * Procesa eliminar una categoría.
 */
function handleClearCategory() {
    categoryActions.setCurrentSubcategory('');
    categoryActions.setCurrentCategory('');

    contentActions.setFilterCategory('');
    contentActions.setFilterSubCategory('');
    handleChangeCategory()
}

/**
 * Procesa eliminar una subcategoría.
 */
function handleClearSubcategory() {
    contentActions.setFilterCategory('');
    contentActions.setFilterSubCategory('');
    handleChangeSubCategory()
}

/**
 * Procesa el cambio de categoría
 * @function handleChangeCategory
 */
function handleChangeCategory(category: string = '') {
    categoryActions.setCurrentSubcategory('');
    categoryActions.setCurrentCategory(category);

    contentActions.setFilterCategory(category);
    contentActions.setFilterSubCategory('');
    contentActions.fetchResults(1, true);
}

/**
 * Procesa el cambio de subcategoría
 * @function handleChangeSubCategory
 */
function handleChangeSubCategory(subcategory: string = '', parent: string = '') {
    categoryActions.setCurrentSubcategory(subcategory);
    contentActions.setFilterSubCategory(subcategory, parent ?? currentCategory.value?.slug);

    contentActions.fetchResults(1, true);
}

const loadingCategories = ref<boolean>(true);

onMounted(() => {
    window.addEventListener('scroll', handleScroll);

    if (categories.value) {
        loadingCategories.value = false;
    }
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
