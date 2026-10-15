// server/routes/sitemap.xml.ts
import { defineEventHandler, setHeader } from 'h3'
import { SAMPLE_GUIDES, SAMPLE_NEWS, SAMPLE_BLOG_POSTS } from '~/utils/sampleContentsData'

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: string
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '\'': return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const reqHost = (event.node?.req?.headers?.host || '').split(':')[0].toLowerCase()

  let platformSlug = (config.public?.platformSlug as string) || 'laguialinux'
  let isNews = platformSlug === 'news'
  let domain = (config.public?.platformDomain as string) || (isNews ? 'news.laguialinux.com' : 'laguialinux.com')

  if (reqHost.startsWith('news.') || reqHost === 'news.laguialinux.com') {
    platformSlug = 'news'
    isNews = true
    domain = reqHost
  } else if (reqHost === 'laguialinux.com' || (reqHost.includes('laguialinux') && !reqHost.includes('news'))) {
    platformSlug = 'laguialinux'
    isNews = false
    domain = reqHost
  }
  const baseUrl = `https://${domain}`

  const nowIso = new Date().toISOString().split('T')[0]
  const urls: SitemapUrl[] = []

  // 1. URLs Estáticas Principales
  urls.push({
    loc: `${baseUrl}/`,
    lastmod: nowIso,
    changefreq: isNews ? 'hourly' : 'daily',
    priority: '1.0',
  })

  if (!isNews) {
    urls.push({
      loc: `${baseUrl}/guias`,
      lastmod: nowIso,
      changefreq: 'daily',
      priority: '0.9',
    })
    urls.push({
      loc: `${baseUrl}/herramientas`,
      lastmod: nowIso,
      changefreq: 'monthly',
      priority: '0.8',
    })
    urls.push({
      loc: `${baseUrl}/blog`,
      lastmod: nowIso,
      changefreq: 'weekly',
      priority: '0.8',
    })
  }

  // Páginas institucionales compartidas
  const staticPages = [
    { path: '/sobre-nosotros', changefreq: 'monthly' as const, priority: '0.5' },
    { path: '/amigos', changefreq: 'monthly' as const, priority: '0.5' },
    { path: '/feeds', changefreq: 'monthly' as const, priority: '0.5' },
    { path: '/contacto', changefreq: 'monthly' as const, priority: '0.5' },
    { path: '/aviso-legal', changefreq: 'yearly' as const, priority: '0.3' },
    { path: '/privacidad', changefreq: 'yearly' as const, priority: '0.3' },
    { path: '/cookies', changefreq: 'yearly' as const, priority: '0.3' },
  ]

  for (const sp of staticPages) {
    urls.push({
      loc: `${baseUrl}${sp.path}`,
      lastmod: nowIso,
      changefreq: sp.changefreq,
      priority: sp.priority,
    })
  }

  // 2. Consulta a API V2 para Contenidos y Categorías
  const apiBaseUrl = (config.public.apiBaseUrl as string) || 'http://localhost:8000/api/v2'

  let apiContents: any[] = []
  let apiCategories: any[] = []

  try {
    const [contentsRes, categoriesRes] = await Promise.all([
      $fetch<{ success: boolean, data: any[] }>(
        `${apiBaseUrl}/platforms/${platformSlug}/contents?per_page=100`,
        { timeout: 2500 }
      ).catch(() => null),
      $fetch<{ success: boolean, data: any[] }>(
        `${apiBaseUrl}/platforms/${platformSlug}/categories`,
        { timeout: 2500 }
      ).catch(() => null),
    ])

    if (contentsRes?.success && Array.isArray(contentsRes.data)) {
      apiContents = contentsRes.data
    }
    if (categoriesRes?.success && Array.isArray(categoriesRes.data)) {
      apiCategories = categoriesRes.data
    }
  } catch {
    // API no disponible
  }

  // 3. Procesar Categorías
  if (apiCategories.length > 0) {
    for (const cat of apiCategories) {
      if (cat.slug) {
        urls.push({
          loc: `${baseUrl}/categoria/${cat.slug}`,
          lastmod: nowIso,
          changefreq: isNews ? 'daily' : 'weekly',
          priority: '0.7',
        })
        if (Array.isArray(cat.subcategories)) {
          for (const sub of cat.subcategories) {
            if (sub.slug) {
              urls.push({
                loc: `${baseUrl}/categoria/${sub.slug}`,
                lastmod: nowIso,
                changefreq: isNews ? 'daily' : 'weekly',
                priority: '0.6',
              })
            }
          }
        }
      }
    }
  } else {
    const defaultCategories = isNews
      ? ['distribuciones', 'ciberseguridad', 'kernel-linux', 'hardware', 'software-libre']
      : ['comandos', 'almacenamiento', 'redes', 'seguridad', 'optimizacion', 'software']
    for (const slug of defaultCategories) {
      urls.push({
        loc: `${baseUrl}/categoria/${slug}`,
        lastmod: nowIso,
        changefreq: 'weekly',
        priority: '0.7',
      })
    }
  }

  // 4. Procesar Contenidos Publicados
  if (apiContents.length > 0) {
    for (const item of apiContents) {
      const typeSlug = item.type?.slug || ''
      const lastMod = item.updated_at ? item.updated_at.split('T')[0] : (item.published_at ? item.published_at.split('T')[0] : nowIso)

      let pathPrefix = 'guia'
      if (isNews || typeSlug === 'news') {
        pathPrefix = 'noticia'
      } else if (typeSlug === 'blog') {
        pathPrefix = 'blog'
      }

      urls.push({
        loc: `${baseUrl}/${pathPrefix}/${item.slug}`,
        lastmod: lastMod,
        changefreq: isNews ? 'daily' : 'monthly',
        priority: isNews ? '0.9' : '0.8',
      })
    }
  } else {
    // Fallback con datasets locales
    if (isNews) {
      for (const n of SAMPLE_NEWS) {
        urls.push({
          loc: `${baseUrl}/noticia/${n.slug}`,
          lastmod: n.updated_at ? n.updated_at.split('T')[0] : nowIso,
          changefreq: 'daily',
          priority: '0.9',
        })
      }
    } else {
      for (const g of SAMPLE_GUIDES) {
        urls.push({
          loc: `${baseUrl}/guia/${g.slug}`,
          lastmod: g.updated_at ? g.updated_at.split('T')[0] : nowIso,
          changefreq: 'weekly',
          priority: '0.8',
        })
      }
      for (const b of SAMPLE_BLOG_POSTS) {
        urls.push({
          loc: `${baseUrl}/blog/${b.slug}`,
          lastmod: b.updated_at ? b.updated_at.split('T')[0] : nowIso,
          changefreq: 'monthly',
          priority: '0.7',
        })
      }
    }
  }

  // 5. Construcción del XML
  const xmlEntries = urls.map(u => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    ${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ''}
    ${u.priority ? `<priority>${u.priority}</priority>` : ''}
  </url>`).join('\n')

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')

  return xmlContent
})
