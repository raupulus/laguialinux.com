<template>
    <div>
        <h2 class="page-h2-title">
            Nuestro
            <span class="text-primary font-bold">
                Blog
            </span>
        </h2>

        <section>
            <GridProjects v-if="results.contents && !loadingContents" :projects="results.contents"/>
        </section>
    </div>
</template>

<script type="ts" setup>
//const { categories, subcategories, currentCategory, currentSubcategory, categoryActions } = useFetchCategories();
const { results, contentActions, loadingContents } = useFetchContent('blog');

</script>

<style scoped>

</style>
