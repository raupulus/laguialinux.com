import { ref } from 'vue';
import type { ContentType } from '@/types/ContentType';

/**
 * Composable para obtener contenido relacionado
 * Este composable proporciona datos para los componentes RelatedContent y RelatedContentSlider
 * En el futuro, esto se conectará a la API para obtener datos reales basados en el contenido actual
 */
export function useFetchContentRelated(contentSlug: string = '', contentType: string = 'all', limit: number = 4) {
  const loading = ref(true);
  const error = ref<string | null>(null);
  const relatedContent = ref<ContentType[]>([]);

  // Ejemplos estáticos de contenido relacionado
  const staticExamples: ContentType[] = [
    {
      title: 'Cómo configurar un firewall con UFW en Ubuntu',
      slug: 'configurar-firewall-ufw-ubuntu',
      excerpt: 'Aprende a proteger tu servidor Ubuntu configurando UFW (Uncomplicated Firewall)',
      urlImageMedium: '/images/content/ufw-ubuntu.webp',
      urlImage: '/images/content/ufw-ubuntu.webp',
      created_at_human: 'hace 1 semana',
      path: 'guides/security/configurar-firewall-ufw-ubuntu'
    },
    {
      title: 'Guía de comandos básicos de Docker',
      slug: 'guia-comandos-basicos-docker',
      excerpt: 'Los comandos esenciales que todo usuario de Docker debe conocer',
      urlImageMedium: '/images/content/docker-commands.webp',
      urlImage: '/images/content/docker-commands.webp',
      created_at_human: 'hace 3 semanas',
      path: 'guides/docker/guia-comandos-basicos-docker'
    },
    {
      title: 'Cómo crear y gestionar volúmenes en Docker',
      slug: 'crear-gestionar-volumenes-docker',
      excerpt: 'Todo lo que necesitas saber sobre volúmenes en Docker',
      urlImageMedium: '/images/content/docker-volumes.webp',
      urlImage: '/images/content/docker-volumes.webp',
      created_at_human: 'hace 1 mes',
      path: 'guides/docker/crear-gestionar-volumenes-docker'
    },
    {
      title: 'Docker Compose: Creando entornos multi-contenedor',
      slug: 'docker-compose-entornos-multi-contenedor',
      excerpt: 'Aprende a usar Docker Compose para orquestar múltiples contenedores',
      urlImageMedium: '/images/content/docker-compose.webp',
      urlImage: '/images/content/docker-compose.webp',
      created_at_human: 'hace 2 meses',
      path: 'guides/docker/docker-compose-entornos-multi-contenedor'
    }
  ];

  // Función para cargar el contenido relacionado
  const fetchRelatedContent = async () => {
    loading.value = true;
    error.value = null;

    try {
      // Simulación de carga de datos
      await new Promise(resolve => setTimeout(resolve, 500));

      // En el futuro, esto sería una llamada a la API
      // const config = useRuntimeConfig();
      // const API_BASE = config.public.api.base;
      // const response = await fetch(`${API_BASE}/content/related?slug=${contentSlug}&type=${contentType}&limit=${limit}`);
      // if (!response.ok) throw new Error('Error al cargar el contenido relacionado');
      // const data = await response.json();
      // relatedContent.value = data.contents;

      // Por ahora, usamos ejemplos estáticos
      relatedContent.value = staticExamples.slice(0, limit);
    } catch (err) {
      console.error('Error al cargar el contenido relacionado:', err);
      error.value = 'No se pudo cargar el contenido relacionado';
    } finally {
      loading.value = false;
    }
  };

  // Cargar datos al inicializar el composable
  fetchRelatedContent();

  // Funciones exportadas para los componentes
  const useRelatedContent = (contentSlug: string = '', contentType: string = 'all', limit: number = 4) => {
    return {
      relatedContent,
      loading,
      error,
      refresh: fetchRelatedContent
    };
  };

  const useRelatedContentSlider = (contentSlug: string = '', contentType: string = 'all', limit: number = 4) => {
    return {
      sliderContent: relatedContent,
      loading,
      error,
      refresh: fetchRelatedContent
    };
  };

  // Devolver ambas funciones para que puedan ser usadas por los componentes
  return {
    useRelatedContent,
    useRelatedContentSlider,
    // También devolvemos los datos directamente para uso general
    relatedContent,
    loading,
    error,
    refresh: fetchRelatedContent
  };
}
