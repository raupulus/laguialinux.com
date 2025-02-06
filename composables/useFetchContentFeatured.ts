import type { ContentFeaturedData } from "@/types/ContentFeaturedType";
import type { ContentFeaturedRequest } from "@/types/ContentFeaturedType";
import { prepareContentFeatured } from '@/utils/ContentUtils';

const PLATFORM: string = 'laguialinux';

const contentFeatured = ref<ContentFeaturedData | null>(null);
const loadingContentFeatured = ref<boolean>(true);
const fetchLocked = ref<boolean>(false);

async function fetchContentFeatured() {
    //if (fetchLocked.value) return;

    loadingContentFeatured.value = true;
    fetchLocked.value = true;

    const isClient = process.client;
    let API_BASE: string = '';

    if (isClient) {
        const runtimeConfig = useRuntimeConfig();
        API_BASE = runtimeConfig.public.api.base;

        const response = await fetch(`${API_BASE}/platform/${PLATFORM}/content/featured`);

        if (response.ok) {
            const data  = ref<ContentFeaturedRequest>(await response.json());
            contentFeatured.value = prepareContentFeatured(data.value);
        }
    } else {
        API_BASE = process.env.API_BASE_URL || '';

        //const { data } = await useFetch<ContentFeaturedRequest>(`${API_BASE}/platform/${PLATFORM}/content/featured`);
        const { data, error } = await useAsyncData<ContentFeaturedRequest>('contentFeatured', () =>
            $fetch(`${API_BASE}/platform/${PLATFORM}/content/featured`)
        );

        if (!error.value) {
            console.error('Error fetching data:', error.value);
            contentFeatured.value = prepareContentFeatured(data.value);
        }
    }

    loadingContentFeatured.value = false;
    fetchLocked.value = false;
}


export const useFetchContentFeatured = () => {
    if (!contentFeatured.value || !contentFeatured.value?.featured || !contentFeatured.value?.latest || !contentFeatured.value?.trend) {
        fetchContentFeatured();
    }

    return { contentFeatured, loadingContentFeatured };
}
