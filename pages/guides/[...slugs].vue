<template>
    <div>
        <section class="guides-header">
            <h1 class="text-center">Guías Linux</h1>
            <p class="text-center">Encuentra tutoriales, manuales y guías sobre Linux y software libre</p>
        </section>

        <!-- Sección de búsqueda -->
        <section class="search-section">
            <div class="box-search">
                <h2 class="box-search-title text-center">Buscar Guías</h2>

                <div class="box-search-fields">
                    <div class="category-input">
                        <div class="box-search">
                            <input 
                                type="text" 
                                v-model="searchQuery" 
                                placeholder="Buscar guías..." 
                                @keyup.enter="searchGuides"
                            >
                            <span class="btn-search" @click="searchGuides"></span>
                        </div>
                        <div class="btn-clean" @click="clearSearch" v-if="searchQuery">
                            <img src="/images/icons/close.svg" alt="Limpiar búsqueda">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filtros por categoría -->
            <div class="category-filters" v-if="categories.length > 0">
                <h3 class="text-center">Filtrar por categoría</h3>
                <div class="category-list">
                    <div 
                        v-for="category in categories" 
                        :key="category.slug"
                        class="category-item"
                        :class="{ 'active': selectedCategories.includes(category.slug) }"
                        @click="toggleCategory(category.slug)"
                    >
                        <span class="category-name">{{ category.name }}</span>
                    </div>
                </div>
            </div>

            <!-- Filtros por subcategoría -->
            <div class="subcategory-filters" v-if="filteredSubcategories.length > 0">
                <h3 class="text-center">Filtrar por subcategoría</h3>
                <div class="subcategory-list">
                    <div 
                        v-for="subcategory in filteredSubcategories" 
                        :key="subcategory.slug"
                        class="subcategory-item"
                        :class="{ 'active': selectedSubcategories.includes(subcategory.slug) }"
                        @click="toggleSubcategory(subcategory.slug)"
                    >
                        <span class="subcategory-name">{{ subcategory.name }}</span>
                    </div>
                </div>
            </div>

            <!-- Filtros por tecnología -->
            <div class="technology-filters" v-if="technologies.length > 0">
                <h3 class="text-center">Filtrar por tecnología</h3>
                <div class="technology-list">
                    <div 
                        v-for="tech in technologies" 
                        :key="tech.slug"
                        class="technology-item"
                        :class="{ 'active': selectedTechnologies.includes(tech.slug) }"
                        @click="toggleTechnology(tech.slug)"
                    >
                        <img 
                            v-if="tech.icon" 
                            :src="tech.icon" 
                            :alt="tech.name"
                            class="img-technology-search"
                        >
                        <span class="technology-select-feature">{{ tech.name }}</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Contenido de guías -->
        <section class="guides-content">
            <div v-if="loading" class="text-center">
                <p>Cargando contenido...</p>
            </div>

            <div v-else-if="error" class="text-center error-message">
                <p>{{ error }}</p>
            </div>

            <div v-else-if="guideContent" class="guide-detail">
                <h2>{{ guideContent.title }}</h2>
                <div class="guide-metadata">
                    <span v-if="guideContent.created_at_human">Publicado: {{ guideContent.created_at_human }}</span>
                    <span v-if="guideContent.categories && guideContent.categories.length">
                        Categoría: 
                        <span v-for="(category, index) in guideContent.categories" :key="category.id">
                            {{ category.name }}{{ index < guideContent.categories.length - 1 ? ', ' : '' }}
                        </span>
                    </span>
                </div>

                <div class="guide-content" v-html="guideContent.content"></div>

                <div v-if="guideContent.technologies && guideContent.technologies.length" class="guide-technologies">
                    <h3>Tecnologías relacionadas:</h3>
                    <div class="technology-tags">
                        <span 
                            v-for="tech in guideContent.technologies" 
                            :key="tech.id"
                            class="technology-tag"
                        >
                            {{ tech.name }}
                        </span>
                    </div>
                </div>
            </div>

            <div v-else-if="guides.length > 0" class="guides-list">
                <div class="box-projects">
                    <div 
                        v-for="guide in filteredGuides" 
                        :key="guide.slug"
                        class="guide-item"
                    >
                        <NuxtLink :to="guide.url || `/guides/${guide.path}`">
                            <div class="guide-card">
                                <div class="guide-image" v-if="guide.urlImageMedium">
                                    <NuxtImg 
                                        :src="guide.urlImageMedium" 
                                        :alt="guide.title"
                                        width="300"
                                        height="200"
                                        loading="lazy"
                                    />
                                </div>
                                <div class="guide-info">
                                    <h3>{{ guide.title }}</h3>
                                    <p>{{ guide.excerpt }}</p>
                                </div>
                            </div>
                        </NuxtLink>
                    </div>

                    <div v-if="filteredGuides.length === 0" class="no-results">
                        <p>No se encontraron guías que coincidan con tu búsqueda.</p>
                    </div>
                </div>
            </div>

            <div v-else class="no-guides">
                <p>No hay guías disponibles en este momento.</p>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { ContentType } from '@/types/ContentType';
