<template>
  <div :class="['box-slide', { 'cube-effect': effect === 'cube' }]">
    <ClientOnly>
      <swiper-container ref="containerRef" :init="false" :lazy="true">
        <swiper-slide
          v-for="(slide, idx) in slides"
          :key="idx"
          style="color: white; display: flex; justify-content: center; align-items: center; box-sizing: border-box;"
        >
          <NuxtImg v-if="slide.image" :src="slide.image" title="Imagen de pingüinos" loading="lazy" />
          <span v-if="slide.text">
            {{ slide.text }}
          </span>
        </swiper-slide>
      </swiper-container>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps({
  effect: {
    type: String,
    default: 'cube', // creative, cube, coverflow, flip, cards, fade
  },
  slides: {
    type: Array as PropType<Array<{ text?: string; image?: string }>>,
    required: true,
  },
});


const containerRef = ref(null);
//const slides = ref(Array.from({ length: 10 }));
//const effect = ref<'cube' | 'creative' | 'coverflow' | 'flip' | 'cards' | 'fade'>('cube');

const swiper = useSwiper(containerRef, {
  effect: props.effect,
  loop: true,
  grabCursor: true,
  pagination: {
    enabled: true,
    el: '.swiper-pagination',
    clickable: true,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  autoplay: {
    delay: 5000,
  },
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

/*
onMounted(() => {
  console.log(swiper.instance);
});
*/
</script>

<style lang="css">
.box-slide {
  width: 100%;
  height: 400px;
  overflow: hidden;
  position: relative;
  padding: 0;
  box-sizing: border-box;
}

/* Estilo cuando el efecto sea "cube" */
.box-slide.cube-effect swiper-container {
  padding: 70px 60px; /* Agregamos padding para dar espacio al cubo */
}

swiper-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: block; /* Aseguramos que no haya desbordes horizontales */
  box-sizing: border-box;
}

swiper-slide {
  width: 100% !important; /* Asegura que el slide no exceda el 100% del contenedor */
  height: 100%;
  text-align: center;
  font-size: 18px;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 0;
  box-sizing: border-box; /* Asegura que el padding no se salga del contenedor */
}

swiper-slide img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .box-slide {
    height: 500px;
  }

  .box-slide.cube-effect swiper-container {
    padding: 50px 0; /* Agregamos padding para dar espacio al cubo */
  }

  swiper-container {
    width: 100%;
    height: 100%;
  }

  swiper-slide {
    font-size: 16px;
  }
}
</style>
