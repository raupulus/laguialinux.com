import { ref } from 'vue';
import { type CategoryType } from '@/types/CategoryType'

const PLATFORM: string = 'laguialinux';

const categories = ref<CategoryType[]>([]);
const currentCategory = ref<CategoryType | null>(null);

const allSubcategories = ref<CategoryType[]>([]);
const subcategories = ref<CategoryType[]>([]);
const currentSubcategory = ref<CategoryType | null>(null);

const prepareVars = async () => {
    allSubcategories.value = categories.value.map((category: CategoryType) => {
        if (category.subcategories) {
            return category.subcategories.map((subcategory: CategoryType) => {
                return {
                    ...subcategory,
                }
            });
        }

        return [];
    }).flat(1)

    subcategories.value = [...allSubcategories.value];

}

const fecthCategories = async () => {
    const runtimeConfig = useRuntimeConfig();
    const API_BASE = runtimeConfig.public.api.base;

    const API_URL = `${API_BASE}/platform/${PLATFORM}/get/categories`;

    const response = await fetch(API_URL);

    if (response.ok) {
        const res = await response.json();

        categories.value = res.categories ?? [];

        await prepareVars();
    }
}


export const useFetchCategories = () => {
    if (!categories.value.length) {
        fecthCategories();
    }

    return {categories, subcategories, currentCategory, currentSubcategory, categoryActions} ;
}

export const useFetchCategory = (slug: string) => {
    if (!categories.value.length) {
        fecthCategories();
    }

    setCurrentCategory(slug);

    return {categories, subcategories, currentCategory, currentSubcategory, categoryActions} ;
}


const setCurrentCategory = (slug: string) => {
    const cat = categories.value.find((category: CategoryType) => category.slug === slug);

    currentCategory.value = cat ?? null;

    if (currentCategory.value && currentCategory.value.subcategories) {
        subcategories.value = currentCategory.value.subcategories.map((subcategory: CategoryType) => {
            return {
                ...subcategory,
            }
        });;
    } else {
        subcategories.value = [];
    }

    if (!slug.length) {
        subcategories.value = [...allSubcategories.value];
    }
}

const setCurrentSubcategory = (slug: string) => {
    const cat = subcategories.value.find((category: CategoryType) => category.slug === slug);

    currentSubcategory.value = cat ?? null;

    if (currentSubcategory.value) {
        currentCategory.value = categories.value.find((c: CategoryType) => c.slug === currentSubcategory.value?.parent) ?? null;
    } else {
        subcategories.value = [...allSubcategories.value];
    }
}

const categoryActions = {
    setCurrentCategory,
    setCurrentSubcategory
}
