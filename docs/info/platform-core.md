# Módulo: Núcleo de Plataforma Multi-Tenant (`platform-core`)

> **Ruta del código**: [`composables/usePlatform.ts`](../../composables/usePlatform.ts)  
> **Estado**: `Activo`

---

## 1. Qué hace y qué NO hace

### Qué hace
- Extrae y computa de forma reactiva la configuración de la plataforma activa a partir de las variables de entorno de Nuxt (`useRuntimeConfig().public`).
- Provee los flags computados `isGuides` y `isNews` para bifurcar plantillas o comportamientos específicos.
- Centraliza los flags de características habilitadas (`tools`, `cveAlerts`, `kernelWatcher`).

### Qué NO hace
- NO realiza peticiones de red ni llamadas a la API (delegado en `useApiClient`).
- NO almacena estado mutable ni persistente de usuario (delegado en Pinia o `localStorage`).

---

## 2. Modelo de datos y tipos

Definido en [`types/platform.ts`](../../types/platform.ts):

```typescript
export interface PlatformConfig {
  slug: string
  domain: string
  name: string
  tagline: string
  apiBaseUrl: string
  themeAccent: string
  features: {
    tools: boolean
    cveAlerts: boolean
    kernelWatcher: boolean
  }
}
```

---

## 3. Flujos principales

1. **Flujo de lectura en SSR/Cliente**: Se llama `usePlatform()` en un layout, página o composable y lee la configuración precargada en `runtimeConfig`.
2. **Detección de portal**: Las propiedades `isGuides` (`slug === 'laguialinux'`) o `isNews` (`slug === 'news'`) permiten alternar bloques visuales.

---

## 4. Puntos de entrada

- `usePlatform()`:
  - `platform: ComputedRef<PlatformConfig>`
  - `isGuides: ComputedRef<boolean>`
  - `isNews: ComputedRef<boolean>`

---

## 5. Dependencias

- **Hacia adentro**:
  - `types/platform.ts`
  - `nuxt/app` (`useRuntimeConfig`)
- **Hacia afuera**:
  - `composables/useApiClient.ts`
  - `layouts/default.vue`
  - `pages/index.vue`

---

## 6. Configuración

| Variable de Entorno | Valor por Defecto | Efecto y Propósito |
| :--- | :--- | :--- |
| `NUXT_PUBLIC_PLATFORM_SLUG` | `"laguialinux"` | Identificador de la plataforma para la API V2 (`laguialinux` o `news`). |
| `NUXT_PUBLIC_PLATFORM_DOMAIN` | `"laguialinux.com"` | Dominio público canónico. |
| `NUXT_PUBLIC_PLATFORM_NAME` | `"La Guía Linux"` | Nombre visible en cabeceras y SEO. |
| `NUXT_PUBLIC_THEME_ACCENT` | `"emerald"` | Acento visual primario (`emerald` para guías, `orange` para noticias). |
| `NUXT_PUBLIC_API_BASE_URL` | `"http://localhost:8000/api/v2"` | URL base absoluta de la API REST V2. |
| `NUXT_PUBLIC_FEATURES_TOOLS` | `"true"` | Activa el catálogo de herramientas sysadmin (Chmod, Cron, etc.). |
| `NUXT_PUBLIC_FEATURES_CVE_ALERTS`| `"false"` | Activa el banner de alertas CVE críticas en noticias. |
| `NUXT_PUBLIC_FEATURES_KERNEL_WATCHER` | `"false"` | Activa el widget de monitoreo del kernel Linux. |

---

## 7. Trampas conocidas

- Si se cambia una variable en `.env` durante la ejecución en desarrollo, Nuxt requiere reinicio del servidor de desarrollo (`pnpm dev`) para recargar `runtimeConfig`.

---

## 8. Tests que lo cubren

- `⚠️ sin verificar` (Pendiente creación de tests con Vitest/Nuxt Test Utils)

---

## 9. Pendiente real

- [ ] Añadir validación Zod en tiempo de compilación para comprobar la existencia obligatoria de `NUXT_PUBLIC_PLATFORM_SLUG` y `NUXT_PUBLIC_API_BASE_URL`.

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
