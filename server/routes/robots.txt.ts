import { defineEventHandler, setHeader } from 'h3'

export default defineEventHandler((event) => {
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

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')

  return [
    'User-agent: *',
    'Disallow: /',
    '',
  ].join('\n')
})
