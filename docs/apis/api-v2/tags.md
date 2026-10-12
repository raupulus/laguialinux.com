# Dominio: Etiquetas (`/platforms/{slug}/tags`)

Endpoints para consultar las etiquetas temáticas asignadas a una plataforma.

---

## 1. `GET /platforms/{slug}/tags` — Listado de Etiquetas

- **Propósito**: Obtener el catálogo de tags disponibles para filtrado cruzado de contenidos.
- **Autenticación**: Pública.
- **Paginación**: No (lista completa ordenada por nombre).
- **Respuesta 200**:
  ```json
  {
    "success": true,
    "message": "Operación exitosa",
    "data": [
      {
        "id": 1,
        "slug": "debian",
        "name": "Debian",
        "color": "#d70a53",
        "contents_count": 42
      },
      {
        "id": 2,
        "slug": "seguridad",
        "name": "Seguridad",
        "color": "#ef4444",
        "contents_count": 18
      }
    ]
  }
  ```
- **Errores**: `404` `Plataforma no encontrada`.

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
