# Guías de Despliegue (`docs/deploys/`)

Guía técnica para el despliegue del frontend Nuxt en entornos de staging y producción.

---

## 1. Arquitectura de Despliegue en Producción

El frontend opera como un servicio Node.js gestionado por Nitro bajo un servidor web Nginx como proxy inverso:

```
[Cliente Web / CDN Cloudflare]
               │
               ▼
      [Servidor Nginx]
      ├── laguialinux.com       ──► Proxy a Node (localhost:3000)
      ├── news.laguialinux.com  ──► Proxy a Node (localhost:3001)
      └── laguialinux.es        ──► Redirecciones 301 directas (sin pasar por Node ni API)
```

---

## 2. Variables de Entorno de Producción

### 2.1. Portal de Guías (`laguialinux.com`)
```ini
NODE_ENV=production
PORT=3000
NUXT_PUBLIC_PLATFORM_SLUG=laguialinux
NUXT_PUBLIC_PLATFORM_DOMAIN=laguialinux.com
NUXT_PUBLIC_PLATFORM_NAME="La Guía Linux"
NUXT_PUBLIC_PLATFORM_TAGLINE="Comandos, tutoriales y optimización de sistemas"
NUXT_PUBLIC_THEME_ACCENT=emerald
NUXT_PUBLIC_API_BASE_URL=https://api.raupulus.dev/api/v2
NUXT_PUBLIC_FEATURES_TOOLS=true
NUXT_PUBLIC_FEATURES_CVE_ALERTS=false
NUXT_PUBLIC_FEATURES_KERNEL_WATCHER=false
```

### 2.2. Portal de Noticias (`news.laguialinux.com`)
```ini
NODE_ENV=production
PORT=3001
NUXT_PUBLIC_PLATFORM_SLUG=news
NUXT_PUBLIC_PLATFORM_DOMAIN=news.laguialinux.com
NUXT_PUBLIC_PLATFORM_NAME="La Guía Linux Noticias"
NUXT_PUBLIC_PLATFORM_TAGLINE="Actualidad sobre Linux, software libre y tecnología"
NUXT_PUBLIC_THEME_ACCENT=orange
NUXT_PUBLIC_API_BASE_URL=https://api.raupulus.dev/api/v2
NUXT_PUBLIC_FEATURES_TOOLS=false
NUXT_PUBLIC_FEATURES_CVE_ALERTS=true
NUXT_PUBLIC_FEATURES_KERNEL_WATCHER=true
```

---

## 3. Pipeline de Despliegue (Build & Run)

```bash
# 1. Instalar dependencias exactas
pnpm install --frozen-lockfile

# 2. Compilar aplicación
pnpm build

# 3. Iniciar o recargar servicio con PM2 / Systemd
# Para laguialinux.com:
PORT=3000 node .output/server/index.mjs

# Para news.laguialinux.com:
PORT=3001 node .output/server/index.mjs
```

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
