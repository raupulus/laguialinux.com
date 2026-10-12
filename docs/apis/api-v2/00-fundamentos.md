# Fundamentos de la API REST V2

Especificación oficial destilada y verificada de la API REST V2 de la plataforma backend.

---

## 1. Convenciones Base

- **Base URL**: `/api/v2` (en local: `http://localhost:8000/api/v2`).
- **Autenticación**: Los endpoints de consulta de contenidos, plataformas, categorías y etiquetas son **completamente públicos**. No requieren cabeceras de autorización ni cookies.
- **Envelope estándar**: Todas las respuestas HTTP devuelven un JSON uniforme:

### Éxito (Recurso único o lista sin paginación)
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

### Éxito (Colección paginada)
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": [ ... ],
  "meta": {
    "total": 42,
    "per_page": 25,
    "current_page": 1,
    "last_page": 2,
    "from": 1,
    "to": 25
  }
}
```

### Error
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": {
    "campo": ["Detalle específico del error"]
  }
}
```

---

## 2. Huella (`ETag`), Caché y 304

- Todas las respuestas GET de consulta incluyen cabeceras:
  - `ETag: "<hash-del-cuerpo>"`
  - `Cache-Control: max-age=60, public`
- Si el cliente envía `If-None-Match: "<hash>"`, el servidor responde con **`304 Not Modified` sin cuerpo** si los datos no han cambiado.
- El servidor invalida la caché de respuesta automáticamente al modificar contenidos, páginas, taxonomías o metadatos.

---

## 3. Límites de Petición (Rate Limiting)

- Límite global por IP o token: **300 peticiones por minuto** (`RATE_LIMIT_API_GLOBAL`).
- Superado el límite, responde con código HTTP `429 Too Many Requests`.

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
