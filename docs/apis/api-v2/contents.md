# Dominio: Contenidos (`/platforms/{slug}/contents`)

Endpoints para consulta de artículos, guías, noticias, páginas multipaso y destacados.

---

## 1. `GET /platforms/{slug}/contents` — Listado de Contenidos

- **Propósito**: Colección paginada de contenidos activos y publicados.
- **Parámetros de consulta (Query)**:

| Parámetro | Tipo | Descripción |
| :--- | :--- | :--- |
| `page` | `number` | Número de página (por defecto `1`). |
| `per_page` | `number` | Elementos por página (1 a 100, por defecto `25`). |
| `featured` | `1` o `0` | Filtrar solo destacados. |
| `type` | `string` | Slug del tipo de contenido (ej. `guide`, `blog`, `news`, `page`). |
| `category` | `string` | Slug de categoría o subcategoría. Una raíz incluye automáticamente sus hijas. |
| `tag` | `string` | Slug de la etiqueta. |
| `technology` | `string` | Slug de la tecnología vinculada. |
| `q` | `string` | Búsqueda por texto en título y extracto. |
| `sort` | `string` | Campo de ordenación (`published_at`, `-published_at`, `title`, `-title`). |

- **Respuesta 200**:
  ```json
  {
    "success": true,
    "message": "Operación exitosa",
    "data": [
      {
        "id": 10,
        "title": "Optimización de Memoria Swap y Swappiness en Linux",
        "slug": "optimizacion-swap-swappiness",
        "excerpt": "Ajuste fino del parámetro vm.swappiness para servidores y equipos de escritorio.",
        "type": { "id": 1, "slug": "guide", "name": "Guía" },
        "is_featured": true,
        "image": {
          "url": "https://api.raupulus.dev/.../cover.webp",
          "thumbnails": { "small": "...", "medium": "...", "large": "..." }
        },
        "pages_count": 3,
        "views_count": 1420,
        "published_at": "2026-08-20T10:00:00.000000Z"
      }
    ],
    "meta": { "total": 95, "per_page": 25, "current_page": 1, "last_page": 4, "from": 1, "to": 25 }
  }
  ```

---

## 2. `GET /platforms/{slug}/contents/highlights` — Destacados y Tendencia

- **Propósito**: Obtener los bloques de portada (destacados, últimos y más vistos en 72h).
- **Parámetros**:
  - `type`: `featured` | `latest` | `trend` | `all` (por defecto `all`).
  - `limit`: 1 a 24 por tipo (por defecto 6).
- **Respuesta 200**:
  ```json
  {
    "success": true,
    "message": "Operación exitosa",
    "data": {
      "featured": { "guide": [ ... ] },
      "latest": { "guide": [ ... ], "blog": [ ... ] },
      "trend": { "guide": [ ... ] }
    }
  }
  ```

---

## 3. `GET /platforms/{slug}/contents/{contentSlug}` — Detalle de Contenido

- **Propósito**: Obtener la ficha completa de una guía o noticia.
- **Parámetros de consulta**:
  - `include`: Lista separada por comas (`seo`, `metadata`, `taxonomies`, `technologies`, `contributors`, `galleries`, `files`, `related`, `pages`, o `all`).
  - `format`: Formato de texto para el cuerpo (`markdown`, `editorjs` o `html`). Por defecto devuelve el formato nativo almacenado.
- **Respuesta 200**:
  ```json
  {
    "success": true,
    "message": "Operación exitosa",
    "data": {
      "id": 10,
      "title": "Optimización de Memoria Swap y Swappiness en Linux",
      "slug": "optimizacion-swap-swappiness",
      "excerpt": "Ajuste fino del parámetro vm.swappiness...",
      "pages": [
        { "id": 101, "order": 1, "title": "Introducción y Conceptos", "slug": "introduccion" },
        { "id": 102, "order": 2, "title": "Configuración en /etc/sysctl.conf", "slug": "configuracion" }
      ],
      "first_page": {
        "id": 101,
        "order": 1,
        "title": "Introducción y Conceptos",
        "slug": "introduccion",
        "format": "markdown",
        "body": "## ¿Qué es Swappiness?\n\nEl kernel de Linux..."
      }
    }
  }
  ```
- **Errores**: `404` `Contenido no encontrado`.

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
