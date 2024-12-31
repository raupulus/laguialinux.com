import { type ContentType } from '@/types/ContentType';
import { type MetadataType } from '@/types/MetadataType';
import { type PaginationType } from '@/types/PaginationType';
import { type SearchParamsType } from '@/types/SearchParamsType';
import { type ResponseContentType } from '@/types/ResponseContentType'

const PLATFORM: string = 'laguialinux';

let fetchLocked = ref<boolean>(false);

let contentType = ref<string>('new');
let contentCategory = ref('');
let contentSubcategory = ref('');
let quantityForPage = ref<number>(10);

const results = ref<ResponseContentType>({
    status: 'ok',
    pagination: undefined,
    search_params: undefined,
    contents: [],
});

const fetchResults = async (page: number = 1, reset: boolean = false) => {
    if (fetchLocked.value) {
        return;
    }

    fetchLocked.value = true;

    const runtimeConfig = useRuntimeConfig();
    const API_BASE = runtimeConfig.public.api.base;

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

        results.value.contents = results.value.contents?.concat(data.contents ?? []) ??  [];
        results.value.pagination = data.pagination ?? undefined;
        results.value.search_params = data.search_params ?? undefined;
        results.value.status = data.status ?? 'ok';
    }

    fetchLocked.value = false;
};

export const useFetchContent = (type: string, category: string = '', subcategory: string = '') => {
    contentType.value = type;
    contentCategory.value = category;
    contentSubcategory.value = subcategory;

    fetchResults(1, true);

    return {results, contentActions};
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



export const useFetchContentNext = () => {
    if (results.value.pagination?.hasNextPage) {
        let currentPage = results.value.pagination.currentPage
        fetchResults(++currentPage, false);
    }
}

/**
 * Busca un contenido de por el slug
 *
 * @param slug
 * @returns
 */
export async function getPageBySlug(slug: string): Promise<ContentType | null> {
    const runtimeConfig = useRuntimeConfig();
    const API_BASE = runtimeConfig.public.api.base;
    const API_URL = `${API_BASE}/content/${contentType}/${slug}/get`;

    let content: ContentType | null = null;

    const response = await fetch(API_URL);
    if (response.ok) {
        const res = await response.json();
        if (res.content) {
            content = prepareDataContentResponse(res.content) ?? null;
        }
    } else {
        console.error('FETCH getPageBySlug ERROR', response);
    }

    return content;
}

function prepareDataMetadata(metadata: MetadataType) {
    const priority: (keyof MetadataType)[] = [
        'web', 'youtube_channel', 'youtube_video', 'youtube', 'gitlab', 'github',
        'twitter', 'linkedin', 'mastodon', 'twitch',
        'telegram_channel',
    ];

    let results: MetadataType = {};
    let counter = 0;

    if (metadata) {
        priority.forEach(p => {
            if ((p === 'youtube_channel') || (p === 'youtube_video')) {
                if (metadata[p] && counter < 4) {
                    if (!results.youtube) {
                        counter++;
                    }
                    results.youtube = metadata[p];
                }
            } else if (counter < 4 && metadata[p]) {
                counter++;
                results[p] = metadata[p];
            }
        });
    }

    return results;
}

function prepareDataContentResponse(contentRaw: ContentType) {
    if (contentRaw) {
        return prepareDataContent(contentRaw);
    }

    return null;
}

function prepareDataContent(content: ContentType) {
    if (content.metadata) {
        content.metadata = prepareDataMetadata(content.metadata);
    }
    return content;
}
