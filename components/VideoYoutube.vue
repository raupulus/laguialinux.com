<template>
    <div class="yt-video-container">
        <iframe
            width="560"
            height="315"
            :src="`https://www.youtube.com/embed/${videoId}`"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
        </iframe>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    videoId: {
        type: String,
        required: true
    }
})

</script>

<style scoped>
.yt-video-container {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
    height: 0;
    overflow: hidden;
    max-width: 100%;
    width: 100%;
}

.yt-video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
</style>
