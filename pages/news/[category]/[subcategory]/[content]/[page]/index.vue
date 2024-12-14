<template>
    <div>
        <section>
            <h1>Categoría: {{ slugCategory }}</h1>
            <h1>SubCategoría: {{ slugSubCategory }}</h1>
            <h1>Content: {{ slugContent }}</h1>
            <h1>Page: {{ slugPage }}</h1>
            <p>Has llegado a la página final :D</p>
        </section>
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const slugCategory = ref(route.params.category);
const slugSubCategory = ref(route.params.subcategory);
const slugContent = ref(route.params.content);
const slugPage = ref(route.params.page);
</script>

<style scoped>

</style>
