<template>
    <section class="box-grid-filter" v-if="!loadingCategories">
        <div>
            <div class="grid-select-group">
                <!-- Agregar la "X" para limpiar -->
                <span v-if="selectCategory" @click="selectCategory = undefined; selectSubcategory = undefined; emit('clearCategory')"
                    class="clear-button">
                    ✖
                </span>
                <span v-else></span>

                <multiselect v-model="selectCategory" :options="categories" :allow-empty="true"
                    @update:model-value="selectSubcategory = undefined; emit('changeCategory', selectCategory?.slug)" label="name" track-by="slug" :preserveSearch="true"
                    @remove="selectSubcategory = undefined; emit('clearCategory')"
                    :clearOnSelect="true"
                    :clearable="true" selectLabel="Pulsa Intro para seleccionar"
                    selectedLabel="Seleccionado" deselectLabel="Pulsa Intro para quitar"
                    placeholder="Filtrar por una categoría">

                    <!-- Single selected label (cuando se selecciona una categoría) -->
                    <template #singleLabel="props">
                        <div class="option__container">
                            <NuxtImg :src="props.option.urlImageMicro || 'logo_128x128.webp'" :alt="props.option.name"
                                class="option__image" />
                            <span class="option__name">{{ props.option.name }}</span>

                        </div>
                    </template>

                    <!-- Option when selecting (when dropdown is expanded) -->
                    <template #option="props">
                        <div class="option__container">
                            <NuxtImg :src="props.option.urlImageMicro || 'logo_128x128.webp'" :alt="props.option.name"
                                class="option__image" />
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
                <span v-if="selectSubcategory" @click="selectSubcategory = undefined; emit('clearSubcategory')"
                    class="clear-button">
                    ✖
                </span>

                <span v-else></span>

                <multiselect v-model="selectSubcategory" :options="subcategories" :allow-empty="true"
                    @update:model-value="emit('changeSubcategory', selectSubcategory?.slug, selectSubcategory?.parent); selectCategory = categories.find(cat => cat.slug === selectSubcategory?.parent) "
                    label="name" track-by="slug" :preserveSearch="true"
                    @remove="emit('clearSubcategory')"
                    :clearOnSelect="true" selectLabel="Pulsa Intro para seleccionar" selectedLabel="Seleccionado"
                    deselectLabel="Pulsa Intro para quitar" placeholder="Filtrar por un tema">
                    <!-- Single selected label (cuando se selecciona un tema) -->
                    <template #singleLabel="props">
                        <div class="option__container">
                            <NuxtImg :src="props.option.urlImageMicro || 'logo_128x128.webp'" :alt="props.option.name"
                                class="option__image" />
                            <span class="option__name">{{ props.option.name }}</span>
                        </div>
                    </template>

                    <!-- Option when selecting (when dropdown is expanded) -->
                    <template #option="props">
                        <div class="option__container">
                            <NuxtImg :src="props.option.urlImageMicro || 'logo_128x128.webp'" :alt="props.option.name"
                                class="option__image" />
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
</template>

<script lang="ts" setup>
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import type { CategoryType } from '@/types/CategoryType';

const emit = defineEmits(['clearCategory', 'clearSubcategory', 'changeCategory', 'changeSubcategory']);

const props = defineProps({
    loadingCategories: {
        type: Boolean,
        require: false,
        default: true,
    },
    categories: {
        type: Array as PropType<CategoryType[]>,
        required: true,
    },
    subcategories: {
        type: Array as PropType<CategoryType[]>,
        required: true,
    },
});

const selectCategory = ref<CategoryType|undefined>();
const selectSubcategory = ref<CategoryType|undefined>();

</script>

<style scoped>
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
