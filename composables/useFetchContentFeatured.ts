import type { ContentFeaturedData } from "@/types/ContentFeaturedType";
import type { ContentFeaturedRequest } from "@/types/ContentFeaturedType";

const PLATFORM: string = 'laguialinux';

const contentFeatured = ref<ContentFeaturedData | null>(null);
const loadingContentFeatured = ref<boolean>(true);
const fetchLocked = ref<boolean>(false);

async function fetchContentFeatured() {
    if (fetchLocked.value) return;

    loadingContentFeatured.value = true;
    fetchLocked.value = true;

    const isClient = process.client;
    let API_BASE: string = '';

    if (isClient) {
        const runtimeConfig = useRuntimeConfig();
        API_BASE = runtimeConfig.public.api.base;
    } else {
        API_BASE = process.env.API_BASE_URL || '';
    }

    //const { data, error } = await useFetch<ContentFeaturedRequest>(API_BASE + `/platform/${PLATFORM}/content/featured`);

    const { data, status, error } = await useAsyncData<ContentFeaturedRequest>(
        'contentFeatured',
        () => $fetch(`${API_BASE}/platform/${PLATFORM}/content/featured`), {
            //watch: [page]
            server: true,
            lazy: false,
            immediate: true,
        },

    );

    if (error.value) {
        console.error('Error fetching data:', error.value);
    } else if (data.value) {

        const featured = data.value?.featured ?? null;
        const latest = data.value?.latest ?? null;
        const trend = data.value?.trend ?? null;

        if (featured) {
            featured.blog = featured.blog?.map((content) => prepareContentData(content, 'blog'));
            featured.news = featured.news?.map((content) => prepareContentData(content, 'news'));
            featured.guides = featured.guides?.map((content) => prepareContentData(content, 'guides'));
        }

        if (latest) {
            latest.blog = latest.blog?.map((content) => prepareContentData(content, 'blog'));
            latest.news = latest.news?.map((content) => prepareContentData(content, 'news'));
            latest.guides = latest.guides?.map((content) => prepareContentData(content, 'guides'));
        }

        if (trend) {
            trend.blog = trend.blog?.map((content) => prepareContentData(content, 'blog'));
            trend.news = trend.news?.map((content) => prepareContentData(content, 'news'));
            trend.guides = trend.guides?.map((content) => prepareContentData(content, 'guides'));
        }

        contentFeatured.value = {
            featured: featured,
            latest: data.value?.latest ?? null,
            trend: data.value?.trend ?? null,
        };
    }

    loadingContentFeatured.value = false;
    fetchLocked.value = false;
}

export const useFetchContentFeatured = () => {
    fetchContentFeatured();

    return {contentFeatured, loadingContentFeatured};
}