import type { TechnologyType } from '@/types/TechnologyType';
import type { CategoryType } from '@/types/CategoryType';

// Route params
const route = useRoute();
const slugs = computed(() => route.params.slugs as string[]);

// State
const searchQuery = ref('');
const guides = ref<ContentType[]>([]);
const guideContent = ref<ContentType | null>(null);
const technologies = ref<TechnologyType[]>([]);
const categories = ref<CategoryType[]>([]);
const subcategories = ref<CategoryType[]>([]);
const selectedTechnologies = ref<string[]>([]);
const selectedCategories = ref<string[]>([]);
const selectedSubcategories = ref<string[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Computed
const filteredSubcategories = computed(() => {
    if (selectedCategories.value.length === 0) {
        return subcategories.value;
    }

    return subcategories.value.filter(subcategory => {
        // If the subcategory has a parent_id, check if its parent category is selected
        if (subcategory.parent_id) {
            const parentCategory = categories.value.find(cat => cat.id === subcategory.parent_id);
            if (parentCategory && selectedCategories.value.includes(parentCategory.slug)) {
                return true;
            }
        }
        return false;
    });
});

const filteredGuides = computed(() => {
    let result = [...guides.value];

    // Filter by search query
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(guide => 
            guide.title.toLowerCase().includes(query) || 
            guide.excerpt.toLowerCase().includes(query)
        );
    }

    // Filter by selected categories
    if (selectedCategories.value.length > 0) {
        result = result.filter(guide => {
            if (!guide.categories) return false;
            return guide.categories.some(category => 
                selectedCategories.value.includes(category.slug)
            );
        });
    }

    // Filter by selected subcategories
    if (selectedSubcategories.value.length > 0) {
        result = result.filter(guide => {
            if (!guide.subcategories) return false;
            return guide.subcategories.some(subcategory => 
                selectedSubcategories.value.includes(subcategory.slug)
            );
        });
    }

    // Filter by selected technologies
    if (selectedTechnologies.value.length > 0) {
        result = result.filter(guide => {
            if (!guide.technologies) return false;
            return guide.technologies.some(tech => 
                selectedTechnologies.value.includes(tech.slug)
            );
        });
    }

    return result;
});

// Methods
const fetchGuides = async () => {
    loading.value = true;
    error.value = null;

    try {
        const config = useRuntimeConfig();
        const API_BASE = config.public.api.base;

        const response = await fetch(`${API_BASE}/platform/laguialinux/guides`);

        if (!response.ok) {
            throw new Error('Error al cargar las guías');
        }

        const data = await response.json();
        guides.value = data.guides || [];
        technologies.value = data.technologies || [];
        categories.value = data.categories || [];
        subcategories.value = data.subcategories || [];
    } catch (err) {
        console.error('Error fetching guides:', err);
        error.value = 'Error al cargar las guías. Por favor, intenta de nuevo más tarde.';
    } finally {
        loading.value = false;
    }
};

