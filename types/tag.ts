// Tipos para Etiquetas (GET /api/v2/platforms/{slug}/tags)

export interface TagResource {
  id: number
  slug: string
  name: string
  color: string
  contents_count: number
}
