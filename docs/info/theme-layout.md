# Módulo: Sistema de Maquetación y Temas (`theme-layout`)

> **Ruta del código**: [`layouts/default.vue`](../../layouts/default.vue), [`assets/css/main.css`](../../assets/css/main.css)  
> **Estado**: `Activo`

---

## 1. Qué hace y qué NO hace

### Qué hace
- Provee la estructura esquelética HTML común para todas las vistas (`header`, `main`, `footer`).
- Adapta dinámicamente los acentos visuales (esmeralda vs naranja), logotipos e insignias según la plataforma activa (`usePlatform`).
- Define los tokens CSS globales en `@theme` (Tailwind v4) y el esquema `dark-first` en `:root`.
- Renderiza en el pie de página la mención obligatoria de licencia dual: `"Código bajo GNU AGPLv3 · Contenidos bajo CC BY-SA 4.0"`.

### Qué NO hace
- NO incluye lógica de negocio ni peticiones complejas a la API.
- NO fuerza recargas de página al cambiar de plataforma.

---

## 2. Modelo de datos y tipos

Consume `PlatformConfig` desde `usePlatform()`.

---

## 3. Flujos principales

1. **Montaje del Layout**: Nuxt renderiza `layouts/default.vue` envolviendo la página actual mediante `<slot />`.
2. **Computación de acentos**: Evalúa `platform.themeAccent`:
   - Si es `'orange'`: asigna clases de acento naranja (`text-orange-500`, bordes naranja, icono de periódico).
   - En cualquier otro caso: asigna clases esmeralda (`text-emerald-400`, icono de terminal).

---

## 4. Puntos de entrada

- `layouts/default.vue` (layout por defecto aplicado en `app.vue` o por ruta).
- `assets/css/main.css` (hoja de estilos global inyectada en `nuxt.config.ts`).

---

## 5. Dependencias

- **Hacia adentro**:
  - `composables/usePlatform.ts`
  - `@nuxt/icon`
  - `assets/css/main.css`
- **Hacia afuera**:
  - `app.vue`
  - Todas las páginas en `pages/`

---

## 6. Configuración

- `NUXT_PUBLIC_THEME_ACCENT` (`emerald` | `orange`).
- `NUXT_PUBLIC_SITE_NAME`.

---

## 7. Trampas conocidas

- El layout utiliza `min-h-screen` y `flex-col` para garantizar que el footer se mantenga al fondo en páginas con poco contenido vertical, evitando saltos de scroll.

---

## 8. Tests que lo cubren

- `⚠️ sin verificar`

---

## 9. Pendiente real

- [ ] Sustituir la cabecera básica temporal del layout por el componente modular definitivo `AppHeader.vue`.
- [ ] Sustituir el footer básico temporal por el componente `AppFooter.vue` con animación SVG del stack tecnológico.

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
