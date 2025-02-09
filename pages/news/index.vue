<template>
    <div>
        <Loader :isLoading="loadingCategories"></Loader>
        <Loader :isLoading="loadingContents && !loadingCategories"></Loader>

        <section>
            <h2 class="page-h2-title">
                <span class="text-primary font-bold">Actual</span>idad
            </h2>
        </section>

        <!-- Filtros -->
        <section class="box-grid-filter" v-if="!loadingCategories">
            <div>
                <div class="grid-select-group">
                    <!-- Agregar la "X" para limpiar -->
                    <span v-if="selectCategory" @click="selectCategory = undefined; handleChangeCategory()"
                        class="clear-button">
                        ✖
                    </span>
                    <span v-else></span>

                    <multiselect v-model="selectCategory" :options="categories" :allow-empty="true"
                        @update:model-value="handleChangeCategory" label="name" track-by="slug" :preserveSearch="true"
                        :clearOnSelect="true" :clearable="true" selectLabel="Pulsa Intro para seleccionar"
                        selectedLabel="Seleccionado" deselectLabel="Pulsa Intro para quitar"
                        placeholder="Filtrar por una categoría">

                        <!-- Single selected label (cuando se selecciona una categoría) -->
                        <template #singleLabel="props">
                            <div class="option__container">
                                <NuxtImg :src="props.option.urlImageMicro || 'logo_128x128.webp'"
                                    :alt="props.option.name" class="option__image" />
                                <span class="option__name">{{ props.option.name }}</span>

                            </div>
                        </template>

                        <!-- Option when selecting (when dropdown is expanded) -->
                        <template #option="props">
                            <div class="option__container">
                                <NuxtImg :src="props.option.urlImageMicro || 'logo_128x128.webp'"
                                    :alt="props.option.name" class="option__image" />
                                <div class="option__desc">
                                    <span class="option__title">{{ props.option.name }}</span>
                                    <span class="option__small">{{ props.option.description }}</span>
                                </div>
                            </div>
                        </template>
                    </multiselect>
                </div>
            </div>

            <div>
                <div class="grid-select-group">
                    <!-- Agregar la "X" para limpiar -->
                    <span v-if="selectSubcategory" @click="selectSubcategory = undefined; handleChangeSubCategory()"
                        class="clear-button">
                        ✖
                    </span>

                    <span v-else></span>

                    <multiselect v-model="selectSubcategory" :options="subcategories" :allow-empty="true"
                        @update:model-value="handleChangeSubCategory" label="name" track-by="slug"
                        :preserveSearch="true" :clearOnSelect="true" selectLabel="Pulsa Intro para seleccionar"
                        selectedLabel="Seleccionado" deselectLabel="Pulsa Intro para quitar"
                        placeholder="Filtrar por un tema">
                        <!-- Single selected label (cuando se selecciona un tema) -->
                        <template #singleLabel="props">
                            <div class="option__container">
                                <NuxtImg :src="props.option.urlImageMicro || 'logo_128x128.webp'"
                                    :alt="props.option.name" class="option__image" />
                                <span class="option__name">{{ props.option.name }}</span>
                            </div>
                        </template>

                        <!-- Option when selecting (when dropdown is expanded) -->
                        <template #option="props">
                            <div class="option__container">
                                <NuxtImg :src="props.option.urlImageMicro || 'logo_128x128.webp'"
                                    :alt="props.option.name" class="option__image" />
                                <div class="option__desc">
                                    <span class="option__title">{{ props.option.name }}</span>
                                    <span class="option__small">{{ props.option.description }}</span>
                                </div>
                            </div>
                        </template>


                        <!-- No hay resultados -->
                        <template #noOptions>
                            <span>No hay Temas</span>
                        </template>
                    </multiselect>
                </div>
            </div>

            <!--
            <div>
                <label for="sort">Ordenar</label>
                <select id="sort">
                    <option value="recent">Más Recientes</option>
                    <option value="popular">Más Leídas</option>
                </select>
            </div>
            -->
        </section>

        <!-- Noticias -->
        <section v-if="!loadingContents">
            <section class="box-grid-news">
                <CardBlogHorizontal v-for="post in results.contents" :key="post.slug" :content="post" platform="news"/>
            </section>
        </section>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import { type CategoryType } from '@/types/CategoryType';

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

let selectCategory = ref<CategoryType>();
let selectSubcategory = ref<CategoryType>();

const { categories, subcategories, currentCategory, currentSubcategory, categoryActions } = useFetchCategories();
const { results, contentActions, loadingContents } = useFetchContent('news');

/**
 * Procesa el cambio de categoría
 * @function handleChangeCategory
 */
function handleChangeCategory() {
    categoryActions.setCurrentSubcategory('');
    categoryActions.setCurrentCategory(selectCategory.value?.slug ?? '');
    selectSubcategory.value = undefined;

    contentActions.setFilterCategory(selectCategory.value?.slug ?? '');
    contentActions.setFilterSubCategory('');
    contentActions.fetchResults(1, true);
}

/**
 * Procesa el cambio de subcategoría
 * @function handleChangeSubCategory
 */
function handleChangeSubCategory() {
    categoryActions.setCurrentSubcategory(selectSubcategory.value?.slug ?? '');

    if (selectSubcategory.value?.slug !== '') {
        selectCategory.value = currentCategory.value;
    }

    contentActions.setFilterCategory(selectCategory.value?.slug ?? '');

    contentActions.setFilterSubCategory(selectSubcategory.value?.slug ?? '');
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

.box-grid-filter {
    display: grid;
    margin-top: 2.3rem;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    text-align: center;
}

.box-grid-filter select {
    width: 100%;
    padding: 8px;
    font-size: 1rem;
    border-radius: 4px;
    border: 1px solid var(--gray);
}

.option__container {
    display: flex;
    align-items: center;
    padding: 8px;
}

.option__image {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    object-fit: cover;
    margin-right: 12px;
}

.option__name {
    font-weight: 600;
    color: #333;
    font-size: 14px;
    display: inline-block;
    vertical-align: middle;
}

.option__desc {
    display: flex;
    flex-direction: column;
}

.option__title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
}

.option__small {
    font-size: 12px;
    color: #666;
    margin-top: 4px;
}

.option__desc span {
    display: block;
}

.clear-button {
    display: inline-block;
    font-weight: bold;
    font-size: 2rem;
    text-align: right;
    color: var(--danger);
    cursor: pointer;
    padding-right: 5px;
}

.grid-select-group {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    height: 100%;
}
</style>
