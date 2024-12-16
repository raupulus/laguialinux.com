<template>
  <div class="box-slide-blog">
    <ClientOnly>
      <swiper-container ref="containerRef" :init="false" :lazy="true">
        <swiper-slide
          v-for="(card, idx) in data":key="idx">
        <CardBlog :title="card.title" :image="card.image" :excerpt="card.excerpt"
        :url="card.url" :date="card.date" :categories="card.categories"/>
        </swiper-slide>
      </swiper-container>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Swiper from 'swiper';

const props = defineProps({
  effect: {
    type: String,
    default: 'coverflow', // creative, cube, coverflow, flip, cards, fade
  },
    data: {
        type: Array as PropType<Array<{ title: string; excerpt: string; image: string; url?: string; date?: string; categories?: Array<String>; }>>,
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
    shadow: true,
    shadowOffset: 20,
    shadowScale: 0.94,
  },
  creativeEffect: {
    prev: {
      shadow: true,
      translate: [0, 0, -400],
    },
    next: {
      shadow: true,
      translate: [0, 0, -400],
    },
  },
  coverflowEffect: {
    rotate: 50,
    stretch: 0,
    depth: 100,
    modifier: 1,
    slideShadows: true,
  },
  flipEffect: {
    slideShadows: true,
    limitRotation: true,
  },
  cardsEffect: {
    slideShadows: true,
  },
  fadeEffect: {
    crossFade: true,
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
