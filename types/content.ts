// Tipos para Contenidos y Páginas (GET /api/v2/platforms/{slug}/contents)

export interface SocialImageResource {
  url: string
  width: number
  height: number
  type: string
  alt: string
  thumbnails?: {
    micro?: string
    small?: string
    medium?: string
    large?: string
  }
}

export interface ContentTypeCompact {
  id: number
  slug: string
  name: string
  plural_name?: string
}

export interface ContentStatusCompact {
  id: number
  slug: string
  name: string
}

export interface ContentVisibility {
  home: boolean
  menu: boolean
  footer: boolean
  sidebar: boolean
  search: boolean
  archive: boolean
  rss: boolean
  sitemap: boolean
  sitemap_news: boolean
}

export interface ContentResource {
  id: number
  title: string
  slug: string
  excerpt: string | null
  type: ContentTypeCompact
  status: ContentStatusCompact
  is_featured: boolean
  image: SocialImageResource | null
  seo_title: string
  seo_description: string
  platform: {
    id: number
    slug: string
    title: string
  }
  visibility: ContentVisibility
  comments?: {
    enabled: boolean
    anonymous: boolean
  }
  copyright_valid: boolean | null
  pages_count: number
  views_count: number
  published_at: string
  created_at: string
  updated_at: string
}

export interface ContentPageSummary {
  id: number
  order: number
  title: string
  slug: string
  format: 'editorjs' | 'markdown' | 'html'
}

export interface ContentPageResource extends ContentPageSummary {
  content_id: number
  source_format: string
  body: string | Record<string, unknown>
  current_page_raw_id?: number | null
  created_at: string
  updated_at: string
}

export interface ContentSeoResource {
  description: string
  keywords: string
  robots: string
  revisit_after: string
  distribution: string
  og_title: string
  og_type: string
  twitter_card: string
  twitter_creator: string
  image?: SocialImageResource | null
  image_alt?: string | null
}

export interface ContentTaxonomiesResource {
  categories: Array<{
    id: number
    slug: string
    name: string
    color: string | null
    icon: string | null
    is_main: boolean
  }>
  subcategories: Array<{
    id: number
    slug: string
    name: string
    color: string | null
    icon: string | null
    is_main: boolean
    parent: string
  }>
  tags: Array<{
    id: number
    slug: string
    name: string
    color: string | null
  }>
}

export interface ContentDetailResource extends ContentResource {
  pages: ContentPageSummary[]
  first_page: ContentPageResource | null
  seo?: ContentSeoResource | null
  taxonomies?: ContentTaxonomiesResource | null
  technologies?: Array<{
    id: number
    slug: string
    name: string
    color: string
    image: string | null
  }>
  related?: ContentResource[]
}


export type ContentFormatType = 'editorjs' | 'markdown' | 'html'

export interface GetContentBySlugOptions {
  include?: string
  format?: ContentFormatType
}

export interface GetContentPageOptions {
  format?: ContentFormatType
}
