# Catálogo de Componentes UI

Inventario verificado de componentes Vue/Nuxt implementados en el directorio `components/`.

---

## 1. Componentes Base y Átomos

### `AppBadge` (`components/AppBadge.vue`)
- **Propósito**: Etiqueta / píldora visual para taxonomías, estados de publicación, categorías y contadores.
- **Props**:
  - `variant?: 'emerald' | 'orange' | 'slate'` (por defecto `'emerald'`).
- **Slots**:
  - `default`: Contenido de texto o icono del badge.
- **Ejemplo de uso**:
  ```vue
  <AppBadge variant="emerald">Guía Sysadmin</AppBadge>
  <AppBadge variant="orange">Última Hora</AppBadge>
  <AppBadge variant="slate">Archivado</AppBadge>
  ```

---

## 2. Componentes en Planificación (`⚠️ sin verificar` / Pendientes)

Los siguientes componentes están analizados funcionalmente pero aún no implementados en código:

- `⚠️ sin verificar` `AppHeader.vue`: Barra superior unificada con logo dinámico, buscador (`Cmd+K`) y selector de tema.
- `⚠️ sin verificar` `AppFooter.vue`: Pie de página oficial con enlaces legales, licencia dual y créditos tecnológicos animados.
- `⚠️ sin verificar` `CategoryMenu.vue`: Menú mega-dropdown responsive de categorías y subcategorías (1 nivel).
- `⚠️ sin verificar` `CommandSnippet.vue`: Bloque de comando con copia inteligente (filtro de prompt `$ ` y confirmación destructiva).
- `⚠️ sin verificar` `KernelWatcher.vue`: Widget en tiempo real de versiones estables/LTS del kernel Linux (`kernel.org`).

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
