<script setup>
const props = defineProps({
    url: {
        type: String,
        required: false,
        default: '#'
    },
    size: {
        type: String,
        required: false,
        default: "24px"
    },
    title: {
        type: String,
        required: false,
        default: 'Enlace a Mail'
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
    <IconsGeneric v-if="legacy" :url="url" :title="title" :size="size" color="#ebea98">
        <img src="@/public/images/icons/social/mail.svg" width="24" style="width: 100%;"
            alt="Logo de Mail" />
    </IconsGeneric>

    <IconsGenericSocial v-else-if="decored" :url="url" :title="title" :size="size" color="#ebea98">
        <NuxtImg src="/images/icons/social/mail.svg" width="32" style="width: 100%;"
            alt="Logo de Mail" />
    </IconsGenericSocial>

    <IconsGeneric v-else :url="url" :title="title" :size="size" color="#ebea98">
        <NuxtImg src="/images/icons/social/mail.svg" width="24" style="width: 100%;"
            alt="Logo de Mail" />
    </IconsGeneric>
</template>
