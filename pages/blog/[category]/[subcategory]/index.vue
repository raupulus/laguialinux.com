<template>
    <div>
        <BreadCrumb :breadcrumbs="breadcrumbs"/>

        <Loader :isLoading="loadingContents"></Loader>

        <section>
            <h2 class="page-h2-title">
                <NuxtImg v-if="currentSubcategory" :src="currentSubcategory?.urlImageMicro || 'logo_128x128.webp'" :alt="currentSubcategory?.name" style="border-radius: 8px; translate: 0 7px ;"/>
                {{ currentSubcategory?.name }}
            </h2>
        </section>

        <!-- Noticias -->
        <section v-if="!loadingContents">
            <section class="box-grid-news">
                <CardBlogHorizontal
                    v-for="post in results.contents"
                    :content="post"
                    :key="post.slug"
                    platform="blog"
                />
            </section>
        </section>
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const slugCategory = ref(route.params.category as string);
const slugSubCategory = ref(route.params.subcategory as string);

const { categories, subcategories, currentCategory, currentSubcategory, categoryActions } = useFetchCategory(slugCategory.value, slugSubCategory.value);

const breadcrumbs = ref([
    { name: 'Blog', slug: 'blog' },
    { name: currentCategory.value?.name, slug: currentCategory.value?.slug },
    { name: currentSubcategory.value?.name, slug: currentSubcategory.value?.slug },
]);


watch(currentCategory, (newVal) => {
    breadcrumbs.value[1] = { name: newVal?.name, slug: newVal?.slug };
});

watch(currentSubcategory, (newVal) => {
    breadcrumbs.value[2] = { name: newVal?.name, slug: newVal?.slug };
});

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
const {results, contentActions, loadingContents} = useFetchContent('blog', slugCategory.value, slugSubCategory.value);

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
