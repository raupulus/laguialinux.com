# Dominio: Categorías (`/platforms/{slug}/categories`)

Endpoints para consultar el árbol taxonómico de categorías de una plataforma.

---

## 1. `GET /platforms/{slug}/categories` — Árbol de Categorías para Menú

- **Propósito**: Obtener las categorías raíz asignadas a la plataforma, cada una conteniendo sus subcategorías y recuentos de contenidos.
- **Autenticación**: Pública.
- **Paginación**: No (devuelve la lista completa de raíces).
- **Orden**: Alfabético por nombre.
- **Respuesta 200**:
  ```json
  {
    "success": true,
    "message": "Operación exitosa",
    "data": [
      {
        "slug": "administracion-de-sistemas",
        "name": "Administración de Sistemas",
        "description": "Comandos esenciales, monitorización y servicios",
        "icon": "lucide:server",
        "color": "#10b981",
        "urlImageMicro": "https://api.raupulus.dev/.../micro.webp",
        "urlImageSmall": "https://api.raupulus.dev/.../small.webp",
        "contents_count": 28,
        "subcategories": [
          {
            "slug": "comandos-basicos",
            "name": "Comandos Básicos",
            "description": "Navegación y manipulación de archivos",
            "icon": "lucide:terminal",
            "color": "#059669",
            "urlImageMicro": "https://api.raupulus.dev/.../sub-micro.webp",
            "urlImageSmall": "https://api.raupulus.dev/.../sub-small.webp",
            "contents_count": 14,
            "parent": "administracion-de-sistemas"
          }
        ]
      }
    ]
  }
  ```

### Notas de Integración:
- `contents_count`: En la raíz suma los suyos y los de sus subcategorías **sin duplicar**.
- Categorías con `contents_count: 0` se devuelven en la respuesta; el cliente decide si filtrarlas o mostrarlas deshabilitadas.
- Errores: `404` `Plataforma no encontrada`.

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
