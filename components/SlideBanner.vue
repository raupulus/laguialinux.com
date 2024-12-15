<template>
  <div class="box-slide-banner">
    <ClientOnly>
      <swiper-container ref="containerRefBanner" :init="false" :lazy="true">
        <swiper-slide v-for="(banner, idx) in banners" :key="idx">
            <Banner :title="banner.title" :description="banner.excerpt" :url="banner.url" :image="banner.image" />
        </swiper-slide>
      </swiper-container>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps({
  banners: {
    type: Array as PropType<Array<{ title: string; excerpt: string; image: string; url?: string }>>,
    required: true,
  },
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
    enabled: true,
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

/*
onMounted(() => {
  console.log(swiper.instance);
});
*/
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
  overflow: hidden;  /* Esto asegura que el contenedor no se desborde */
}

.box-slide-banner swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 8px 0 0 0;
  width: 100% !important;  /* El slide debe ocupar todo el espacio disponible */
  height: auto !important; /* El alto se ajusta automáticamente */
  text-align: center;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .box-slide-banner swiper-container {
    width: 100%;
    height: auto; /* Ajustamos la altura del swiper container */
  }

  .box-slide-banner swiper-slide {
    width: 100%;
    height: auto;
  }
}

</style>
