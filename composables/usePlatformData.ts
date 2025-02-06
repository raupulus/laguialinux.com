import type { PlatformDataType } from "@/types/Platform/PlatformDataType";

const PLATFORM: string = 'laguialinux';

type PlaformDataRequest = {
    status: string,
    data: PlatformDataType
}

const platformData = ref<PlatformDataType>();

async function getPlatformInfo() {
    const isClient = process.client;
    let API_BASE: string = '';

    if (isClient) {
        const runtimeConfig = useRuntimeConfig();
        API_BASE = runtimeConfig.public.api.base;
    } else {
        API_BASE = process.env.API_BASE_URL || '';
    }

    /*
    fetch(API_BASE + '/platform/laguialinux/info')
        .then(res => res.json())
        .then(all => platformData.value = all.data)
        .catch(err => console.log('FETCH 1', err));
    */

    //const { data, error } = await useFetch<PlaformDataRequest>(API_BASE + '/platform/laguialinux/info');

    const {data, status, error} = await useAsyncData<PlaformDataRequest>(
        'platformData',
        () => $fetch(`${API_BASE}/platform/${PLATFORM}/info`), {
            //watch: [page]
            server: true,
            lazy: false,
            immediate: true,
        },

    );

    if (error.value) {
        console.error('Error fetching data:', error.value);
    } else if (data.value) {
        platformData.value = data.value?.data;
    }
}

export const usePlatformData = () => {
    if (!platformData.value) {
        getPlatformInfo()
    }

    return platformData
}

export function getPlatformData() {
    return platformData
}
