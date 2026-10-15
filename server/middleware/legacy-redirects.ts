/**
 * server/middleware/legacy-redirects.ts
 * Interceptor Nitro de rutas históricas de WordPress con HTTP 301 Permanente
 * La Guía Linux
 * Licencia: GNU AGPLv3
 * Autor: Raúl Caro Pastorino (https://raupulus.dev)
 */

import { defineEventHandler, getRequestURL, getQuery, sendRedirect, setHeader } from 'h3'
import { resolveLegacyRedirect } from '../utils/redirectsMap'

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname
  const query = getQuery(event)

  const destination = resolveLegacyRedirect(pathname, query)
  if (destination && destination !== pathname) {
    // Cabecera de caché para optimización de rastreadores y Googlebot
    setHeader(event, 'Cache-Control', 'public, max-age=86400, s-maxage=86400')
    return sendRedirect(event, destination, 301)
  }
})
