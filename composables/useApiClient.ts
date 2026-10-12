import type {
  ApiResponse,
  ApiPaginatedResponse,
  CategoryResource,
  CollectionQueryParams,
  ContentDetailResource,
  ContentResource,
  PlatformResource,
  TagResource,
} from '~/types'

/**
 * Cliente HTTP para consumir la API V2 de Laravel
 * Soporta SSR, caché ETag, tipado TypeScript estricto y multi-tenant automático
 */
export const useApiClient = () => {
  const { platform } = usePlatform()
  const baseUrl = computed(() => platform.value.apiBaseUrl)

  /**
   * Obtiene la ficha completa de la plataforma activa
   */
  const getPlatformInfo = () => {
    return useFetch<ApiResponse<PlatformResource>>(
      () => `${baseUrl.value}/platforms/${platform.value.slug}`,
      { key: `platform-${platform.value.slug}` }
    )
  }

  /**
   * Obtiene el menú de categorías con sus subcategorías anidadas
   */
  const getCategories = () => {
    return useFetch<ApiResponse<CategoryResource[]>>(
      () => `${baseUrl.value}/platforms/${platform.value.slug}/categories`,
      { key: `categories-${platform.value.slug}` }
    )
  }

  /**
   * Obtiene el listado de etiquetas de la plataforma
   */
  const getTags = () => {
    return useFetch<ApiResponse<TagResource[]>>(
      () => `${baseUrl.value}/platforms/${platform.value.slug}/tags`,
      { key: `tags-${platform.value.slug}` }
    )
  }

  /**
   * Lista de contenidos publicados con filtros y paginación
   */
  const getContents = (query: MaybeRef<CollectionQueryParams> = {}) => {
    return useFetch<ApiPaginatedResponse<ContentResource>>(
      () => `${baseUrl.value}/platforms/${platform.value.slug}/contents`,
      {
        query,
        watch: [() => toValue(query)],
      }
    )
  }

  /**
   * Detalle de un contenido por su slug
   */
  const getContentBySlug = (
    slug: MaybeRef<string>,
    options: { include?: string; format?: 'markdown' | 'editorjs' | 'html' } = { include: 'seo,taxonomies' }
  ) => {
    return useFetch<ApiResponse<ContentDetailResource>>(
      () => `${baseUrl.value}/platforms/${platform.value.slug}/contents/${toValue(slug)}`,
      {
        query: options,
        key: () => `content-${platform.value.slug}-${toValue(slug)}`,
      }
    )
  }

  return {
    baseUrl,
    getPlatformInfo,
    getCategories,
    getTags,
    getContents,
    getContentBySlug,
  }
}
