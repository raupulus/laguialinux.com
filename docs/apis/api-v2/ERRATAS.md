# Erratas y Discrepancias Detectadas en la API REST V2

Registro de inconsistencias o peculiaridades entre especificaciones teóricas y respuestas reales de la API V2.

---

## 1. Convención de nombres en URLs de imágenes de categorías

- **Discrepancia**: Mientras casi toda la API V2 utiliza estrictamente `snake_case` para las claves de los recursos (`contents_count`, `published_at`, `views_count`), en el endpoint de categorías (`GET /platforms/{slug}/categories`) las miniaturas vienen bautizadas en `camelCase`:
  - `urlImageMicro`
  - `urlImageSmall`
- **Impacto en Frontend**: Las interfaces TypeScript de `CategoryResource` deben declarar explícitamente estas propiedades en camelCase para evitar accesos `undefined`.

---

## 2. Paridad `name` y `title` en Plataformas

- **Discrepancia**: El modelo de base de datos usa `title`, pero para retrocompatibilidad con clientes v1 la API V2 expone tanto `name` como `title` conteniendo exactamente el mismo string.
- **Impacto en Frontend**: Se puede utilizar cualquiera de los dos, pero se recomienda tipar y consumir `title` o `name` coherentemente.

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
