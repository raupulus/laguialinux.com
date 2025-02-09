<template>
    <div class="box-slide-blog">
        <ClientOnly>
            <swiper-container ref="containerRef" :init="false" :lazy="true">
                <swiper-slide v-for="(card, idx) in data" :key="idx">
                    <CardBlog :title="card.title"
                        :image="card.has_image ? card.urlImageMedium : '/images/banners/placeholder.webp'"
                        :excerpt="card.excerpt" :section="section" :url="card.url" :date="card.updated_at"
                        :categories="card.categories" />
                </swiper-slide>
            </swiper-container>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import type { ContentType } from '~/types/ContentType';

const props = defineProps({
    effect: {
        type: String,
        default: 'coverflow', // creative, cube, coverflow, flip, cards, fade
    },
    section: {
        type: String,
        required: true,
    },
    data: {
        type: Array as PropType<ContentType[]>,
    }
});


const containerRef = ref(null);

const swiper = useSwiper(containerRef, {
    effect: props.effect,
    loop: true,
    slidesPerView: 3,
    spaceBetween: 10,
    grabCursor: true,
    breakpoints: {
        320: {
            slidesPerView: 1,
            spaceBetween: 5,
        },
        587: {
            slidesPerView: 2,
            spaceBetween: 10,
        },
        1024: {
            slidesPerView: 3,
            spaceBetween: 10,
        },
    },
    pagination: {
        enabled: true,
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    autoplay: false,
    keyboard: {
        enabled: true,
        onlyInViewport: true,
    },
    cubeEffect: {
        slideShadows: true,
        shadow: false,
        shadowOffset: 20,
        shadowScale: 0.94,
    },
    creativeEffect: {
        prev: {
            shadow: false,
            translate: [0, 0, -400],
        },
        next: {
            shadow: false,
            translate: [0, 0, -400],
        },
    },
    coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: false,
    },
    flipEffect: {
        slideShadows: false,
        limitRotation: true,
    },
    cardsEffect: {
        slideShadows: false,
    },
    fadeEffect: {
        crossFade: false,
    },
});
</script>

<style lang="css" scoped>
.box-slide-blog {
    position: relative;
    padding: 0;
    width: 100%;
    box-sizing: border-box;
}

.box-slide-blog .swiper-coverflow {
    overflow: visible !important;
}

.box-slide-blog swiper-container {
    box-sizing: border-box;
}

.box-slide-blog swiper-slide {
    padding: 20px 0;
    box-sizing: border-box;
}
</style>
