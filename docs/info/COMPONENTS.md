# Catálogo de Componentes UI

Inventario verificado de componentes Vue/Nuxt implementados en el directorio `components/`.

---

## 1. Componentes Base y Estructura Global

### `AppHeader` (`components/AppHeader.vue`)
- **Propósito**: Cabecera unificada responsive con detección multi-tenant de isotipo, título, badge de versión (`2.0 Reborn` / `News Portal`), enlaces de navegación por portal, acceso cruzado entre sitios, botón de búsqueda rápida (`Cmd+K`) e indicador de entorno.
- **Props**: Ninguna (consume reactivamente `usePlatform` y `useNavigationStore`).

### `AppFooter` (`components/AppFooter.vue`)
- **Propósito**: Pie de página oficial con 4 columnas (stack tecnológico y corazón pulsante SVG animado, navegación interna, avisos legales y enlaces ARCO/RGPD, comunidad y autor Raúl Caro Pastorino `@raupulus`), barra de derechos y mención obligatoria de licencia dual (`GNU AGPLv3` + `CC BY-SA 4.0`).
- **Props**: Ninguna.

### `AppBadge` (`components/AppBadge.vue`)
- **Propósito**: Etiqueta / píldora visual para taxonomías, estados de publicación, categorías y contadores.
- **Props**:
  - `variant?: 'emerald' | 'orange' | 'slate'` (por defecto `'emerald'`).
- **Slots**:
  - `default`: Contenido de texto o icono del badge.

---

## 2. Portadas y Secciones de Inicio (`components/home/`)

### `HomeGuides` (`components/home/HomeGuides.vue`)
- **Propósito**: Portada del portal principal de guías (`laguialinux.com`).
- **Secciones incluidas**:
  1. Hero principal con terminal interactivo CLI y botón de copia rápida con feedback visual.
  2. Los 3 Pilares Fundamentales (Aprender, Administrar, Compartir).
  3. Parrilla de 6 categorías técnicas destacadas con recuento de guías.
  4. Banner cross-site hacia el portal de noticias (`news.laguialinux.com`).

### `HomeNews` (`components/home/HomeNews.vue`)
- **Propósito**: Portada del portal de actualidad (`news.laguialinux.com`).
- **Secciones incluidas**:
  1. Ticker de última hora en tiempo real.
  2. Widget Kernel Watcher (versión estable, LTS y árbol de desarrollo) condicionado por `features.kernelWatcher`.
  3. Hero editorial con la noticia principal destacada, badge y tiempo de lectura.
  4. Parrilla de noticias recientes con tarjetas pop-out y metadatos.
  5. Columna lateral con ranking de tendencias en 72 horas y lanzamientos de distros.
  6. Banner cross-site hacia el portal de guías y chuletas (`laguialinux.com`).

---

## 3. Componentes en Planificación (`⚠️ sin verificar` / Pendientes)

- `⚠️ sin verificar` `CategoryMenu.vue`: Menú mega-dropdown con soporte de 1 nivel de categorías y subcategorías.
- `⚠️ sin verificar` `CommandSnippet.vue`: Bloque de comando con detección de comandos destructivos y modal de confirmación.
- `⚠️ sin verificar` `SearchModal.vue`: Modal interactivo `Cmd+K` para búsqueda instantánea en API V2.

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
