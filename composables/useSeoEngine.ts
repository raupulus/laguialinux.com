/**
 * useSeoEngine.ts - Universal SEO & Structured JSON-LD Engine for Nuxt 4
 *
 * Módulo MOD-08: SEO, Schema JSON-LD & Granular RSS Feeds
 * Licencia de código: GNU AGPLv3
 *
 * Misión:
 * 1. Envolver useHead y useSeoMeta proporcionando metadatos dinámicos uniformes.
 * 2. Gestionar títulos con marca de plataforma ({title} · {platformName}).
 * 3. Inyectar URL canónica estricta para prevenir penalizaciones por contenido duplicado.
 * 4. Generar etiquetas OpenGraph y Twitter Cards completas con imágenes WebP.
 * 5. Inyectar marcado enriquecido Schema.org JSON-LD validable:
 *    - WebSite con SearchAction en portadas.
 *    - TechArticle en guías técnicas (con dificultad, dependencias y pasos).
 *    - NewsArticle en noticias de actualidad (con marcas temporales ISO 8601).
 *    - BreadcrumbList en páginas jerárquicas.
 *    - Organization en páginas institucionales y corporativas.
 * 6. Cumplimiento estricto de privacidad: exclusión absoluta de correos personales privados.
 *    Uso exclusivo de public@raupulus.dev (autor) y public@laguialinux.com (plataforma).
 */

import { computed } from 'vue'
import { useRoute } from '#app'

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface TechArticleMeta {
  /** Nivel de dificultad técnica */
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Principiante' | 'Intermedio' | 'Avanzado' | string
  /** Requisitos previos o dependencias de software/hardware */
  prerequisites?: string[] | string
  /** Distribuciones probadas (p. ej. Debian 12, Ubuntu 24.04, Arch Linux) */
  testedDistros?: string[] | string
  /** Tiempo estimado de lectura en minutos */
  readingTimeMinutes?: number
}

export interface RssAlternateLink {
  title: string
  href: string
}

export interface SeoEngineOptions {
  /** Título de la página (se concatenará con el nombre de la plataforma) */
  title?: string
  /** Descripción concisa (meta description y og:description) */
  description?: string
  /** URL canónica absoluta (si se omite, se deduce del dominio y la ruta actual) */
  canonicalUrl?: string
  /** URL absoluta o relativa de la imagen de portada/destacada (WebP recomendada) */
  imageUrl?: string
  /** Texto alternativo para la imagen */
  imageAlt?: string
  /** Tipo de documento OpenGraph ('website' | 'article') */
  type?: 'website' | 'article'
  /** Fecha de publicación ISO 8601 (p. ej. 2026-10-12T14:30:00Z) */
  publishedAt?: string
  /** Fecha de última modificación ISO 8601 */
  modifiedAt?: string
  /** Tipo principal de esquema Schema.org JSON-LD a generar */
  schemaType?: 'WebSite' | 'TechArticle' | 'NewsArticle' | 'Organization' | 'BreadcrumbList' | 'None'
  /** Jerarquía de migas de pan para el esquema BreadcrumbList */
  breadcrumbs?: BreadcrumbItem[]
  /** Metadatos adicionales para tutoriales y guías técnicas */
  techMeta?: TechArticleMeta
  /** Evitar indexación por motores de búsqueda (robots: noindex, nofollow) */
  noindex?: boolean
  /** Canales de suscripción RSS temáticos alternativos para autodescubrimiento */
  rssAlternateLinks?: RssAlternateLink[]
}

