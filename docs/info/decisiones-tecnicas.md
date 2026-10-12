# Decisiones Técnicas y Arquitectura (ADR)

Registro de decisiones de diseño técnico, selección de stack y arquitectura adoptadas en el proyecto.

---

## ADR-01: Framework Base — Nuxt 4 (Vue 3.5)

- **Contexto**: Se requiere una plataforma web con soporte SSR/SSG de alto rendimiento, optimizada para SEO técnico (Google AdSense, Core Web Vitals) y DX moderna.
- **Decisión**: Utilizar **Nuxt 4 (`^4.6.1`)** con Vue 3.5 y TypeScript estricto.
- **Consecuencias**:
  - Hidratación reactiva óptima y generación de páginas estáticas o dinámicas mediante Nitro.
  - Compatibilidad completa con composables automáticos (`useAsyncData`, `useFetch`, `useState`).

---

## ADR-02: Sistema de Estilos — Tailwind CSS v4 con `@tailwindcss/vite`

- **Contexto**: Tailwind CSS v4 introduce un motor CSS nativo sin necesidad de `tailwind.config.js` ni `postcss.config.js`.
- **Decisión**: Integrar Tailwind v4 directamente mediante el plugin de Vite `@tailwindcss/vite` y definir los tokens de tema con `@theme` en `assets/css/main.css`.
- **Consecuencias**:
  - Compilación ultrarrápida en Vite y menor fricción de configuración.
  - Los colores, fuentes y tokens del sistema de diseño son accesibles como variables CSS estándar y clases utilitarias.

---

## ADR-03: Iconografía — `@nuxt/icon` con Iconify

- **Contexto**: Se necesita una librería de iconos ligera, moderna y sin sobrecargar el bundle de producción con fuentes web completas ni miles de SVGs estáticos no utilizados.
- **Decisión**: Adoptar `@nuxt/icon` (v2.5+), aprovechando los conjuntos de iconos bajo demanda de Iconify (`lucide`, `heroicons`).
- **Consecuencias**:
  - Los iconos se renderizan como SVGs puros en el servidor o cliente solo cuando se usan (`<Icon name="lucide:terminal" />`).
  - Cero dependencias pesadas de fuentes en cliente.

---

## ADR-04: Gestión de Estado — Pinia

- **Contexto**: Se requiere un almacén reactivo para el estado global (menú de navegación, caché en memoria de categorías, preferencias de usuario).
- **Decisión**: Utilizar **Pinia (`@pinia/nuxt`)** como solución oficial y tipada.
- **Consecuencias**:
  - Soporte SSR nativo sin fugas de memoria entre peticiones concurrentes.
  - Tipado TypeScript completo en acciones y getters.

---

## ADR-05: Estrategia Multi-Tenant — Repositorio Único Parametrizado por Entorno

- **Contexto**: El ecosistema cuenta con dos portales con el 90% de lógica y taxonomía compartida:
  1. `laguialinux.com` (Guías y Tutoriales técnicos).
  2. `news.laguialinux.com` (Portal de Noticias).
- **Decisión**: Implementar una única base de código Nuxt cuya identidad, paleta visual y slug de plataforma de API se configuren dinámicamente mediante variables de entorno (`NUXT_PUBLIC_PLATFORM_SLUG`, `NUXT_PUBLIC_SITE_NAME`, `NUXT_PUBLIC_ACCENT_COLOR`).
- **Consecuencias**:
  - Mantenimiento centralizado de componentes (buscador, menús, llamadas a API, footers).
  - El despliegue de cada dominio solo requiere compilar o ejecutar con su respectivo archivo `.env`.

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
