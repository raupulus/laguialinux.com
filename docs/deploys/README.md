# Guías de Despliegue (`docs/deploys/`)

Guía técnica para el despliegue del frontend Nuxt en entornos de producción sobre el servidor **Odin** (Apache2 + SSG).

---

## 1. Arquitectura de Despliegue en Producción (Odin - Apache2)

El frontend opera bajo un modelo **100% SSG (Generación Estática)** mediante `pnpm generate`. No existen procesos permanentes de Node.js, PM2, Docker ni puertos TCP locales en ejecución.

Apache2 sirve directamente los archivos estáticos a través de un esquema de **releases atómicas con symlinks**:

```
[Cliente Web / DNS]
         │
         ▼
[Servidor Apache2 (Odin)]
├── laguialinux.com       ──► /var/www/public/www.laguialinux.com
│                             (symlink ──► /var/www/releases/www.laguialinux.com_YYYYMMDD_HHMMSS)
├── news.laguialinux.com  ──► /var/www/public/www.news.laguialinux.com
│                             (symlink ──► /var/www/releases/www.news.laguialinux.com_YYYYMMDD_HHMMSS)
└── laguialinux.es        ──► Redirecciones 301 permanentes directas (Apache / Nginx)
```

---

## 2. Variables de Entorno de Producción (GoCD en Odin)

El pipeline de CI/CD inyecta las siguientes variables de entorno antes de compilar y desplegar:

### 2.1. Portal de Guías (`laguialinux.com`)
```ini
NODE_ENV=production
PATHNAME=www.laguialinux.com
NUXT_PUBLIC_PLATFORM_SLUG=laguialinux
NUXT_PUBLIC_PLATFORM_DOMAIN=laguialinux.com
NUXT_PUBLIC_PLATFORM_NAME="La Guía Linux"
NUXT_PUBLIC_PLATFORM_TAGLINE="Portal de Guías, Tutoriales y Referencia Técnica de GNU/Linux"
NUXT_PUBLIC_THEME_ACCENT=emerald
NUXT_PUBLIC_API_BASE_URL=https://api.raupulus.dev/api/v2
NUXT_PUBLIC_FEATURES_TOOLS=true
NUXT_PUBLIC_FEATURES_CVE_ALERTS=false
NUXT_PUBLIC_FEATURES_KERNEL_WATCHER=false
NUXT_PUBLIC_ADSENSE_CLIENT_ID=""
```

### 2.2. Portal de Noticias (`news.laguialinux.com`)
```ini
NODE_ENV=production
PATHNAME=www.news.laguialinux.com
NUXT_PUBLIC_PLATFORM_SLUG=news
NUXT_PUBLIC_PLATFORM_DOMAIN=news.laguialinux.com
NUXT_PUBLIC_PLATFORM_NAME="La Guía Linux Noticias"
NUXT_PUBLIC_PLATFORM_TAGLINE="Actualidad, Kernel, Distribuciones y Seguridad Open Source"
NUXT_PUBLIC_THEME_ACCENT=orange
NUXT_PUBLIC_API_BASE_URL=https://api.raupulus.dev/api/v2
NUXT_PUBLIC_FEATURES_TOOLS=false
NUXT_PUBLIC_FEATURES_CVE_ALERTS=true
NUXT_PUBLIC_FEATURES_KERNEL_WATCHER=true
NUXT_PUBLIC_ADSENSE_CLIENT_ID=""
```

> **Nota:** Variables como `HOST`, `PORT` y `NUXT_API_SECRET` se han descartado por completo al ser un despliegue puramente estático servido por Apache.

---

## 3. Pipeline de Automatización (GoCD)

El repositorio incluye en la carpeta `scripts/` los dos scripts estandarizados para la plantilla de Nuxt en GoCD:

1. **`scripts/generate_env.sh`**:
   - Genera el archivo `.env` a partir de `.env.example.production` inyectando las variables de GoCD.
   - Aplica permisos `ug+rw` y normaliza claves.
2. **`scripts/deploy.sh`**:
   - Ejecuta `pnpm install --frozen-lockfile` y `NODE_ENV=production pnpm generate`.
   - Verifica la integridad física de `.output/public` (`index.html`, bundles JS/CSS en `_nuxt`, `sitemap.xml`).
   - Copia la release a `/var/www/releases/${PATHNAME}_$TIMESTAMP` con `rsync`.
   - Conmuta de forma atómica el symlink `/var/www/public/${PATHNAME}`.
   - Ejecuta **Smoke Tests físicos en disco** (verificando `index.html`, `sitemap.xml`, `robots.txt`, `.htaccess`, subpáginas y bundles). **No realiza peticiones HTTP externas** para evitar falsos positivos con DNS o redirecciones heredadas.
   - Si los tests fallan, realiza **rollback automático** a la release anterior.
   - Purga releases antiguas conservando las 5 más recientes.

---

## 4. Configuración del Servidor Web (Apache2)

El archivo `public/.htaccess` se compila directamente en la raíz de `.output/public/` e implementa:
- `Options -Indexes -MultiViews`
- `ErrorDocument 404 /404.html`
- Cabeceras de seguridad (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).
- Caché inmutable (`max-age=31536000, immutable`) para activos con hash en `_nuxt/` y multimedia.
- Revalidación obligatoria (`no-cache, must-revalidate`) para documentos HTML, XML y JSON.

---

## 5. ⚠️ Checklist Crítico Pre-Publicación Definitiva: Reactivar Indexación SEO

Durante la fase previa de subida y pruebas en el servidor de producción/staging, la web se encuentra **estrictamente desindexada** para protegerla de motores de búsqueda.

**ANTES DE LA PUBLICACIÓN DEFINITIVA A PRODUCCIÓN**, es de obligado cumplimiento revertir el bloqueo de indexación ejecutando estos puntos:

- [ ] **1. `nuxt.config.ts`**:
  - Eliminar de `routeRules` la cabecera `'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet'`.
  - Retirar de `app.head.meta` las directivas `noindex` para `robots` y `googlebot`.
- [ ] **2. `app.vue`**:
  - Retirar de `useHead` las metaetiquetas `{ name: 'robots', content: 'noindex...' }` y `googlebot`.
- [ ] **3. `server/routes/robots.txt.ts`**:
  - Restaurar la emisión de `Allow: /` y la directiva `Sitemap: https://${domain}/sitemap.xml`.
  - Retirar la cabecera `X-Robots-Tag: noindex...`.
- [ ] **4. `public/robots.txt`**:
  - Actualizar o verificar que la ruta Nitro dinámica gestione los sitemaps según el dominio.
- [ ] **5. `composables/useSeoEngine.ts`**:
  - Restaurar la lógica dinámica reactiva:
    ```typescript
    robots: () => (resolved.value.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
    ```
- [ ] **6. `pages/contacto.vue`**:
  - Restaurar `{ name: 'robots', content: 'index, follow' }`.
- [ ] **7. Verificación final de cabeceras en producción**:
  - Comprobar que no existan cabeceras `X-Robots-Tag: noindex` en las respuestas servidas y que `/robots.txt` sirva el `sitemap.xml`.

---
> Creado: 2026-10-12 · Actualizado a SSG (Odin / Apache2): 2026-10-15
