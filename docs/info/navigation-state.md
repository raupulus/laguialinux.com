# Módulo: Estado de Navegación (`navigation-state`)

> **Ruta del código**: [`stores/navigation.ts`](../../stores/navigation.ts)  
> **Estado**: `Activo`

---

## 1. Qué hace y qué NO hace

### Qué hace
- Gestiona el estado reactivo de apertura/cierre del mega-menú de categorías (`isCategoryMenuOpen`).
- Gestiona el estado del modal de búsqueda global rápida `Cmd+K` (`isSearchOpen`).
- Gestiona el estado del panel lateral drawer en dispositivos móviles (`isMobileDrawerOpen`).
- Almacena la categoría raíz activa seleccionada en la vista de categorías (`activeRootCategory`).
- Aplica exclusión mutua: abrir el menú de categorías cierra la búsqueda, y viceversa.

### Qué NO hace
- NO realiza peticiones de red ni descarga datos de categorías (delega en `useApiClient`).
- NO persiste estado en `localStorage` (el estado de navegación es volátil por sesión).

---

## 2. Modelo de datos y tipos

Store Pinia sin estado complejo externo:

```typescript
isCategoryMenuOpen: Ref<boolean>
isSearchOpen: Ref<boolean>
isMobileDrawerOpen: Ref<boolean>
activeRootCategory: Ref<string | null>
```

---

## 3. Flujos principales

1. **Apertura de menú**: `toggleCategoryMenu()` invierte el booleano y asegura que `isSearchOpen` quede en `false`.
2. **Atajo de teclado**: Al pulsar `Cmd+K` o `Ctrl+K`, se invoca `toggleSearch()`, cerrando menús abiertos y desplegando el modal de búsqueda.
3. **Cierre al navegar**: Los cambios de ruta cierran automáticamente menús y modales.

---

## 4. Puntos de entrada

Acciones exportadas:
- `toggleCategoryMenu()`, `closeCategoryMenu()`
- `toggleSearch()`, `closeSearch()`
- `toggleMobileDrawer()`, `closeMobileDrawer()`

---

## 5. Dependencias

- **Hacia adentro**: `pinia`
- **Hacia afuera**:
  - `layouts/default.vue`
  - Futuros componentes: `AppHeader.vue`, `CategoryMenu.vue`, `SearchModal.vue`.

---

## 6. Configuración

No requiere variables de entorno.

---

## 7. Trampas conocidas

- Al renderizar en SSR, el estado se inicializa cerrado (`false`) para garantizar paridad de hidratación cliente-servidor sin parpadeos.

---

## 8. Tests que lo cubren

- `⚠️ sin verificar`

---

## 9. Pendiente real

- [ ] Escuchar eventos de cambio de ruta en Vue Router (`useRoute().path`) para invocar `closeCategoryMenu()` y `closeMobileDrawer()` automáticamente.

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
