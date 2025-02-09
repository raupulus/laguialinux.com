import { ref } from 'vue';
import { type CategoryType } from '@/types/CategoryType'
import { prepareDataCategory } from '@/utils/CategoryUtils';

const PLATFORM: string = 'laguialinux';

const categories = ref<CategoryType[]>([]);
const currentCategory = ref<CategoryType | undefined>(undefined);

const allSubcategories = ref<CategoryType[]>([]);
const subcategories = ref<CategoryType[]>([]);
const currentSubcategory = ref<CategoryType | undefined>(undefined);

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

const fecthCategories = async (slugCurrent: string|null = null, slugSubCategoryCurrent: string|null = null) => {
    const isClient = process.client;
    let API_BASE: string = '';

    if (isClient) {
        const runtimeConfig = useRuntimeConfig();
        API_BASE = runtimeConfig.public.api.base;
    } else {
        API_BASE = process.env.API_BASE_URL || '';
    }

    const API_URL = `${API_BASE}/platform/${PLATFORM}/get/categories`;

    const response = await fetch(API_URL);

    if (response.ok) {
        const res = await response.json();

        categories.value = res.categories?.map((category: CategoryType) => {
            return prepareDataCategory(category);
        }) ?? [];

        await prepareVars();
    }

    if (slugCurrent) {
        await setCurrentCategory(slugCurrent);
    }

    if (slugSubCategoryCurrent) {
        await setCurrentSubcategory(slugSubCategoryCurrent);
    }
}


export const useFetchCategories = () => {
    if (!categories.value.length) {
        fecthCategories();
    }

    return {categories, subcategories, currentCategory, currentSubcategory, categoryActions} ;
}

export const useFetchCategory = (slug: string, slugSubcategory: string|null = null) => {
    if (!categories.value.length) {
        fecthCategories(slug, slugSubcategory);
    } else {
        setCurrentCategory(slug);
        setCurrentSubcategory(slugSubcategory ?? '');
    }

    return {categories, subcategories, currentCategory, currentSubcategory, categoryActions} ;
}


const setCurrentCategory = (slug: string) => {
    const cat = categories.value.find((category: CategoryType) => category.slug === slug);

    currentCategory.value = cat ?? undefined;

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

    currentSubcategory.value = cat ?? undefined;

    if (currentSubcategory.value) {
        currentCategory.value = categories.value.find((c: CategoryType) => c.slug === currentSubcategory.value?.parent) ?? undefined;
    } else {
        subcategories.value = [...allSubcategories.value];
    }

    // Establezco categoría asociada a la subcategoría al cambiar.
    if (currentSubcategory && currentSubcategory.value?.parent) {
        setCurrentCategory(currentSubcategory.value.parent);
    }

}

const categoryActions = {
    setCurrentCategory,
    setCurrentSubcategory
}