const fetchGuideContent = async () => {
    if (!slugs.value || slugs.value.length === 0) return;

    loading.value = true;
    error.value = null;

    try {
        const config = useRuntimeConfig();
        const API_BASE = config.public.api.base;
        const path = slugs.value.join('/');

        const response = await fetch(`${API_BASE}/platform/laguialinux/guides/${path}`);

        if (!response.ok) {
            if (response.status === 404) {
                error.value = 'La guía solicitada no existe';
            } else {
                throw new Error('Error al cargar el contenido de la guía');
            }
            return;
        }

        const data = await response.json();
        guideContent.value = data.guide || null;
    } catch (err) {
        console.error('Error fetching guide content:', err);
        error.value = 'Error al cargar el contenido de la guía. Por favor, intenta de nuevo más tarde.';
    } finally {
        loading.value = false;
    }
};

const searchGuides = () => {
    // This function is called when the search button is clicked or Enter is pressed
    // The filtering is handled by the computed property
};

const clearSearch = () => {
    searchQuery.value = '';
};

const toggleCategory = (slug: string) => {
    const index = selectedCategories.value.indexOf(slug);
    if (index === -1) {
        selectedCategories.value.push(slug);
        // Clear subcategory selection when changing categories
        selectedSubcategories.value = [];
    } else {
        selectedCategories.value.splice(index, 1);
        // Clear subcategory selection when deselecting a category
        selectedSubcategories.value = selectedSubcategories.value.filter(subSlug => {
            const subcategory = subcategories.value.find(sub => sub.slug === subSlug);
            if (!subcategory) return false;

            const parentCategory = categories.value.find(cat => cat.id === subcategory.parent_id);
            return parentCategory && selectedCategories.value.includes(parentCategory.slug);
        });
    }
};

const toggleSubcategory = (slug: string) => {
    const index = selectedSubcategories.value.indexOf(slug);
    if (index === -1) {
        selectedSubcategories.value.push(slug);
    } else {
        selectedSubcategories.value.splice(index, 1);
    }
};

const toggleTechnology = (slug: string) => {
    const index = selectedTechnologies.value.indexOf(slug);
    if (index === -1) {
        selectedTechnologies.value.push(slug);
    } else {
        selectedTechnologies.value.splice(index, 1);
    }
};

// Lifecycle
onMounted(async () => {
    if (slugs.value && slugs.value.length > 0) {
        await fetchGuideContent();
    } else {
        await fetchGuides();
    }
});

// Watch for route changes
watch(() => route.params.slugs, async () => {
    if (slugs.value && slugs.value.length > 0) {
        await fetchGuideContent();
    } else {
        await fetchGuides();
    }
}, { deep: true });
</script>

<style scoped>
/* Guides Header */
.guides-header {
    margin-bottom: 2rem;
    padding: 2rem 1rem;
    background-color: var(--blue);
    color: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.guides-header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
}

.guides-header p {
    font-size: 1.2rem;
    opacity: 0.9;
}

/* Search Section */
.search-section {
    margin-bottom: 2rem;
}

.box-search {
    margin-bottom: 1.5rem;
}

.box-search-title {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: var(--primary);
}

.box-search-fields {
    width: 100%;
}

.img-technology-search {
    margin-left: 1px;
    margin-right: 3px;
    width: 23px;
    height: 23px;
    translate: 0 3px;
}

.technology-select-feature {
    font-weight: bold;
    font-size: 1.3rem;
    text-shadow: 1px 1px 1px #000;
}

.category-input {
    display: grid;
    margin: auto;
    width: 80%;
    max-width: 600px;
    grid-template-columns: 1fr 50px;
    align-items: center;
    box-sizing: border-box;
}

.category-input>.box-search>input {
    margin: 0 auto;
    padding: 10px 45px 10px 10px;
    width: 100%;
    font-size: 1.3rem;
    font-weight: bold;
    color: rgba(20, 20, 20, 0.64);
    background-color: var(--gray);
    border: none;
    border-radius: 4px;
    box-sizing: border-box;
}

.category-input>.box-search>input::placeholder {
    font-style: italic;
}

.category-input>.btn-clean {
    display: grid;
    padding-left: 0.5rem;
    height: 100%;
    align-items: center;
    box-sizing: border-box;
    cursor: pointer;
}

.category-input>.btn-clean>img {
    width: 100%;
    fill: rgba(20, 20, 20, 0.64);
}

.category-input>.btn-clean>img:hover {
    filter: brightness(10%);
}

