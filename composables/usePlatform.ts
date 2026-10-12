import type { PlatformConfig } from '~/types'

/**
 * Composable multitenant para acceder a la configuración de la plataforma activa
 * Configurable al 100% mediante variables de entorno (NUXT_PUBLIC_*)
 */
export const usePlatform = () => {
  const config = useRuntimeConfig()

  const platform = computed<PlatformConfig>(() => ({
    slug: config.public.platformSlug as string,
    domain: config.public.platformDomain as string,
    name: config.public.platformName as string,
    tagline: config.public.platformTagline as string,
    apiBaseUrl: config.public.apiBaseUrl as string,
    themeAccent: (config.public.themeAccent as string) || 'emerald',
    features: {
      tools: Boolean(config.public.featuresTools),
      cveAlerts: Boolean(config.public.featuresCveAlerts),
      kernelWatcher: Boolean(config.public.featuresKernelWatcher),
    },
  }))

  const isGuides = computed(() => platform.value.slug === 'laguialinux')
  const isNews = computed(() => platform.value.slug === 'news')

  return {
    platform,
    isGuides,
    isNews,
  }
}
