# AGENTS.md — Directrices de Desarrollo y Arquitectura: La Guía Linux (Frontend Nuxt)

Bienvenido al repositorio maestro del frontend web de **La Guía Linux** (`laguialinux.com` y `news.laguialinux.com`).

Este documento establece las directrices operativas, arquitectura, convenciones técnicas, estándares de privacidad y responsabilidades para los agentes de desarrollo que intervienen en esta base de código.

---

## 1. Alcance del Repositorio y Relación con el Ecosistema

Este repositorio alberga la aplicación frontend unificada en **Nuxt 3 / 4** para todo el ecosistema web.

### Repositorio Hermano de Referencia Técnica (`nueva-apps/`)
Para cualquier consulta sobre análisis funcional, prototipos interactivos originales, contratos HTTP, especificaciones de módulos o taxonomías, consulta el repositorio hermano:
📁 `/Users/fryntiz/git/1-Projects/LaGuiaLinux/nueva-apps/`
- **Contratos de la API V2**: `nueva-apps/docs/contracts/` (`content.md`, `contact.md`, `newsletter.md`, `auth.md`).
- **Especificaciones Funcionales de Módulos (MOD-00 a MOD-17)**: `nueva-apps/docs/functional/modules/`.
- **Sistema de Diseño y Tokens**: `nueva-apps/DESIGN.md`.
- **Prototipos Interactivos HTML/CSS**: `nueva-apps/prototypes/`.
- **Contenidos y Metadatos en Markdown**: `nueva-apps/pages/` (95 guías y 12 posts de blog).
- **Redirecciones Nginx para dominio antiguo**: `nueva-apps/deploy/nginx/laguialinux.es/`.

> **Regla de Trabajo**: Este repositorio (`laguialinux.com`) es el espacio de implementación activo del código del frontend Nuxt. El repositorio `nueva-apps` se utiliza exclusivamente como base de conocimiento, especificación técnica y repositorio de contenidos/metadatos.

---

## 2. Topología de Red y Dominios (2 Dominios + 1 Subdominio)

| Host / Dominio | Propósito y Función | Implementación |
| :--- | :--- | :--- |
| **`laguialinux.es`** | **Punto de entrada legado.** Servidor Nginx dedicado exclusivamente a ejecutar redirecciones HTTP 301 permanentes hacia `laguialinux.com` y `news.laguialinux.com`. Ni este frontend ni la API backend reciben tráfico de este dominio. | Capa Nginx externa ([`deploy/nginx/laguialinux.es`](../nueva-apps/deploy/nginx/laguialinux.es)) |
| **`laguialinux.com`** | **Portal principal (Frontend Nuxt):** Guías técnicas paso a paso, manuales de comandos, herramientas interactivas para sysadmins y blog técnico integrado. Consume la API REST V2 bajo la plataforma `laguialinux`. | **Este repositorio (`.env.example`)** |
| **`news.laguialinux.com`** | **Portal de Noticias (Frontend Nuxt):** Actualidad sobre GNU/Linux, distribuciones, ciberseguridad, hardware, kernel watcher y alertas CVE. Consume la API REST V2 bajo la plataforma `news`. | **Este repositorio (`.env.news.example`)** |

---

## 3. Pila Tecnológica y Convenciones

1. **Framework Core**:
   - **Nuxt 4 / 3** (`nuxt@^4.6.1`, `vue@^3.5.43`) con motor Nitro y SSR/SSG.
   - Modo estricto activado en TypeScript (`typescript.strict: true`).
2. **Estilos y Diseño**:
   - **Tailwind CSS v4** integrado vía `@tailwindcss/vite`.
   - Variables de diseño y tema centralizadas en `assets/css/main.css` (`@theme`).
   - Paleta oficial:
     - Guías: Verde Esmeralda/Terminal (`#00FF66`, `#10B981`) sobre fondo pizarra oscuro (`#080C14`, `#0B0F17`).
     - Noticias: Naranja Tech (`#F97316`, `#EA580C`) sobre pizarra oscuro.
   - Fuentes tipográficas: `Plus Jakarta Sans` (titulares), `Inter` (cuerpo de lectura) y `JetBrains Mono` (código y terminal).
3. **Iconografía**:
   - Módulo oficial **`@nuxt/icon`** con colecciones Iconify on-demand (preferencia por `lucide:*` y `heroicons:*`).
   - Cero fuentes pesadas en runtime: generación SVG directa y ligera.
4. **Gestión de Estado**:
   - **Pinia** (`@pinia/nuxt`, `pinia@4.0.3`) para estados globales (menú de navegación, modal de búsqueda, lectura de páginas, filtros).
5. **Arquitectura Multi-Tenant Unificada**:
   - Una única base de código que se parametriza al 100% mediante variables de entorno:
     - `NUXT_PUBLIC_PLATFORM_SLUG`: `laguialinux` o `news`.
     - `NUXT_PUBLIC_PLATFORM_DOMAIN`: `laguialinux.com` o `news.laguialinux.com`.
     - `NUXT_PUBLIC_API_BASE_URL`: `http://localhost:8000/api/v2`.
     - `NUXT_PUBLIC_THEME_ACCENT`: `emerald` o `orange`.
   - Acceso reactivo en cualquier componente mediante el composable `usePlatform()`.

