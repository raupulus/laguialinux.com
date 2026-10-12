import { ref } from 'vue';
import type { ContentType } from '@/types/ContentType';
import type { ContentRelatedResponse, ContentRelatedItem } from '@/types/ContentRelatedType';
import { prepareContentData } from '@/utils/ContentUtils';

const PLATFORM: string = 'laguialinux';

/**
 * Composable para obtener contenido relacionado
 * Este composable proporciona datos para los componentes RelatedContent y RelatedContentSlider
 */
export function useFetchContentRelated(contentSlug: string = '', contentType: string = 'all', limit: number = 4) {
  const loading = ref(true);
  const error = ref<string | null>(null);
  const relatedContent = ref<ContentType[]>([]);

  // Función para cargar el contenido relacionado
  const fetchRelatedContent = async () => {
    loading.value = true;
    error.value = null;

    // Verificar si contentSlug está vacío
    if (!contentSlug) {
      error.value = 'No se ha especificado un contenido para buscar relacionados';
      loading.value = false;
      return;
    }

    try {
      const isClient = process.client;
      let API_BASE: string = '';

      if (isClient) {
        const config = useRuntimeConfig();
        API_BASE = config.public.api.base;

        const response = await fetch(`${API_BASE}/content/${contentSlug}/get/related`);

        if (!response.ok) throw new Error('Error al cargar el contenido relacionado');

        const data = await response.json() as ContentRelatedResponse;

        if (data.status === 'ok' && data.related) {
          // Transformar los datos de la API al formato esperado por el componente
          relatedContent.value = data.related.map((item: ContentRelatedItem) => {
            // Crear un objeto ContentType con los datos básicos
            const contentItem: ContentType = {
              title: item.title,
              slug: item.slug,
              type: item.type,
              excerpt: item.excerpt,
              images: {
                medium: item.images?.medium || '',
                small: item.images?.small || '',
              },
              created_at_human: formatDate(item.updated_at),
              categories: item.categories,
              subcategories: item.subcategories
            };

            // Usar prepareContentData para establecer correctamente url y path
            return prepareContentData(contentItem, item.type);
          }).slice(0, limit);
        } else {
          throw new Error('Formato de respuesta inválido');
        }
      } else {
        API_BASE = process.env.API_BASE_URL || '';

        // También verificamos en el lado del servidor
        if (!contentSlug) {
          throw new Error('No se ha especificado un contenido para buscar relacionados');
        }

        const { data: apiData, error: apiError } = await useAsyncData<ContentRelatedResponse>(`contentRelated-${contentSlug}`, () =>
          $fetch(`${API_BASE}/content/${contentSlug}/get/related`)
        );

        if (apiError.value) throw apiError.value;

        if (apiData.value && apiData.value.status === 'ok' && apiData.value.related) {
          // Transformar los datos de la API al formato esperado por el componente
          relatedContent.value = apiData.value.related.map((item: ContentRelatedItem) => {
            // Crear un objeto ContentType con los datos básicos
            const contentItem: ContentType = {
              title: item.title,
              slug: item.slug,
              type: item.type,
              excerpt: item.excerpt,
              images: {
                medium: item.images?.medium || '',
                small: item.images?.small || '',
              },
              created_at_human: formatDate(item.updated_at),
              categories: item.categories,
              subcategories: item.subcategories
            };

            // Usar prepareContentData para establecer correctamente url y path
            return prepareContentData(contentItem, item.type);
          }).slice(0, limit);
        } else {
          throw new Error('Formato de respuesta inválido');
        }
      }
    } catch (err) {
      console.error('Error al cargar el contenido relacionado:', err);
      error.value = 'No se pudo cargar el contenido relacionado';
    } finally {
      loading.value = false;
    }
  };

  // Función auxiliar para formatear la fecha
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 7) {
        return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
      } else {
        const years = Math.floor(diffDays / 365);
        return `hace ${years} ${years === 1 ? 'año' : 'años'}`;
      }
    } catch (e) {
      console.error('Error al formatear la fecha:', e);
      return dateString;
    }
  };

  // Funciones exportadas para los componentes
  const useRelatedContent = (newContentSlug: string = '', newContentType: string = 'all', newLimit: number = 5) => {
    // Actualizar los parámetros si son diferentes
    if (newContentSlug !== contentSlug || newContentType !== contentType || newLimit !== limit) {
      contentSlug = newContentSlug;
      contentType = newContentType;
      limit = newLimit;
      // Cargar datos con los nuevos parámetros
      fetchRelatedContent();
    } else if (relatedContent.value.length === 0 && !loading.value) {
      // Si no hay datos y no está cargando, iniciar la carga
      fetchRelatedContent();
    }

    return {
      relatedContent,
      loading,
      error,
      refresh: fetchRelatedContent
    };
  };

  const useRelatedContentSlider = (newContentSlug: string = '', newContentType: string = 'all', newLimit: number = 4) => {
    // Actualizar los parámetros si son diferentes
    if (newContentSlug !== contentSlug || newContentType !== contentType || newLimit !== limit) {
      contentSlug = newContentSlug;
      contentType = newContentType;
      limit = newLimit;
      // Cargar datos con los nuevos parámetros
      fetchRelatedContent();
    } else if (relatedContent.value.length === 0 && !loading.value) {
      // Si no hay datos y no está cargando, iniciar la carga
      fetchRelatedContent();
    }

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