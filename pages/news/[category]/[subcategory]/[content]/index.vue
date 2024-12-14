<template>
    <div>
        <section>
            <h1>Categoría: {{ slugCategory }}</h1>
            <h1>SubCategoría: {{ slugSubCategory }}</h1>
            <h1>Content: {{ slugContent }}</h1>
            <p>example: <NuxtLink to="/news/cat-1/subcat-4/content-1999/page-1">page-1</NuxtLink></p>
        </section>
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const slugCategory = ref(route.params.category);
const slugSubCategory = ref(route.params.subcategory);
const slugContent = ref(route.params.content);
</script>

<style scoped>

</style>
