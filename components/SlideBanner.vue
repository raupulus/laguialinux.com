<template>
    <div class="box-slide-banner">
        <ClientOnly>
            <swiper-container ref="containerRefBanner" :init="false" :lazy="true">
                <template v-for="(type, idx) in contents" :key="idx">
                    <swiper-slide v-for="(content, idx) in type" :key="idx">
                        <Banner :title="content.title" :description="content.excerpt" :url="content.url"
                            :image="content.has_image ? content.urlImageSmall : ''" />
                    </swiper-slide>
                </template>
            </swiper-container>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import type { ContentFeatured } from '@/types/ContentFeaturedType';

const props = defineProps({
    contents: {
        type: Object as PropType<ContentFeatured>,
        required: true,
    },
    loading: {
        type: Boolean,
        default: true,
    }
});

const containerRefBanner = ref(null);

const swiper = useSwiper(containerRefBanner, {
    effect: 'coverflow', // creative, cube, coverflow, flip, cards, fade
    loop: true,
    grabCursor: true,
    slidesPerView: 1,
    centeredSlides: true,
    pagination: {
        enabled: false,
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    autoplay: {
        delay: 10000,
    },

    keyboard: {
        enabled: false,
        onlyInViewport: true,
    },
    coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
    },
});
</script>

<style lang="css">
.box-slide-banner {
    width: 100%;
    overflow: hidden;
    position: relative;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
}

.box-slide-banner swiper-container {
    width: 100%;
    height: auto;
    display: block;
    box-sizing: border-box;
    overflow: hidden;
}

.box-slide-banner swiper-slide {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 8px 0 0 0;
    width: 100% !important;
    height: auto !important;
    text-align: center;
    box-sizing: border-box;
}

@media (max-width: 768px) {
    .box-slide-banner swiper-container {
        width: 100%;
        height: auto;
    }

    .box-slide-banner swiper-slide {
        width: 100%;
        height: auto;
    }
}
</style>
