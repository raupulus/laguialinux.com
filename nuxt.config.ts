// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  // Modo de desarrollo y devtools
  devtools: { enabled: true },

  // Módulos esenciales: Pinia para estado e Iconos ligeros Iconify
  modules: [
    '@pinia/nuxt',
    '@nuxt/icon',
  ],

  // Tailwind CSS v4 con Vite
  vite: {
    plugins: [
      tailwindcss(),
    ],
    optimizeDeps: {
      include: [
        'swiper',
        'swiper/modules',
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  // Configuración de TypeScript estricto
  typescript: {
    strict: true,
    typeCheck: false,
  },

  // Configuración multitenant por variables de entorno
  // Permite alternar entre 'laguialinux.com' y 'news.laguialinux.com' cambiando .env
  runtimeConfig: {
    // Claves privadas del servidor
    apiSecret: '',

    // Variables públicas expuestas al cliente
    public: {
      platformSlug: process.env.NUXT_PUBLIC_PLATFORM_SLUG || 'laguialinux',
      platformDomain: process.env.NUXT_PUBLIC_PLATFORM_DOMAIN || 'laguialinux.com',
      platformName: process.env.NUXT_PUBLIC_PLATFORM_NAME || 'La Guía Linux',
      platformTagline: process.env.NUXT_PUBLIC_PLATFORM_TAGLINE || 'Portal de Guías, Tutoriales y Referencia Técnica de GNU/Linux',
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v2',
      themeAccent: process.env.NUXT_PUBLIC_THEME_ACCENT || 'emerald',
      featuresTools: process.env.NUXT_PUBLIC_FEATURES_TOOLS !== 'false',
      featuresCveAlerts: process.env.NUXT_PUBLIC_FEATURES_CVE_ALERTS === 'true',
      featuresKernelWatcher: process.env.NUXT_PUBLIC_FEATURES_KERNEL_WATCHER === 'true',
    },
  },

  // Configuración del módulo de iconos (on-demand SVG)
  icon: {
    serverBundle: 'auto',
  },
})
