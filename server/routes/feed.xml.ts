// server/routes/feed.xml.ts
import { defineEventHandler, setHeader } from 'h3'
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
  const siteDescription = (config.public?.platformTagline as string)
    || (isNews
      ? 'Actualidad en vivo sobre el Kernel Linux, distribuciones, hardware y seguridad.'
      : 'Guías, tutoriales, chuletas y referencia técnica sobre sistemas GNU/Linux.')

  // Fetch articles from API or robust fallback to sample contents
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
      `${apiBaseUrl}/platforms/${platformSlug}/contents?per_page=20`,
      { timeout: 2500 }
    ).catch(() => null)

    if (apiRes?.success && Array.isArray(apiRes.data)) {
      items = apiRes.data.map(item => ({
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt || item.seo_description || '',
        publishedAt: item.published_at || new Date().toISOString(),
        category: item.taxonomies?.categories?.[0]?.name || (isNews ? 'Noticias' : 'Guías'),
        url: `https://${domain}/${isNews ? 'noticia' : 'guia'}/${item.slug}`,
      }))
    }
  } catch {
    // API not reachable, proceed to local sample fallback
  }

  if (items.length === 0) {
    if (isNews) {
      items = SAMPLE_NEWS.map(n => ({
        title: n.title,
        slug: n.slug,
        excerpt: n.excerpt,
        publishedAt: n.published_at,
        category: n.categoryName,
        url: `https://${domain}/noticia/${n.slug}`,
      }))
    } else {
      items = SAMPLE_GUIDES.map(g => ({
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
    <title><![CDATA[${escapeCdata(siteName)}]]></title>
    <link>https://${domain}</link>
    <description><![CDATA[${escapeCdata(siteDescription)}]]></description>
    <language>es-ES</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>La Guia Linux Nuxt Engine (GNU AGPLv3)</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <atom:link href="https://${domain}/feed.xml" rel="self" type="application/rss+xml"/>
${xmlItems}
  </channel>
</rss>`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=3600')

  return xml
})
