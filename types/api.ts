// Contratos y Envelope estándar de API V2 (App\Traits\ApiResponseTrait)

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors?: Record<string, string[]>
}

export interface PaginationMeta {
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number | null
  to: number | null
}

export interface ApiPaginatedResponse<T> {
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
  featured?: 0 | 1
  from?: string
  to?: string
}