.category-input>.box-search>.btn-search {
    position: absolute;
    width: 40px;
    height: 40px;
    padding: 0;
    margin: 0;
    translate: -50px;
    border: 1px solid transparent;
    border-radius: inherit;
    background: transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' class='bi bi-search' viewBox='0 0 16 16'%3E%3Cpath d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z'%3E%3C/path%3E%3C/svg%3E") no-repeat center;
    cursor: pointer;
    opacity: 0.5;
}

.category-input>.box-search>span:hover {
    opacity: 1;
}

.category-input>.box-search>span:focus,
.category-input>.box-search>input:focus {
    box-shadow: 0 0 3px 0 var(--primary);
    border-color: var(--primary);
    outline: none;
}

/* Filter Sections - Common Styles */
.category-filters,
.subcategory-filters,
.technology-filters {
    margin: 1.5rem 0;
    padding: 1rem;
    background-color: var(--gray-light, #f5f5f5);
    border-radius: 0.5rem;
}

.category-filters h3,
.subcategory-filters h3,
.technology-filters h3 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
    color: var(--primary);
}

.category-list,
.subcategory-list,
.technology-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    justify-content: center;
}

.category-item,
.subcategory-item,
.technology-item {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: white;
    border: 1px solid var(--gray, #ddd);
    border-radius: 2rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.category-item:hover,
.subcategory-item:hover,
.technology-item:hover {
    background-color: var(--gray, #ddd);
}

.category-item.active,
.subcategory-item.active,
.technology-item.active {
    background-color: var(--primary);
    color: white;
    border-color: var(--primary);
}

/* Category Filters - Specific Styles */
.category-filters {
    background-color: rgba(0, 93, 181, 0.1);
}

.category-name {
    font-weight: bold;
}

/* Subcategory Filters - Specific Styles */
.subcategory-filters {
    background-color: rgba(0, 93, 181, 0.05);
}

/* Technology Filters - Specific Styles */
.technology-filters {
    background-color: rgba(238, 182, 36, 0.1);
}

/* Guide Content */
.guides-content {
    margin-top: 2rem;
}

.error-message {
    color: red;
    padding: 1rem;
    background-color: rgba(255, 0, 0, 0.1);
    border-radius: 0.5rem;
}

/* Guide List */
.guides-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.box-projects {
    width: 100%;
    padding: 0.9rem 0.6rem;
}

.guide-item {
    transition: transform 0.2s ease;
}

.guide-item:hover {
    transform: translateY(-5px);
}

.guide-card {
    height: 100%;
    background-color: white;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s ease;
}

.guide-card:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.guide-image {
    height: 200px;
    overflow: hidden;
}

.guide-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.guide-info {
    padding: 1rem;
}

.guide-info h3 {
    margin-bottom: 0.5rem;
    font-size: 1.3rem;
    color: var(--primary);
}

.guide-info p {
    color: var(--text, #333);
    font-size: 0.9rem;
    line-height: 1.4;
}

/* Guide Detail */
.guide-detail {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
}

.guide-detail h2 {
    font-size: 2rem;
    color: var(--primary);
    margin-bottom: 1rem;
}

.guide-metadata {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
    color: var(--text-light, #666);
}

.guide-content {
    line-height: 1.6;
    font-size: 1.1rem;
}

.guide-technologies {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid var(--gray, #ddd);
}

.technology-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.technology-tag {
    padding: 0.3rem 0.8rem;
    background-color: var(--gray-light, #f5f5f5);
    border-radius: 1rem;
    font-size: 0.9rem;
}

.no-results, .no-guides {
    text-align: center;
    padding: 2rem;
    color: var(--text-light, #666);
    font-style: italic;
}

/* Responsive Styles */
@media (max-width: 880px) {
    .category-input {
        width: 100%;
        padding: 0 1.3rem;
    }

    .box-projects {
        margin-top: 0.6rem;
        padding: 1.3rem 0.6rem;
    }

    .guides-list {
        grid-template-columns: 1fr;
    }

    .guide-detail {
        padding: 0.5rem;
    }

    .guide-detail h2 {
        font-size: 1.8rem;
    }

    .guides-header h1 {
        font-size: 2rem;
    }

    .guides-header p {
        font-size: 1rem;
    }
}
</style>
