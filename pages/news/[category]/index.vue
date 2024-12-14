<template>
    <div>
        <section>
            <h1>Categoría: {{ slugCategory }}</h1>
            <p>example: <NuxtLink to="/news/cat-1/subcat-4">subcat-4</NuxtLink></p>
        </section>
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const slugCategory = ref(route.params.category);
</script>

<style scoped>

</style>
