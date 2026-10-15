/**
 * server/api/kernel-releases.get.ts
 * Proxy SWR en Nitro con caché de 24 horas hacia kernel.org para resolver CORS
 * Licencia: GNU AGPLv3
 * Autor: Raúl Caro Pastorino (https://raupulus.dev)
 */

import { defineCachedEventHandler } from '#imports'

export interface KernelReleaseItem {
  version: string
  moniker: 'mainline' | 'stable' | 'longterm' | 'linux-next'
  date: string
  iseol?: boolean
  giturl?: string
}

export interface KernelApiResponse {
  latest_check: string
  mainline: string
  stable: string
  lts: string[]
  releases: KernelReleaseItem[]
}

export default defineCachedEventHandler(
  async (_event): Promise<KernelApiResponse> => {
    try {
      const data = await $fetch<{ releases?: KernelReleaseItem[] }>(
        'https://www.kernel.org/releases.json',
        {
          headers: {
            'User-Agent': 'LaGuiaLinux-News-KernelWatcher/2.0 (compatible; +https://news.laguialinux.com)'
          },
          timeout: 5000
        }
      )

      const releases = data?.releases || []
      const mainline = releases.find(r => r.moniker === 'mainline')?.version || '6.14-rc1'
      const stable = releases.find(r => r.moniker === 'stable')?.version || '6.13.2'
      const lts = releases
        .filter(r => r.moniker === 'longterm' && !r.iseol)
        .slice(0, 3)
        .map(r => r.version)

      return {
        latest_check: new Date().toISOString(),
        mainline,
        stable,
        lts,
        releases
      }
    } catch (_err: any) {
      // Si la conexión con kernel.org falla, responder con fallback estático verificado
      return {
        latest_check: new Date().toISOString(),
        mainline: '6.14-rc1',
        stable: '6.13.2',
        lts: ['6.6.77', '6.1.128'],
        releases: []
      }
    }
  },
  {
    maxAge: 60 * 60 * 24, // 24 horas de caché en Edge / Servidor
    swr: true,            // Stale-While-Revalidate activo
    name: 'lgl-kernel-org-releases'
  }
)
