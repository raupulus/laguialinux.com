<template>
    <div>
        <section v-if="loading" style="background-color: red;">
            Cargando contenido!!!
        </section>

        <section v-if="!loading">
            <h2 class="page-h2-title">{{ currentCategory?.name }}</h2>

            <div class="grid-subcategories">
                <CardCategory v-for="subcategory in currentCategory?.subcategories" :category="currentCategory"
                    :subcategory="subcategory" :name="subcategory.name" :description="subcategory.description"
                    :icon="subcategory?.icon" />
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">

const route = useRoute();
const slugCategory = ref<string>(route.params.category as string);

const loading = ref<boolean>(true);

const { categories, subcategories, currentCategory, currentSubcategory, categoryActions } = useFetchCategory(slugCategory.value);


let loadTimeout: NodeJS.Timeout;

// Función para gestionar el cambio de loading después de 300ms
const setLoadingFalse = () => {
    loadTimeout = setTimeout(() => {
        loading.value = false;
    }, 500);
};

// Comienza el proceso al montar el componente o cuando currentCategory tiene valor
onMounted(() => {
    if (currentCategory.value) {
        // Si currentCategory ya tiene valor desde el principio, empieza el conteo de 300ms
        setLoadingFalse();
    }
});

watch(currentCategory, (newValue) => {
    if (newValue) {
        // Si currentCategory tiene valor, y no está en loading, se empieza a contar
        setLoadingFalse();
    } else {
        // Si currentCategory se vacía, vuelve a poner loading en true
        loading.value = true;
        clearTimeout(loadTimeout); // Detener cualquier temporizador pendiente
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
