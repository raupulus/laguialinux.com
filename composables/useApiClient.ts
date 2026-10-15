import type {
  ApiClientRequestOptions,
  ApiPaginatedResponse,
  ApiResponse,
  CategoryResource,
  CollectionQueryParams,
  ContactMessagePayload,
  ContentDetailResource,
  ContentPageResource,
  ContentResource,
  ETagCacheEntry,
  GetContentBySlugOptions,
  GetContentPageOptions,
  NewsletterSubscriptionPayload,
  NormalizedApiError,
  PlatformResource,
  TagResource,
} from '~/types'

const DEFAULT_TTL_MS = 60_000 // 60s TTL
const STORAGE_PREFIX = 'lgl_etag_'

/**
 * Clase de Error de API tipada y compatible con Error estándar
 */
export class ApiError extends Error implements NormalizedApiError {
  status: number
  errors: Record<string, string[]>
  isNetworkError: boolean
  isRateLimited: boolean
  retryAfterSeconds?: number
  raw?: any

  constructor(payload: NormalizedApiError) {
    super(payload.message)
    this.name = 'NormalizedApiError'
    this.status = payload.status
    this.errors = payload.errors
    this.isNetworkError = payload.isNetworkError
    this.isRateLimited = payload.isRateLimited
    this.retryAfterSeconds = payload.retryAfterSeconds
    this.raw = payload.raw
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

/**
 * Parsea el valor de la cabecera Retry-After (segundos enteros o HTTP-Date)
 */
export function parseRetryAfter(headerValue: string | null | undefined): number | undefined {
  if (!headerValue) return undefined
  const seconds = parseInt(headerValue, 10)
  if (!isNaN(seconds) && seconds >= 0) {
    return seconds
  }
  const targetDate = Date.parse(headerValue)
  if (!isNaN(targetDate)) {
    const diffSeconds = Math.ceil((targetDate - Date.now()) / 1000)
    return diffSeconds > 0 ? diffSeconds : 0
  }
  return undefined
}

/**
 * Normaliza cualquier excepción o fallo HTTP en NormalizedApiError
 */
export function normalizeError(err: any): ApiError {
  if (err instanceof ApiError) return err
  if (err && typeof err === 'object' && err.isNetworkError !== undefined && err.status !== undefined) {
    return new ApiError(err)
  }

  const status = Number(err.statusCode || err.status || err.response?.status || 0)
  const isNetwork = !status ||
    err.message?.includes('fetch failed') ||
    err.message?.includes('NetworkError') ||
    err.message?.includes('Failed to fetch') ||
    (err.name === 'FetchError' && !status) ||
    err.code === 'ENOTFOUND' ||
    err.code === 'ECONNREFUSED'

  const responseData = err.data || err.response?._data || {}
  const rawHeaders = err.response?.headers || err.headers
  const retryHeader = typeof rawHeaders?.get === 'function'
    ? rawHeaders.get('retry-after')
    : rawHeaders?.['retry-after']

  const retryAfterSeconds = parseRetryAfter(retryHeader)
  const isRateLimited = status === 429

  const errors: Record<string, string[]> = {}
  if (responseData.errors && typeof responseData.errors === 'object') {
    for (const [key, val] of Object.entries(responseData.errors)) {
      if (Array.isArray(val)) {
        errors[key] = val.map(String)
      } else if (typeof val === 'string') {
        errors[key] = [val]
      }
    }
  }

  let message = responseData.message || ''
  if (!message) {
    if (isNetwork) {
      message = 'No se pudo conectar con el servidor. Revisa tu conexión a internet.'
    } else if (isRateLimited) {
      message = 'Demasiadas peticiones. Por favor, inténtelo de nuevo más tarde.'
    } else if (status === 404) {
      message = 'Recurso no encontrado.'
    } else if (status === 422) {
      message = 'Los datos proporcionados no son válidos.'
    } else if (status >= 500) {
      message = 'Error interno del servidor.'
    } else {
      message = err.message || 'Error de comunicación con la API.'
    }
  }

  return new ApiError({
    status: isNetwork ? 0 : status,
    message,
    errors,
    isNetworkError: isNetwork,
    isRateLimited,
    retryAfterSeconds,
    raw: err,
  })
}

/**
 * Genera una clave de caché canónica ordenando parámetros alfabéticamente
 */
export function buildCacheKey(method: string, url: string, params?: Record<string, any>): string {
  const cleanMethod = (method || 'GET').toUpperCase()
  if (!params || Object.keys(params).length === 0) {
    return `${cleanMethod}:${url}`
  }
  const searchParams = new URLSearchParams()
  const sortedKeys = Object.keys(params).sort()
  for (const key of sortedKeys) {
    const val = params[key]
    if (val !== undefined && val !== null && val !== '') {
      if (Array.isArray(val)) {
        val.forEach(item => searchParams.append(key, String(item)))
      } else {
        searchParams.append(key, String(val))
      }
    }
  }
  const queryString = searchParams.toString()
  return queryString ? `${cleanMethod}:${url}?${queryString}` : `${cleanMethod}:${url}`
}

/**
 * Lectura segura de sessionStorage en cliente
 */
function readSessionStorage<T>(key: string): ETagCacheEntry<T> | null {
  if (!import.meta.client) return null
  try {
    const item = sessionStorage.getItem(STORAGE_PREFIX + key)
    if (!item) return null
    const parsed = JSON.parse(item) as ETagCacheEntry<T>
    if (!parsed || typeof parsed !== 'object' || !parsed.etag) {
      sessionStorage.removeItem(STORAGE_PREFIX + key)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

/**
 * Escritura segura en sessionStorage con protección QuotaExceededError
 */
function writeSessionStorage<T>(key: string, entry: ETagCacheEntry<T>): void {
  if (!import.meta.client) return
  const fullKey = STORAGE_PREFIX + key
  const serialized = JSON.stringify(entry)

  try {
    sessionStorage.setItem(fullKey, serialized)
  } catch (err: any) {
    const isQuotaError =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.code === 1014

    if (isQuotaError) {
      try {
        const entries: { k: string; timestamp: number }[] = []
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i)
          if (k && k.startsWith(STORAGE_PREFIX)) {
            try {
              const val = sessionStorage.getItem(k)
              const p = val ? JSON.parse(val) : null
              entries.push({ k, timestamp: p?.timestamp || 0 })
            } catch {
              entries.push({ k, timestamp: 0 })
            }
          }
        }

        entries.sort((a, b) => a.timestamp - b.timestamp)
        const toDeleteCount = Math.max(1, Math.ceil(entries.length / 2))
        for (let i = 0; i < toDeleteCount && i < entries.length; i++) {
          sessionStorage.removeItem(entries[i].k)
        }

        sessionStorage.setItem(fullKey, serialized)
      } catch {
        console.warn(`[useApiClient] sessionStorage quota exceeded. Persisting in memory cache only.`)
      }
    }
  }
}

/**
 * Cliente HTTP completo para la API REST V2 de La Guía Linux
 * Cumple MOD-00 con motor ETag 304 SWR, tipado estricto y multi-tenant automático
 */
export const useApiClient = () => {
  const { platform } = usePlatform()
  const baseUrl = computed(() => platform.value.apiBaseUrl || 'http://localhost:8000/api/v2')
  const platformSlug = computed(() => platform.value.slug)

  // Memoria reactiva aislada para SSR y sincronizada con el cliente
  const memoryCache = useState<Record<string, ETagCacheEntry<any>>>('lgl_api_etag_cache', () => ({}))

  const getCacheEntry = <T>(key: string): ETagCacheEntry<T> | null => {
    if (memoryCache.value[key]) {
      return memoryCache.value[key] as ETagCacheEntry<T>
    }
    const fromStorage = readSessionStorage<T>(key)
    if (fromStorage) {
      memoryCache.value[key] = fromStorage
      return fromStorage
    }
    return null
  }

  const setCacheEntry = <T>(key: string, entry: ETagCacheEntry<T>): void => {
    memoryCache.value[key] = entry
    writeSessionStorage(key, entry)
  }

  /**
   * Petición HTTP base con soporte para ETag, 304, envelope unpacking y errores
   */
  const request = async <T = any>(
    endpoint: string,
    options: ApiClientRequestOptions = {}
  ): Promise<ApiResponse<T>> => {
    const method = (options.method || 'GET').toUpperCase() as ApiClientRequestOptions['method']
    const isGet = method === 'GET'
    const fullUrl = endpoint.startsWith('http')
      ? endpoint
      : `${baseUrl.value}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

    const query = options.query || options.params
    const cacheKey = buildCacheKey(method || 'GET', fullUrl, query)
    const ttl = options.cacheTtlMs !== undefined ? options.cacheTtlMs : DEFAULT_TTL_MS

    // Buscar entrada previa si aplica
    const cachedEntry = isGet && !options.skipCache ? getCacheEntry<T>(cacheKey) : null

    // Preparar cabeceras
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.headers || {}),
    }

    if (method !== 'GET' && options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    // Si existe ETag previo para GET, inyectar If-None-Match
    if (isGet && cachedEntry?.etag && !options.skipCache) {
      headers['If-None-Match'] = cachedEntry.etag
    }

    try {
      const response = await $fetch.raw<ApiResponse<T>>(fullUrl, {
        method,
        query,
        headers,
        body: options.body,
        signal: options.signal,
        ignoreResponseError: true,
      })

      // 1. Manejo transparente de HTTP 304 Not Modified
      if (response.status === 304) {
        if (cachedEntry) {
          cachedEntry.timestamp = Date.now()
          setCacheEntry(cacheKey, cachedEntry)
          return cachedEntry.data
        }
        return {
          success: true,
          message: 'Sin modificaciones',
          data: null as unknown as T,
        }
      }

      // 2. Manejo de HTTP 204 No Content
      if (response.status === 204) {
        return {
          success: true,
          message: 'Operación completada',
          data: null as unknown as T,
        }
      }

      // 3. Manejo de respuestas 2xx
      if (response.status >= 200 && response.status < 300) {
        const body = (response._data || {}) as ApiResponse<T>
        const etag = response.headers.get('etag') || response.headers.get('ETag')

        if (isGet && etag && !options.skipCache) {
          const newEntry: ETagCacheEntry<T> = {
            etag,
            data: body,
            timestamp: Date.now(),
            ttl,
          }
          setCacheEntry(cacheKey, newEntry)
        }

        return body
      }

      // 4. Códigos de error HTTP (4xx, 5xx)
      throw normalizeError({
        statusCode: response.status,
        data: response._data,
        headers: response.headers,
      })
    } catch (err: any) {
      // Salvaguarda: si de alguna forma $fetch lanzó una excepción con 304
      const status = Number(err.statusCode || err.status || err.response?.status || 0)
      if (status === 304 && cachedEntry) {
        cachedEntry.timestamp = Date.now()
        setCacheEntry(cacheKey, cachedEntry)
        return cachedEntry.data
      }

      throw normalizeError(err)
    }
  }

  // =========================================================================
  // Métodos de Endpoints de Negocio
  // =========================================================================

  /**
   * Obtiene la ficha de la plataforma activa
   */
  const getPlatformInfo = (options?: ApiClientRequestOptions): Promise<ApiResponse<PlatformResource>> => {
    return request<PlatformResource>(`/platforms/${platformSlug.value}`, options)
  }

  /**
   * Obtiene el árbol completo de categorías y subcategorías
   */
  const getCategories = (options?: ApiClientRequestOptions): Promise<ApiResponse<CategoryResource[]>> => {
    return request<CategoryResource[]>(`/platforms/${platformSlug.value}/categories`, options)
  }

  /**
   * Obtiene las etiquetas de la plataforma
   */
  const getTags = (options?: ApiClientRequestOptions): Promise<ApiResponse<TagResource[]>> => {
    return request<TagResource[]>(`/platforms/${platformSlug.value}/tags`, options)
  }

  /**
   * Lista contenidos con filtros y paginación
   */
  const getContents = (
    params?: CollectionQueryParams,
    options?: ApiClientRequestOptions
  ): Promise<ApiPaginatedResponse<ContentResource>> => {
    return request<ContentResource[]>(`/platforms/${platformSlug.value}/contents`, {
      ...options,
      query: { ...(options?.query || {}), ...(params || {}) },
    }) as Promise<ApiPaginatedResponse<ContentResource>>
  }

  /**
   * Obtiene el detalle de un contenido por su slug
   */
  const getContentBySlug = (
    slug: string,
    opts?: GetContentBySlugOptions,
    options?: ApiClientRequestOptions
  ): Promise<ApiResponse<ContentDetailResource>> => {
    const queryParams = {
      include: opts?.include ?? 'seo,taxonomies',
      ...(opts?.format ? { format: opts.format } : {}),
      ...(options?.query || {}),
    }
    return request<ContentDetailResource>(`/platforms/${platformSlug.value}/contents/${slug}`, {
      ...options,
      query: queryParams,
    })
  }

  /**
   * Obtiene una página específica de un contenido (por orden numérico o por slug)
   */
  const getContentPage = (
    slug: string,
    pageOrderOrSlug: number | string,
    opts?: GetContentPageOptions,
    options?: ApiClientRequestOptions
  ): Promise<ApiResponse<ContentPageResource>> => {
    const isNumeric = typeof pageOrderOrSlug === 'number' || /^\d+$/.test(String(pageOrderOrSlug).trim())
    const path = isNumeric
      ? `/platforms/${platformSlug.value}/contents/${slug}/pages/${pageOrderOrSlug}`
      : `/platforms/${platformSlug.value}/contents/${slug}/pages/slug/${pageOrderOrSlug}`

    const queryParams = {
      ...(opts?.format ? { format: opts.format } : {}),
      ...(options?.query || {}),
    }

    return request<ContentPageResource>(path, {
      ...options,
      query: queryParams,
    })
  }

  /**
   * Envía un mensaje de contacto (5 peticiones/hora por IP)
   */
  const postContact = (
    payload: ContactMessagePayload,
    options?: ApiClientRequestOptions
  ): Promise<ApiResponse<null>> => {
    return request<null>('/contact-messages', {
      ...options,
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Suscribe una dirección a la newsletter de la plataforma activa
   */
  const postNewsletterSubscription = (
    payload: NewsletterSubscriptionPayload,
    options?: ApiClientRequestOptions
  ): Promise<ApiResponse<null>> => {
    const resolvedPlatformId = payload.platform_id ?? (platformSlug.value === 'news' ? 2 : 1)
    return request<null>('/newsletter/subscriptions', {
      ...options,
      method: 'POST',
      body: {
        ...payload,
        platform_id: resolvedPlatformId,
      },
    })
  }

  /**
   * Confirma una suscripción mediante su token de verificación
   */
  const confirmNewsletter = (
    token: string,
    options?: ApiClientRequestOptions
  ): Promise<ApiResponse<null>> => {
    return request<null>(`/newsletter/subscriptions/${token}/confirmation`, {
      ...options,
      method: 'POST',
    })
  }

  /**
   * Cancela una suscripción mediante su token de baja
   */
  const unsubscribeNewsletter = (
    token: string,
    options?: ApiClientRequestOptions
  ): Promise<ApiResponse<null>> => {
    return request<null>(`/newsletter/subscriptions/${token}`, {
      ...options,
      method: 'DELETE',
    })
  }

  /**
   * Limpia entradas de la caché SWR (opcionalmente filtrando por prefijo de URL)
   */
  const clearCache = (prefix?: string): void => {
    if (prefix) {
      for (const key of Object.keys(memoryCache.value)) {
        if (key.includes(prefix)) {
          delete memoryCache.value[key]
        }
      }
      if (import.meta.client) {
        try {
          for (let i = sessionStorage.length - 1; i >= 0; i--) {
            const k = sessionStorage.key(i)
            if (k && k.startsWith(STORAGE_PREFIX) && k.includes(prefix)) {
              sessionStorage.removeItem(k)
            }
          }
        } catch {}
      }
    } else {
      memoryCache.value = {}
      if (import.meta.client) {
        try {
          for (let i = sessionStorage.length - 1; i >= 0; i--) {
            const k = sessionStorage.key(i)
            if (k && k.startsWith(STORAGE_PREFIX)) {
              sessionStorage.removeItem(k)
            }
          }
        } catch {}
      }
    }
  }

  return {
    baseUrl,
    platformSlug,
    request,
    getPlatformInfo,
    getCategories,
    getTags,
    getContents,
    getContentBySlug,
    getContentPage,
    postContact,
    postNewsletterSubscription,
    confirmNewsletter,
    unsubscribeNewsletter,
    clearCache,
  }
}
