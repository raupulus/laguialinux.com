<script setup>
const props = defineProps({
    url: {
        type: String,
        required: false,
        default: 'https://bsky.app/profile/raupulus.bsky.social'
    },
    size: {
        type: String,
        required: false,
        default: "24px"
    },
    title: {
        type: String,
        required: false,
        default: 'Enlace a Bluesky'
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
    <IconsGeneric v-if="legacy" :url="url" :title="title" :size="size" color="#1185fe">
        <img src="@/public/images/icons/social/bluesky.svg" width="24" style="width: 100%;"
            alt="Logo de Bluesky" />
    </IconsGeneric>

    <IconsGenericSocial v-else-if="decored" :url="url" :title="title" :size="size" color="#1185fe">
        <NuxtImg src="/images/icons/social/bluesky.svg" width="32" style="width: 100%;"
            alt="Logo de Bluesky" />
    </IconsGenericSocial>

    <IconsGeneric v-else :url="url" :title="title" :size="size" color="#1185fe">
        <NuxtImg src="/images/icons/social/bluesky.svg" width="24" style="width: 100%;"
            alt="Logo de Bluesky" />
    </IconsGeneric>
</template>
