import { type ContentType } from '@/types/ContentType';
import { type ResponseContentType } from '@/types/ResponseContentType'
import { prepareContentData } from '@/utils/ContentUtils';
import type { ContentPageType } from '@/types/ContentPageType';

const PLATFORM: string = 'laguialinux';

let fetchLocked = ref<boolean>(false);

let contentType = ref<string>('news');
let contentCategory = ref('');
let contentSubcategory = ref('');
let quantityForPage = ref<number>(10);

const results = ref<ResponseContentType>({
    status: 'ok',
    pagination: undefined,
    search_params: undefined,
    contents: [],
});

// Contenido actual, normalmente usado al visualizar un contenido concreto
const currentContent = ref<ContentType>();

// Páginas del contenido actual
const currentContentPages = ref<ContentPageType[]>([]);


// Indica si está actualmente preparando el contenido o descargándolo
const loadingContents = ref<boolean>(false);

const fetchResults = async (page: number = 1, reset: boolean = false) => {
    if (fetchLocked.value) {
        return;
    }

    if (page === 1) {
        loadingContents.value = true;
    }

    fetchLocked.value = true;

    const isClient = process.client;

    let API_BASE: string = '';

    if (isClient) {
        const runtimeConfig = useRuntimeConfig();
        API_BASE = runtimeConfig.public.api.base;
    } else {
        API_BASE = process.env.API_BASE_URL || '';
    }

    const API_URL = `${API_BASE}/platform/${PLATFORM}/content/type/${contentType.value}`;

    const paramsDict = {
        page: page.toString(),
        quantity: quantityForPage.value.toString(),
        category: contentCategory.value,
        subcategory: contentSubcategory.value,
    }

    const params = new URLSearchParams(paramsDict);
    const response = await fetch(`${API_URL}?${params}`);

    if (response.ok) {
        const data: ResponseContentType = await response.json();

        if (reset) {
            results.value.contents = [];
        }

        results.value.pagination = data.pagination ?? undefined;
        results.value.search_params = data.search_params ?? undefined;

        data.contents?.forEach((content: ContentType) => {
            content = prepareContentData(content, contentType.value);

            results.value.contents?.push(content);
        })

        results.value.status = data.status ?? 'ok';
    }

    fetchLocked.value = false;
    loadingContents.value = false;
};

export const useFetchContent = (type: string, category: string = '', subcategory: string = '') => {
    contentType.value = type;
    contentCategory.value = category;
    contentSubcategory.value = subcategory;

    fetchResults(1, true);

    return { results, contentActions, loadingContents };
}

const setFilterCategory = (cat: string) => {
    contentCategory.value = cat ?? '';
}

const setFilterSubCategory = (subcat: string) => {
    contentSubcategory.value = subcat ?? '';
}


const contentActions = {
    setFilterCategory,
    setFilterSubCategory,
    fetchResults,
}


/**
 * Obtiene la siguiente página si existiera y la añade a la lista de contenido.
 */
export const useFetchContentNext = () => {
    if (results.value.pagination?.hasNextPage) {
        let currentPage = results.value.pagination.currentPage
        fetchResults(++currentPage, false);
    }
}


async function fetchContentBySlug(type:string, slug: string, withPages = false) {
    fetchLocked.value = true;
    contentType.value = type;

    const isClient = process.client;
    let API_BASE: string = '';

    if (isClient) {
        const runtimeConfig = useRuntimeConfig();
        API_BASE = runtimeConfig.public.api.base;
    } else {
        API_BASE = process.env.API_BASE_URL || '';
    }

    const API_URL = `${API_BASE}/content/${contentType.value}/${slug}/get`;

    const response = await fetch(API_URL);

    if (response.ok) {
        const res = await response.json();

        if (res.content) {
            currentContent.value = prepareContentData(res.content, type) ?? null;
        }

        if (withPages && currentContent.value?.pages_slug) {
            const pages = currentContent.value?.pages_slug.length ?? 0

            for (let i = 1; i <= pages; i++) {
                await fetchContentPageByOrder(currentContent.value.slug, i);
            }
        }
    } else {
        console.error('FETCH useFetchPageBySlug ERROR', response);
    }

    fetchLocked.value = false;
}

/**
 * Busca una página por su slug
 *
 * @param slug
 * @returns
 */
export const useFetchContentBySlug = (type:string, slug: string) => {
    fetchContentBySlug(type, slug, true);

    return {currentContent, currentContentPages, loadingContents};
}


async function fetchContentPageByOrder(contentSlug: string, order: number) {
    const isClient = process.client;
    let API_BASE: string = '';

    if (isClient) {
        const runtimeConfig = useRuntimeConfig();
        API_BASE = runtimeConfig.public.api.base;
    } else {
        API_BASE = process.env.API_BASE_URL || '';
    }

    const API_URL = `${API_BASE}/content/${contentSlug}/get/page/${order}`;

    //let page: ContentPageType | null = null;

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {

            const page = data.page;

            if (page && page.content) {
                page.content = JSON.parse(page.content);
                currentContentPages.value?.push(page);
            }
        })
        .catch(error => {
            console.error('FETCH fetchContentPageByOrder ERROR', error);
        });
}

export const useFetchContentPageByOrder = (contentSlug: string, order: number) => {
    fetchContentPageByOrder(contentSlug, order);

    return currentContentPages;
}
