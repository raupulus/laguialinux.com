<script setup>
const props = defineProps({
    url: {
        type: String,
        required: false,
        default: 'https://www.facebook.com/raupulus/'
    },
    size: {
        type: String,
        required: false,
        default: "24px"
    },
    title: {
        type: String,
        required: false,
        default: 'Enlace a Facebook'
    },
    legacy: {
        type: Boolean,
        required: false,
        default: false,
    },
    decored: {
        type: Boolean,
        required: false,
        default: false,
    }
})
</script>

<template>
    <IconsGeneric v-if="legacy" :url="url" :title="title" :size="size" color="#1e40af">
        <img src="@/public/images/icons/social/facebook.svg" width="24" style="width: 100%;"
            alt="Logo de Facebook" />
    </IconsGeneric>

    <IconsGenericSocial v-else-if="decored" :url="url" :title="title" :size="size" color="#1e40af">
        <NuxtImg src="/images/icons/social/facebook.svg" width="32" style="width: 100%;"
            alt="Logo de Facebook" />
    </IconsGenericSocial>

    <IconsGeneric v-else :url="url" :title="title" :size="size" color="#1e40af">
        <NuxtImg src="/images/icons/social/facebook.svg" width="24" style="width: 100%;"
            alt="Logo de Facebook" />
    </IconsGeneric>
</template>
