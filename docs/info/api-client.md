# Módulo: Cliente API REST V2 (`api-client`)

> **Ruta del código**: [`composables/useApiClient.ts`](../../composables/useApiClient.ts)  
> **Estado**: `Activo`

---

## 1. Qué hace y qué NO hace

### Qué hace
- Provee métodos fuertemente tipados para consultar los endpoints públicos de la API V2 de Laravel (`/api/v2`).
- Resuelve dinámicamente la URL base y el slug de la plataforma a través de `usePlatform()`.
- Genera claves únicas de caché SSR (`key`) para evitar duplicación de peticiones entre servidor y cliente.
- Soporta reactividad automática al pasar referencias de filtros en colecciones (`MaybeRef<CollectionQueryParams>`).

### Qué NO hace
- NO gestiona autenticación de usuarios (todos los endpoints consumidos son 100% públicos).
- NO almacena estado global persistente (delega en Pinia o en los composables consumidores).
- NO altera el payload devuelto por el servidor (respeta el envelope `{ success, data, meta }`).

---

## 2. Modelo de datos y tipos

Importa interfaces desde [`types/index.ts`](../../types/index.ts):

```typescript
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors?: Record<string, string[]>
}

export interface ApiPaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ApiPaginationMeta
}
```

---

## 3. Flujos principales

1. **Consulta de colección**: `getContents({ category: 'comandos', page: 1 })` ejecuta `useFetch` contra `${baseUrl}/platforms/${slug}/contents?category=comandos&page=1`.
2. **Re-ejecución reactiva**: Al mutar una propiedad reactiva del query (ej. `currentPage.value++`), `useFetch` detecta el cambio vía `watch` y actualiza `data`.
3. **Manejo de errores**: Las respuestas no 2xx retornan el objeto de error de `useFetch` conteniendo el payload `{ success: false, message, errors }`.

---

## 4. Puntos de entrada

- `getPlatformInfo()`
- `getCategories()`
- `getTags()`
- `getContents(query?)`
- `getContentBySlug(slug, options?)`

---

## 5. Dependencias

- **Hacia adentro**:
  - `composables/usePlatform.ts`
  - `types/` (`api.ts`, `platform.ts`, `category.ts`, `tag.ts`, `content.ts`)
- **Hacia afuera**:
  - Componentes de navegación, listados y vistas de lectura.

---

## 6. Configuración

Depende de la variable inyectada en `usePlatform`:
- `NUXT_PUBLIC_API_BASE_URL` (ej. `http://localhost:8000/api/v2`).

---

## 7. Trampas conocidas

- Los parámetros pasados a `getContents` deben envolverse en referencias o getters computados si se desea que un cambio de página o filtro reactive automáticamente la petición sin invocar el método de nuevo manualmente.

---

## 8. Tests que lo cubren

- `⚠️ sin verificar` (Pendiente integración de mocks HTTP con MSW o Vitest).

---

## 9. Pendiente real

- [ ] Añadir soporte para cabecera `If-None-Match` manual en peticiones cliente cuando se implemente caché local en IndexedDB.

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
