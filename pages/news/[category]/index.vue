<template>
    <div>
        <Loader :isLoading="loading" />

        <section v-if="!loading">


            <h2 class="page-h2-title">
                <NuxtImg v-if="currentCategory" :src="currentCategory?.urlImageMicro || 'logo_128x128.webp'"
                    :alt="currentCategory?.name" style="border-radius: 8px; translate: 0 7px ;" />
                {{ currentCategory?.name }}
            </h2>

            <div class="grid-subcategories">
                <CardCategory v-for="subcategory in currentCategory?.subcategories" :parent="currentCategory"
                    platform="news"
                    :category="subcategory" />
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const slugCategory = ref<string>(route.params.category as string);
const { categories, subcategories, currentCategory, currentSubcategory, categoryActions } = useFetchCategory(slugCategory.value);

const loading = ref<boolean>(true);
let loadTimeout: NodeJS.Timeout;

/**
 * Función para gestionar el cambio de loading después de 300ms
 */
const setLoadingFalse = () => {
    loadTimeout = setTimeout(() => {
        loading.value = false;
    }, 300);
};

onMounted(() => {
    if (currentCategory.value) {
        setLoadingFalse();
    }
});

watch(currentCategory, (newValue) => {
    if (newValue) {
        setLoadingFalse();
    } else {
        loading.value = true;
        clearTimeout(loadTimeout);
    }
}, { immediate: true });

</script>

<style scoped>
.grid-subcategories {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}
</style>
