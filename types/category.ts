// Tipos para Categorías y Subcategorías (GET /api/v2/platforms/{slug}/categories)

export interface SubcategoryResource {
  slug: string
  name: string
  description?: string
  icon?: string | null
  color?: string | null
  urlImageMicro?: string | null
  urlImageSmall?: string | null
  contents_count: number
  parent: string // Slug de la raíz
}

export interface CategoryResource {
  slug: string
  name: string
  description?: string
  icon?: string | null
  color?: string | null
  urlImageMicro?: string | null
  urlImageSmall?: string | null
  contents_count: number
  subcategories: SubcategoryResource[]
}
