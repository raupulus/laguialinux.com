<template>
  <div class="box-advertisement" :class="[`ad-${type}`, { 'ad-placeholder': !adsenseConfigured }]">
    <!-- Google AdSense cuando está configurado -->
    <div v-if="adsenseConfigured" class="adsense-container">
      <div v-if="type === 'in-article'" class="adsense-in-article" :id="adId">
        <!-- Google AdSense In-article ad -->
      </div>

      <div v-else-if="type === 'multiplex'" class="adsense-multiplex" :id="adId">
        <!-- Google AdSense Multiplex ad -->
      </div>

      <div v-else-if="type === 'in-feed'" class="adsense-in-feed" :id="adId">
        <!-- Google AdSense In-feed ad -->
      </div>

      <div v-else-if="type === 'display'" class="adsense-display" :id="adId">
        <!-- Google AdSense Display ad -->
      </div>
    </div>

    <!-- Placeholder cuando AdSense no está configurado -->
    <div v-else class="ad-placeholder-content">
      <div class="ad-placeholder-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="none" d="M0 0h24v24H0z"/>
          <path d="M21 3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18zm-1 2H4v14h16V5zM9.399 8.399a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM9.5 15h-4a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5zm11-3.5a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2zm0 5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v2z" fill="currentColor"/>
        </svg>
      </div>
      <div class="ad-placeholder-text">
        <p>Espacio publicitario</p>
        <p class="ad-placeholder-subtext">{{ getAdTypeText() }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'in-article', // Permitido: in-article, multiplex, in-feed y display
    validator: (value: string) => ['in-article', 'multiplex', 'in-feed', 'display'].includes(value)
  },
  adId: {
    type: String,
    default: ''
  }
});

// Determinar si AdSense está configurado
const adsenseConfigured = ref(false);

// Generar un ID único para el anuncio si no se proporciona uno
const adId = computed(() => {
  return props.adId || `ad-${props.type}-${Math.random().toString(36).substring(2, 9)}`;
});

// Obtener texto descriptivo según el tipo de anuncio
const getAdTypeText = () => {
  switch (props.type) {
    case 'in-article':
      return 'Anuncio integrado en el artículo';
    case 'multiplex':
      return 'Anuncio multiplex';
    case 'in-feed':
      return 'Anuncio en el feed';
    case 'display':
      return 'Anuncio display';
    default:
      return 'Anuncio';
  }
};

// Inicializar AdSense cuando el componente se monta
onMounted(() => {
  // Aquí se inicializaría AdSense si estuviera configurado
  // Por ahora, dejamos adsenseConfigured como false

  // Ejemplo de cómo se inicializaría AdSense:
  /*
  if (window.adsbygoogle && props.adId) {
    adsenseConfigured.value = true;
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }
  */
});
</script>

<style scoped>
.box-advertisement {
  width: 100%;
  max-width: 100%;
  margin: 1rem 0;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
}

/* Estilos para los diferentes tipos de anuncios */
.ad-in-article {
  min-height: 250px;
}

.ad-multiplex {
  min-height: 280px;
}

.ad-in-feed {
  min-height: 200px;
}

.ad-display {
  min-height: 250px;
}

/* Estilos para el placeholder */
.ad-placeholder {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border: 1px dashed #8a9ab0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
}

.ad-placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #4a5568;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 1rem;
}

.ad-placeholder-icon {
  margin-bottom: 0.5rem;
}

.ad-placeholder-icon svg {
  width: 32px;
  height: 32px;
  color: #4a5568;
}

.ad-placeholder-text p {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.ad-placeholder-subtext {
  font-size: 0.8rem !important;
  opacity: 0.7;
  margin-top: 0.25rem !important;
}

/* Contenedores de AdSense */
.adsense-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.adsense-in-article, 
.adsense-multiplex, 
.adsense-in-feed, 
.adsense-display {
  width: 100%;
  height: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}
</style>
