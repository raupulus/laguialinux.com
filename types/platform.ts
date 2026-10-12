// Tipos para Plataformas (GET /api/v2/platforms/{slug}) y Configuración Frontend

export interface PlatformConfig {
  slug: string
  domain: string
  name: string
  tagline: string
  apiBaseUrl: string
  themeAccent: 'emerald' | 'orange' | 'blue' | string
  features: {
    tools: boolean
    cveAlerts: boolean
    kernelWatcher: boolean
  }
}

export interface PlatformAuthorSocial {
  slug: string
  name: string
  color: string
  nick: string
  url: string
  url_image?: string
}

export interface PlatformAuthor {
  name: string
  nick: string
  image: string | null
  url_image_micro: string | null
  url_image_small: string | null
  profession: string | null
  web: string | null
  social_networks: PlatformAuthorSocial[]
}

export interface PlatformContentTypeCount {
  id: number
  slug: string
  name: string
  plural_name: string
  description?: string
  total: number
}

export interface PlatformResource {
  id: number
  name: string
  title: string
  slug: string
  description: string
  domain: string
  url_about: string | null
  image?: {
    url: string
    width: number
    height: number
    type: string
    alt: string
    thumbnails: Record<string, string>
  } | null
  social_networks?: {
    youtube_channel_id?: string | null
    youtube_presentation_video_id?: string | null
    twitter?: string | null
    mastodon?: string | null
    twitch?: string | null
    tiktok?: string | null
    instagram?: string | null
  }
  author?: PlatformAuthor
  technologies?: Array<{
    id: number
    slug: string
    name: string
    color: string
    image: string | null
  }>
  contents?: {
    total: number
    types: PlatformContentTypeCount[]
  }
  pages?: Array<{
    id: number
    title: string
    slug: string
    excerpt?: string | null
  }>
  created_at: string
}
