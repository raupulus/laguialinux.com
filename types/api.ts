// Contratos y Envelope estándar de API V2 (App\Traits\ApiResponseTrait)

export interface PaginationMeta {
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number | null
  to: number | null
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  meta?: PaginationMeta
  errors?: Record<string, string[]>
}

export interface ApiPaginatedResponse<T = any> {
  success: boolean
  message: string
  data: T[]
  meta: PaginationMeta
  errors?: Record<string, string[]>
}

export interface CollectionQueryParams {
  page?: number
  per_page?: number
  sort?: string
  q?: string
  type?: string
  category?: string
  tag?: string
  technology?: string
  featured?: 0 | 1 | boolean
  from?: string
  to?: string
  limit?: number
  [key: string]: any
}

export interface NormalizedApiError {
  status: number
  message: string
  errors: Record<string, string[]>
  isNetworkError: boolean
  isRateLimited: boolean
  retryAfterSeconds?: number
  raw?: any
}

export interface ETagCacheEntry<T = any> {
  etag: string
  data: ApiResponse<T>
  timestamp: number
  ttl?: number
}

export interface ApiClientRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  params?: Record<string, any>
  query?: Record<string, any>
  headers?: Record<string, string>
  body?: any
  cacheTtlMs?: number // TTL en ms (default: 60_000 ms = 60s)
  skipCache?: boolean // Forzar consulta limpia ignorando ETag y caché
  revalidate?: boolean // Forzar envío de petición condicional
  signal?: AbortSignal
}

export interface ContactMessagePayload {
  name: string
  email: string
  subject: string
  message: string
  privacity?: boolean
  contactme?: boolean
  attributes?: Record<string, string | null>
  'cf-turnstile-response'?: string
  turnstile_token?: string
  'g-recaptcha-response'?: string
  recaptcha_token?: string
}

export interface NewsletterSubscriptionPayload {
  email: string
  name?: string | null
  platform_id?: number
}
