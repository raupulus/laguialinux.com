# Comandos del Repositorio

Comandos y scripts oficiales para el desarrollo, compilación y mantenimiento del proyecto frontend Nuxt.

---

## 1. Gestor de paquetes oficial

El gestor de paquetes oficial del proyecto es **`pnpm`** (v10+). No utilizar `npm` ni `yarn` para evitar inconsistencias en el árbol de dependencias y archivos de bloqueo (`pnpm-lock.yaml`).

---

## 2. Scripts definidos en `package.json`

| Comando | Script subyacente | Propósito y Descripción |
| :--- | :--- | :--- |
| `pnpm dev` | `nuxt dev` | Inicia el servidor de desarrollo local de Nuxt con HMR (Hot Module Replacement). Por defecto en `http://localhost:3000`. |
| `pnpm build` | `nuxt build` | Compila la aplicación para producción generando los artefactos optimizados en `.output/`. |
| `pnpm preview` | `nuxt preview` | Levanta el servidor local de producción emulando el entorno final a partir del build en `.output/`. |
| `pnpm postinstall` | `nuxt prepare` | Genera los tipos de Nuxt y sincroniza `.nuxt/tsconfig.json` tras instalar dependencias. Se ejecuta automáticamente con `pnpm install`. |
| `pnpm env:guias` | `cp .env-guias .env && nuxi cleanup` | Cambia el entorno a Guías (`laguialinux.com`) y limpia la caché de Nuxt/Nitro. |
| `pnpm env:noticias` | `cp .env-noticias .env && nuxi cleanup` | Cambia el entorno a Noticias (`news.laguialinux.com`) y limpia la caché de Nuxt/Nitro. |

---

## 3. Comandos de utilidad Nuxt / Nuxi

| Comando | Propósito |
| :--- | :--- |
| `pnpm nuxi typecheck` | Ejecuta la verificación estricta de TypeScript en todo el proyecto (`vue-tsc`). |
| `pnpm nuxi cleanup` | Limpia las carpetas temporales de compilación y caché (`.nuxt`, `.output`, `.nitro`). |
| `pnpm nuxi info` | Muestra información del entorno de Nuxt, módulos detectados y versiones de dependencias. |

---

## 4. Selección de entorno Multi-Tenant en local

Para alternar entre los portales `laguialinux.com` y `news.laguialinux.com`:

```bash
# Modo La Guía Linux (Portal Principal de Guías)
pnpm env:guias
pnpm dev

# Modo La Guía Linux Noticias (Portal de Actualidad)
pnpm env:noticias
pnpm dev
```

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
