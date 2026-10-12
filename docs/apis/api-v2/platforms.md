# Dominio: Plataformas (`/platforms`)

Endpoints para consultar información de plataformas y perfiles públicos asociados.

---

## 1. `GET /platforms` — Listado de Plataformas

- **Propósito**: Obtener las plataformas registradas y activas en el CMS.
- **Autenticación**: Pública.
- **Paginación**: Sí (`?page=1&per_page=25`).
- **Respuesta 200**:
  ```json
  {
    "success": true,
    "message": "Operación exitosa",
    "data": [
      {
        "id": 1,
        "name": "La Guía Linux",
        "title": "La Guía Linux",
        "slug": "laguialinux",
        "domain": "laguialinux.com",
        "description": "Portal de guías y tutoriales Linux",
        "created_at": "2026-08-04T22:00:05.000000Z"
      }
    ],
    "meta": { "total": 2, "per_page": 25, "current_page": 1, "last_page": 1, "from": 1, "to": 2 }
  }
  ```

---

## 2. `GET /platforms/{slug}` — Ficha de una Plataforma

- **Propósito**: Carga inicial de metadatos globales del sitio (autor, redes sociales, tecnologías y páginas fijas).
- **Parámetros de ruta**:
  - `slug`: Slug de la plataforma (ej. `laguialinux` o `news`).
- **Respuesta 200**:
  ```json
  {
    "success": true,
    "message": "Operación exitosa",
    "data": {
      "id": 1,
      "name": "La Guía Linux",
      "title": "La Guía Linux",
      "slug": "laguialinux",
      "description": "Comandos, tutoriales y optimización Linux",
      "domain": "laguialinux.com",
      "url_about": "https://laguialinux.com/sobre-nosotros",
      "social_networks": {
        "twitter": "@raupulus",
        "mastodon": "@raupulus"
      },
      "author": {
        "name": "Raúl Caro Pastorino",
        "nick": "raupulus",
        "web": "https://raupulus.dev"
      },
      "contents": {
        "total": 108,
        "types": [
          { "id": 1, "slug": "guide", "name": "Guía", "plural_name": "Guías", "total": 95 },
          { "id": 2, "slug": "blog", "name": "Blog", "plural_name": "Blogs", "total": 13 }
        ]
      }
    }
  }
  ```
- **Errores**: `404` `Plataforma no encontrada`.

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
