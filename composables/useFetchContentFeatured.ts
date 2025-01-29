import type { ContentFeaturedData } from "@/types/ContentFeaturedType";
import type { ContentFeaturedRequest } from "@/types/ContentFeaturedType";

const PLATFORM: string = 'laguialinux';

const contentFeatured = ref<ContentFeaturedData>({
    featured: undefined,
    latest: undefined
});
const loadingContentFeatured = ref<boolean>(false);
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

    const { data, error } = await useFetch<ContentFeaturedRequest>(API_BASE + `/platform/${PLATFORM}/content/featured`);

    if (error.value) {
        console.error('Error fetching data:', error.value);
    } else if (data.value) {
        contentFeatured.value = {
            featured: data.value?.featured,
            latest: data.value?.latest
        };
    }


    loadingContentFeatured.value = false;
    fetchLocked.value = false;
}

export const useFetchContentFeatured = () => {
    if (!contentFeatured.value || !contentFeatured.value.featured || !contentFeatured.value.latest) {
        console.log('Fetching contentFeatured');
        // Mirar que no se pueden tener dos useFetch, hay que pasarle como una key
        // https://nuxt.com/docs/api/composables/use-fetch
        fetchContentFeatured();
    }

    return {contentFeatured, loadingContentFeatured};
}
