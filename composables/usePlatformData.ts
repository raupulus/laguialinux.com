import type { PlatformDataType } from "@/types/Platform/PlatformDataType";

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

    fetch(API_BASE + '/platform/laguialinux/info')
        .then(res => res.json())
        .then(all => platformData.value = all.data)
        .catch(err => console.log('FETCH 1', err));
}

export const usePlatformData = () => {
    getPlatformInfo()

    return platformData
}

export function getPlatformData() {
    return platformData
}
