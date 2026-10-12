# Integración Frontend con API REST V2

Cómo consume el frontend Nuxt de La Guía Linux la API REST V2 (`/api/v2`).

> Para la especificación técnica oficial destilada de los endpoints del backend, consultar [Documentación API V2](../../apis/api-v2/README.md).

---

## 1. Responsabilidad y Arquitectura de Integración

- **Cliente HTTP Centralizado**: Toda interacción con la API se realiza a través del composable [`useApiClient`](../api-client.md).
- **Aislamiento Multi-Tenant**: Las peticiones inyectan automáticamente el `platformSlug` activo obtenido desde [`usePlatform`](../platform-core.md).
- **Caché y SSR**: Aprovecha `useFetch` de Nuxt para deduplicar peticiones en SSR y cliente, sincronizándose con las cabeceras `ETag` y `Cache-Control: max-age=60, public` que emite el backend.

---

## 2. Endpoints Consumidos

| Función en `useApiClient` | Endpoint Backend V2 | Propósito |
| :--- | :--- | :--- |
| `getPlatformInfo()` | `GET /platforms/{platformSlug}` | Metadatos globales del sitio, autor (`@raupulus`), redes sociales y páginas estáticas. |
| `getCategories()` | `GET /platforms/{platformSlug}/categories` | Árbol de categorías raíz y subcategorías para el mega-menú de navegación. |
| `getTags()` | `GET /platforms/{platformSlug}/tags` | Directorio de etiquetas temáticas con recuento de contenidos. |
| `getContents(query)` | `GET /platforms/{platformSlug}/contents` | Listado paginado y filtrable (por `type`, `category`, `tag`, `q`, `featured`). |
| `getContentBySlug(slug, opts)` | `GET /platforms/{platformSlug}/contents/{slug}` | Detalle completo de guía o noticia, SEO, índice de páginas y contenido en Markdown o HTML. |

---

## 3. Manejo de Errores y Estados

- **Envelope V2**: Todas las respuestas exitosas siguen `{ success: true, message, data, meta? }`.
- **Errores HTTP (`404`, `422`, `429`, `500`)**:
  - `404`: Desencadena un error fatal manejado por la vista `pages/[...slug].vue` o `error.vue`.
  - `429`: Notificación de rate limit excedido (techo global de 300 peticiones/minuto).

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
