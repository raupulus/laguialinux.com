# Catálogo de Componentes UI

Inventario verificado de componentes Vue/Nuxt implementados en el directorio `components/`.

---

## 1. Componentes Base y Estructura Global

### `AppEcosystemBar` (`components/AppEcosystemBar.vue`)
- **Propósito**: Barra superior de navegación del ecosistema que permite conmutar entre Guías (`laguialinux.com`) y Noticias (`news.laguialinux.com`) con indicador de punto pulsante activo, enlace directo al canal de Telegram y acceso a contacto.
- **Props**: Ninguna (consume reactivamente `usePlatform`).

### `AppHeader` (`components/AppHeader.vue`)
- **Propósito**: Cabecera unificada responsive con detección multi-tenant de isotipo, título, badge de versión (`2.0 Reborn` / `News Portal`), selector y botón de alternancia del mega-menú de categorías con contador, enlaces directos, botón de búsqueda rápida (`Cmd+K`) y menú drawer para dispositivos móviles.
- **Props**: Ninguna (consume reactivamente `usePlatform` y `useNavigationStore`).

### `CategoryMenu` (`components/CategoryMenu.vue`)
- **Propósito**: Mega-menú desplegable de 2 niveles (raíces en columna izquierda con recuentos y subcategorías en rejilla visual derecha) con altura consistente y enlace directo al explorador de categorías.
- **Props**: Ninguna (consume reactivamente `useNavigationStore` y `categoriesData.ts`).

### `AppFooter` (`components/AppFooter.vue`)
- **Propósito**: Pie de página oficial con 4 columnas (stack tecnológico animado SVG con elefante PHP oscilante, cubo Laravel 3D, logo Vue con bote elástico y corazón con pulso continuo; enlaces del proyecto; autor Raúl Caro Pastorino `@raupulus` y email `public@laguialinux.com`; redes sociales y botón YouTube), créditos y mención canónica de licencia dual (`Código bajo GNU AGPLv3 · Contenidos bajo CC BY-SA 4.0`).
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
- **Propósito**: Portada del portal principal de guías (`laguialinux.com`) con fidelidad total al prototipo aprobado.
- **Secciones incluidas**:
  1. Hero principal con rejilla radial y terminal interactivo CLI con botones de copia rápida para comandos frecuentes (`systemctl`, `fdisk`, `iptables`, `chmod calc`, `btrfs snapshot`).
  2. Carrusel Swiper 3D Coverflow de Últimas Noticias con tarjetas tridimensionales y metadatos de lectura.
  3. Los 3 Pilares Fundamentales (LGL Aprender Compartir, Noticias Actualidad y Eventos, Open Source Libertad en lo Digital) con badges flotantes `-mt-5` e ilustraciones temáticas.
  4. Bloque de botones sociales 3D squircle con doble sombra táctil y relieve (YouTube, GitLab, GitHub, Telegram, Mastodon, X).
  5. Carrusel Swiper 3D Coverflow de Bitácora & Artículos del Blog.

### `HomeNews` (`components/home/HomeNews.vue`)
- **Propósito**: Portada del portal de actualidad (`news.laguialinux.com`) con diseño editorial dark slate.
- **Secciones incluidas**:
  1. Ticker de última hora en tiempo real con efecto teletipo.
  2. Noticia editorial principal destacada (Hero story) + pila vertical de noticias secundarias con badges.
  3. Barra de filtrado rápido por categorías (Todas, Distribuciones, Ciberseguridad, Kernel Linux, Hardware, Software Libre, Eventos).
  4. Feed cronológico de noticias con tarjetas de imagen lateral pop-out tridimensional.
  5. Columna lateral con ranking 72h de tendencias, tracker de lanzamientos de distros, caja RSS y banner cross-site a Guías.
  6. Caja de suscripción a la newsletter técnica.

---

## 3. Componentes en Planificación (`⚠️ sin verificar` / Pendientes)

- `⚠️ sin verificar` `CommandSnippet.vue`: Bloque de comando con detección de comandos destructivos y modal de confirmación.
- `⚠️ sin verificar` `SearchModal.vue`: Modal interactivo `Cmd+K` para búsqueda instantánea en API V2.

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
