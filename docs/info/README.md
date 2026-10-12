# Índice Maestro de Documentación Técnica Viva (`docs/info/`)

Bienvenido al índice maestro de la documentación técnica viva del frontend de **La Guía Linux** (`laguialinux.com` y `news.laguialinux.com`).

Este directorio contiene la verdad técnica del código implementado en este repositorio.

---

## 1. Documentación General y Guías de Sistema

- **[Sistema de Diseño y Tokens UI](DESIGN.md)**: Paletas de color, tokens CSS `@theme` de Tailwind v4, tipografía y reglas de contraste.
- **[Catálogo de Componentes UI](COMPONENTS.md)**: Inventario de componentes Vue implementados y estado de verificación.
- **[Comandos del Repositorio](commands.md)**: Scripts de desarrollo, compilación, preview y nuxi.
- **[Decisiones Técnicas y ADRs](decisiones-tecnicas.md)**: Justificación del stack (Nuxt 4, Tailwind v4, Pinia, `@nuxt/icon`, arquitectura multi-tenant).
- **[Plantilla de Módulo](_MODULE_TEMPLATE.md)**: Estructura estándar obligatoria para documentar nuevos módulos.

---

## 2. Módulos Técnicos Implementados

| Módulo | Archivo | Código Fuente | Estado | Propósito |
| :--- | :--- | :--- | :--- | :--- |
| **Núcleo Multi-Tenant** | [`platform-core.md`](platform-core.md) | `composables/usePlatform.ts` | `Activo` | Configuración dinámica y bifurcación guías vs noticias por variables de entorno. |
| **Cliente API REST V2** | [`api-client.md`](api-client.md) | `composables/useApiClient.ts` | `Activo` | Consumo tipado y con caché SSR de la API V2 de Laravel. |
| **Estado de Navegación** | [`navigation-state.md`](navigation-state.md) | `stores/navigation.ts` | `Activo` | Store Pinia para menú de categorías, modal de búsqueda y drawer móvil. |
| **Maquetación y Temas** | [`theme-layout.md`](theme-layout.md) | `layouts/default.vue` | `Activo` | Estructura esquelética responsive, acentos dinámicos y estilos base. |

---

## 3. Integración con APIs de Terceros / Backend

- **[Integración con API REST V2](apis/api-v2.md)**: Cómo consumimos los endpoints de contenidos, categorías y plataformas desde el frontend.
  - Especificación oficial de la API: [`docs/apis/api-v2/README.md`](../apis/api-v2/README.md).

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