export const useSeoEngine = (options: SeoEngineOptions | (() => SeoEngineOptions)) => {
  const { platform, isNews } = usePlatform()
  const route = useRoute()

  // Evaluación reactiva de las opciones proporcionadas
  const resolved = computed(() => {
    return typeof options === 'function' ? options() : options
  })

  // Título completo dinámico
  const fullTitle = computed(() => {
    const rawTitle = resolved.value.title?.trim()
    if (!rawTitle) {
      return `${platform.value.name} — ${platform.value.tagline}`
    }
    return `${rawTitle} · ${platform.value.name}`
  })

  // Descripción normalizada
  const description = computed(() => {
    return resolved.value.description?.trim() || platform.value.tagline
  })

  // URL canónica estricta sin parámetros de tracking/UTM
  const canonicalUrl = computed(() => {
    if (resolved.value.canonicalUrl) {
      return resolved.value.canonicalUrl
    }
    const cleanPath = route.path
    return `https://${platform.value.domain}${cleanPath}`
  })

  // Imagen OpenGraph y Twitter
  const ogImage = computed(() => {
    if (resolved.value.imageUrl) {
      if (resolved.value.imageUrl.startsWith('http')) {
        return resolved.value.imageUrl
      }
      return `https://${platform.value.domain}${resolved.value.imageUrl}`
    }
    // Imagen fallback según el portal activo
    const defaultCover = isNews.value
      ? '/assets/img/covers/hero_news.webp'
      : '/assets/img/covers/cover_guias.webp'
    return `https://${platform.value.domain}${defaultCover}`
  })

  const ogImageAlt = computed(() => {
    return resolved.value.imageAlt || resolved.value.title || platform.value.name
  })

  // Inyección de metaetiquetas estándar y de redes sociales
  useSeoMeta({
    title: () => fullTitle.value,
    description: () => description.value,
    // Open Graph
    ogTitle: () => fullTitle.value,
    ogDescription: () => description.value,
    ogImage: () => ogImage.value,
    ogImageUrl: () => ogImage.value,
    ogImageAlt: () => ogImageAlt.value,
    ogUrl: () => canonicalUrl.value,
    ogType: () => resolved.value.type || (resolved.value.schemaType === 'TechArticle' || resolved.value.schemaType === 'NewsArticle' ? 'article' : 'website'),
    ogSiteName: () => platform.value.name,
    ogLocale: () => 'es_ES',
    // Twitter Cards
    twitterCard: () => 'summary_large_image',
    twitterSite: () => '@raupulus',
    twitterCreator: () => '@raupulus',
    twitterTitle: () => fullTitle.value,
    twitterDescription: () => description.value,
    twitterImage: () => ogImage.value,
    twitterImageAlt: () => ogImageAlt.value,
    // Robots (bloqueo global de indexación a petición)
    robots: () => 'noindex, nofollow, noarchive, nosnippet',
    googlebot: () => 'noindex, nofollow, noarchive, nosnippet',
  })

  // Generación reactiva de Scripts JSON-LD
  const jsonLdScripts = computed(() => {
    const scripts: Array<{ type: string; children: string }> = []
    const current = resolved.value
    const domain = platform.value.domain
    const baseUrl = `https://${domain}`
    const logoUrl = `${baseUrl}/assets/img/logo-badge.webp`

    // Entidad de autor canónica común
    const authorEntity = {
      '@type': 'Person',
      name: 'Raúl Caro Pastorino',
      alternateName: 'raupulus',
      url: 'https://raupulus.dev',
      email: 'public@raupulus.dev',
      sameAs: [
        'https://twitter.com/raupulus',
        'https://github.com/raupulus',
      ],
    }

    // Entidad de editor canónica común
    const publisherEntity = {
      '@type': 'Organization',
      name: platform.value.name,
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: logoUrl,
      },
    }

    // 1. Esquema WebSite (Portal Home con SearchAction)
    if (current.schemaType === 'WebSite') {
      scripts.push({
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: platform.value.name,
          alternateName: isNews.value ? 'News LGL' : 'La Guía Linux',
          url: baseUrl,
          description: platform.value.tagline,
          inLanguage: 'es',
          publisher: publisherEntity,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/buscar?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        }),
      })
    }

    // 2. Esquema TechArticle (Guías y Tutoriales técnicos)
    if (current.schemaType === 'TechArticle') {
      const prerequisitesText = Array.isArray(current.techMeta?.prerequisites)
        ? current.techMeta?.prerequisites.join(', ')
        : current.techMeta?.prerequisites

      const distrosText = Array.isArray(current.techMeta?.testedDistros)
        ? current.techMeta?.testedDistros.join(', ')
        : current.techMeta?.testedDistros

      scripts.push({
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: current.title || platform.value.name,
          description: description.value,
          image: ogImage.value,
          datePublished: current.publishedAt,
          dateModified: current.modifiedAt || current.publishedAt,
          mainEntityOfPage: canonicalUrl.value,
          inLanguage: 'es',
          author: authorEntity,
          publisher: publisherEntity,
          proficiencyLevel: current.techMeta?.difficulty || 'Intermediate',
          dependencies: prerequisitesText || undefined,
          operatingSystem: distrosText || 'Linux',
        }),
      })
    }

    // 3. Esquema NewsArticle (Noticias de Actualidad y Seguridad)
    if (current.schemaType === 'NewsArticle') {
      scripts.push({
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: current.title || platform.value.name,
          description: description.value,
          image: ogImage.value,
          datePublished: current.publishedAt,
          dateModified: current.modifiedAt || current.publishedAt,
          mainEntityOfPage: canonicalUrl.value,
          inLanguage: 'es',
          author: authorEntity,
          publisher: publisherEntity,
        }),
      })
    }

    // 4. Esquema Organization (Páginas institucionales y legales)
    if (current.schemaType === 'Organization') {
      scripts.push({
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: platform.value.name,
          url: baseUrl,
          logo: logoUrl,
          description: platform.value.tagline,
          founder: authorEntity,
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: 'public@laguialinux.com',
            availableLanguage: ['es'],
          },
        }),
      })
    }

    // 5. Esquema BreadcrumbList (Estructura de migas de pan)
    if (current.breadcrumbs && current.breadcrumbs.length > 0) {
      scripts.push({
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: current.breadcrumbs.map((b, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: b.name,
            item: b.url.startsWith('http') ? b.url : `${baseUrl}${b.url}`,
          })),
        }),
      })
    }

    return scripts
  })

  // Enlaces en cabecera: canónica y autodescubrimiento RSS
  const headLinks = computed(() => {
    const links: Array<{ rel: string; href: string; type?: string; title?: string }> = [
      { rel: 'canonical', href: canonicalUrl.value },
    ]

    // Feeds RSS/Atom granulares alternativos
    if (resolved.value.rssAlternateLinks && resolved.value.rssAlternateLinks.length > 0) {
      resolved.value.rssAlternateLinks.forEach((feed) => {
        links.push({
          rel: 'alternate',
          type: 'application/rss+xml',
          title: feed.title,
          href: feed.href.startsWith('http') ? feed.href : `https://${platform.value.domain}${feed.href}`,
        })
      })
    }

    return links
  })

  // Inyección global en el head
  useHead({
    title: () => fullTitle.value,
    link: () => headLinks.value,
    script: () => jsonLdScripts.value,
  })

  return {
    fullTitle,
    description,
    canonicalUrl,
    ogImage,
  }
}