---

## 4. Reglas Globales de Seguridad, Privacidad y Licenciamiento

### 🔒 Protección Estricta de Datos Personales
- **PROHIBICIÓN ABSOLUTA**: NUNCA publicar, compartir, incluir en código, commits, variables de entorno, metadatos ni documentación el correo personal privado `raupulus@gmail.com` ni ningún otro dato personal no autorizado.
- **Correos públicos oficiales autorizados**:
  - **Autor**: `public@raupulus.dev`
  - **Plataforma / Contacto**: `public@laguialinux.com`
- **Metadatos Oficiales del Autor**:
  - **Nombre**: Raúl Caro Pastorino
  - **Nick en redes**: `@raupulus`
  - **Sitio web**: `https://raupulus.dev`

### ⚖️ Licenciamiento Dual Oficial
1. **Software y Código Fuente**: **GNU Affero General Public License v3.0 (GNU AGPLv3)** ([`LICENSE`](./LICENSE)).
   - Copyleft estricto en red (Sección 13): cualquier versión modificada servida a usuarios en red debe poner a disposición del público el código fuente completo.
2. **Contenido Editorial, Guías y Noticias**: **Creative Commons Atribución-CompartirIgual 4.0 Internacional (CC BY-SA 4.0)** ([`LICENSE-CONTENT.md`](./LICENSE-CONTENT.md)).
3. **Mención Canónica Obligatoria en Pie de Página**:
   `"Código bajo GNU AGPLv3 · Contenidos bajo CC BY-SA 4.0"`

---

## 5. Estructura de Directorios

```text
├── assets/
│   └── css/
│       └── main.css            # Estilos globales y tokens @theme de Tailwind v4
├── components/                 # Componentes Vue reutilizables
│   ├── AppBadge.vue            # Badges de estado con variantes de color
│   └── ...                     # Componentes modulares
├── composables/                # Lógica de negocio y data fetching
│   ├── useApiClient.ts         # Cliente tipado para la API REST V2 (/api/v2)
│   └── usePlatform.ts          # Composable reactivo de configuración multitenant
├── layouts/
│   └── default.vue             # Layout maestro con cabecera y pie de página
├── pages/
│   └── index.vue               # Portada reactiva adaptable según plataforma activa
├── public/                     # Archivos estáticos directos (favicon.ico, robots.txt)
├── stores/
│   └── navigation.ts           # Store Pinia para menú de categorías, búsqueda y drawer
├── types/                      # Interfaces TypeScript compartidas estrictas
│   ├── api.ts                  # Envelope ApiResponse y ApiPaginatedResponse
│   ├── category.ts             # CategoryResource y SubcategoryResource
│   ├── content.ts              # ContentResource, ContentPageResource, SEO
│   ├── platform.ts             # PlatformResource y PlatformConfig
│   ├── tag.ts                  # TagResource
│   └── index.ts                # Exportador maestro de tipos
├── utils/
│   └── formatters.ts           # Utilidades puras (formato de fechas, slugify)
├── .env.example                # Configuración por defecto para La Guía Linux
├── .env.news.example           # Configuración para Noticias La Guía Linux
├── nuxt.config.ts              # Configuración central de Nuxt, plugins y runtimeConfig
├── package.json                # Dependencias (pnpm)
├── LICENSE                     # Licencia GNU AGPLv3
├── LICENSE-CONTENT.md          # Licencia CC BY-SA 4.0
└── README.md                   # Documentación de inicio rápido
```

---

## 6. Integración con la API Backend (Laravel API V2)

- **URL Base en Desarrollo**: `http://localhost:8000/api/v2`
- **Envelope de Respuesta**: Todas las respuestas siguen el esquema `{ success, message, data, errors, meta }`.
- **Consumo Tipado**: Utilizar siempre el composable `useApiClient()`, que maneja el envelope y las interfaces de `types/`.
- **Manejo de Caché**: La API emite cabeceras `ETag` y `Cache-Control: max-age=60, public`. `useFetch` respeta el cacheo HTTP automáticamente.

---

## 7. Directrices para Agentes

1. **No romper la compilación**: Tras cualquier cambio significativo, ejecuta siempre `pnpm run build` o `pnpm run postinstall` para verificar que no hay errores de TypeScript ni de paquetes.
2. **Respetar la arquitectura multitenant**: No introducir valores hardcodeados para títulos, colores o slugs de plataforma. Usa siempre `usePlatform()` para que la misma vista funcione tanto en `laguialinux.com` como en `news.laguialinux.com`.
3. **Calidad de Código**: Escribe componentes limpios con Composition API (`<script setup lang="ts">`), nombres semánticos y CSS utilitario de Tailwind v4.
4. **Privacidad Primero**: Antes de cualquier commit o respuesta, verifica que no se filtre ningún correo privado ni credencial.
