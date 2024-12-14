<template>
    <div>
        <section>
            <h1>Categoría: {{ slugCategory }}</h1>
            <h1>SubCategoría: {{ slugSubCategory }}</h1>
            <p>example: <NuxtLink to="/news/cat-1/subcat-4/content-1999">content-1999</NuxtLink></p>
        </section>
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const slugCategory = ref(route.params.category);
const slugSubCategory = ref(route.params.subcategory);
</script>

<style scoped>

</style>
