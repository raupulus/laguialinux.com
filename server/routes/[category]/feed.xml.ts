// server/routes/[category]/feed.xml.ts
import { defineEventHandler, setHeader, createError } from 'h3'
import { DEFAULT_CATEGORIES } from '~/utils/categoriesData'
import { SAMPLE_GUIDES, SAMPLE_NEWS } from '~/utils/sampleContentsData'

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

function escapeCdata(s: string): string {
  return (s || '').replace(/]]>/g, ']]]]><![CDATA[>')
}

export default defineEventHandler(async (event) => {
  const categorySlug = event.context.params?.category?.toLowerCase()
  if (!categorySlug) {
    throw createError({ statusCode: 400, statusMessage: 'Category parameter is required' })
  }

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

  const siteName = (config.public?.platformName as string) || (isNews ? 'News La Guía Linux' : 'La Guía Linux')

  // Find category in taxonomy
  const availableCategories = DEFAULT_CATEGORIES[platformSlug] || []
  const categoryMeta = availableCategories.find(c => c.slug === categorySlug)

  if (!categoryMeta) {
    // If category not found in taxonomy, return 404
    throw createError({
      statusCode: 404,
      statusMessage: `Canal RSS no encontrado para la categoría '${categorySlug}'`,
    })
  }

  // Filter content items for this specific category
  let items: Array<{
    title: string
    slug: string
    excerpt: string
    publishedAt: string
    category: string
    url: string
  }> = []

  const apiBaseUrl = (config.public.apiBaseUrl as string) || 'http://localhost:8000/api/v2'

  try {
    const apiRes = await $fetch<{ success: boolean, data: any[] }>(
      `${apiBaseUrl}/platforms/${platformSlug}/contents?category=${categorySlug}&per_page=20`,
      { timeout: 2500 }
    ).catch(() => null)

    if (apiRes?.success && Array.isArray(apiRes.data) && apiRes.data.length > 0) {
      items = apiRes.data.map(item => ({
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt || item.seo_description || '',
        publishedAt: item.published_at || new Date().toISOString(),
        category: categoryMeta.name,
        url: `https://${domain}/${isNews ? 'noticia' : 'guia'}/${item.slug}`,
      }))
    }
  } catch {
    // Offline fallback
  }

  if (items.length === 0) {
    if (isNews) {
      items = SAMPLE_NEWS
        .filter(n => n.categorySlug === categorySlug)
        .map(n => ({
          title: n.title,
          slug: n.slug,
          excerpt: n.excerpt,
          publishedAt: n.published_at,
          category: n.categoryName,
          url: `https://${domain}/noticia/${n.slug}`,
        }))
    } else {
      items = SAMPLE_GUIDES
        .filter(g => g.categorySlug === categorySlug)
        .map(g => ({
          title: g.title,
          slug: g.slug,
          excerpt: g.excerpt || '',
          publishedAt: g.published_at,
          category: g.categoryName,
          url: `https://${domain}/guia/${g.slug}`,
        }))
    }
  }

  const lastBuildDate = items.length > 0
    ? new Date(items[0].publishedAt).toUTCString()
    : new Date().toUTCString()

  const channelTitle = `${categoryMeta.name} · ${siteName}`
  const channelDescription = categoryMeta.description
    || `Canal RSS temático de ${categoryMeta.name} en ${siteName}.`

  const xmlItems = items.map((item) => {
    const pubDate = new Date(item.publishedAt).toUTCString()
    return `    <item>
      <title><![CDATA[${escapeCdata(item.title)}]]></title>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="true">${escapeXml(item.url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>Raúl Caro Pastorino</dc:creator>
      <category><![CDATA[${escapeCdata(item.category)}]]></category>
      <description><![CDATA[${escapeCdata(item.excerpt)}]]></description>
      <content:encoded><![CDATA[${escapeCdata(item.excerpt)}]]></content:encoded>
    </item>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[${escapeCdata(channelTitle)}]]></title>
    <link>https://${domain}/categoria/${categorySlug}</link>
    <description><![CDATA[${escapeCdata(channelDescription)}]]></description>
    <language>es-ES</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>La Guia Linux Nuxt Engine (GNU AGPLv3)</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <atom:link href="https://${domain}/${categorySlug}/feed.xml" rel="self" type="application/rss+xml"/>
${xmlItems}
  </channel>
</rss>`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=3600')

  return xml
})
