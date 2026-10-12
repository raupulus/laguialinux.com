# Documentación Oficial Destilada: API REST V2

Documentación técnica verificada y destilada de la API REST V2 de la plataforma Raupulus (`/api/v2`).

---

## 1. Fundamentos y Especificaciones Generales

1. **[00-Fundamentos](00-fundamentos.md)**: Convenciones HTTP, envelope `{ success, data, meta, errors }`, ETag, caché 304 y rate limiting.
2. **[Erratas Detectadas](ERRATAS.md)**: Particularidades y diferencias de nomenclatura (ej. `urlImageMicro` en camelCase).
3. **[Limitaciones Conocidas](LIMITACIONES.md)**: Profundidad taxonómica máxima (1 nivel), reservas de slug (`highlights`) y límites de paginación.

---

## 2. Dominios de la API

| Dominio | Documento | Rutas Principales |
| :--- | :--- | :--- |
| **Plataformas** | [`platforms.md`](platforms.md) | `GET /platforms`, `GET /platforms/{slug}` |
| **Categorías** | [`categories.md`](categories.md) | `GET /platforms/{slug}/categories` |
| **Etiquetas** | [`tags.md`](tags.md) | `GET /platforms/{slug}/tags` |
| **Contenidos** | [`contents.md`](contents.md) | `GET /platforms/{slug}/contents`, `highlights`, detalle, páginas |

---

## 3. Fuentes Originales de Contrato

Las especificaciones completas de origen se preservan intactas en `docs/apis/api-v2/src/` (no se editan ni se leen de rutina):
- `src/content.md`: Contrato completo del CMS (plataformas, categorías, contenidos, páginas, archivos).
- `src/newsletter.md`: Contrato del módulo de newsletter y confirmación web anti-prefetch.
- `src/contact.md`: Contrato del formulario de contacto y protección anti-bot.
- `src/auth.md`: Contrato de autenticación y tokens administrativos.

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
