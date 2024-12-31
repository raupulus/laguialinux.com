<template>
    <div>
        <section>
            <h1>Categoría: {{ currentCategory?.name }}</h1>
        </section>

        <section>
            <h2>Subcategorías</h2>
            <ul>
                <li v-for="subcategory in currentCategory?.subcategories">
                    <NuxtLink :to="`/news/${currentCategory?.slug}/${subcategory.slug}`">
                    {{subcategory.name}}
                    </NuxtLink>
                </li>
            </ul>
        </section>
    </div>
</template>

<script setup lang="ts">

const route = useRoute();
const slugCategory = ref<string>(route.params.category as string);

const {categories, subcategories, currentCategory, currentSubcategory, categoryActions} = useFetchCategory(slugCategory.value);
</script>

<style scoped>

</style>
