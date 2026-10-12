# La Guía Linux · Frontend Nuxt 3 / 4

Portal web oficial del ecosistema **La Guía Linux** (`laguialinux.com` y `news.laguialinux.com`), construido sobre **Nuxt 3/4**, **Vue 3**, **Tailwind CSS v4**, **Pinia** y **TypeScript estricto**.

---

## 1. Arquitectura Multi-Tenant

El proyecto está diseñado como una **única base de código** parametrizable mediante variables de entorno para servir a los dos portales:

| Portal | Dominio | Plataforma Slug | Tema Visual | Archivo Env |
| :--- | :--- | :--- | :--- | :--- |
| **La Guía Linux** | `laguialinux.com` | `laguialinux` | `emerald` | `.env.example` |
| **Noticias La Guía Linux** | `news.laguialinux.com` | `news` | `orange` | `.env.news.example` |

### Alternar entre proyectos
- Para desarrollar **La Guía Linux**:
  ```bash
  cp .env.example .env
  ```
- Para desarrollar **Noticias**:
  ```bash
  cp .env.news.example .env
  ```

---

## 2. Pila Tecnológica

- **Framework**: [Nuxt 4 / 3](https://nuxt.com/) (`^4.6.1`)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/) vía `@tailwindcss/vite`
- **Iconos**: [`@nuxt/icon`](https://nuxt.com/modules/icon) (Iconify on-demand: Lucide, Heroicons, etc.)
- **Estado Global**: [Pinia](https://pinia.vuejs.org/) (`pinia` + `@pinia/nuxt`)
- **Tipado**: TypeScript estricto con interfaces compartidas en `types/`
- **API Client**: Composable tipado `useApiClient` configurado para `http://localhost:8000/api/v2`

---

## 3. Estructura de Directorios

```text
├── assets/         # Estilos globales (main.css con @theme Tailwind v4) y fuentes
├── components/     # Componentes Vue reutilizables
├── composables/    # usePlatform, useApiClient y lógica compartida
├── layouts/        # Plantillas de diseño (default.vue)
├── pages/          # Rutas y páginas de la aplicación
├── public/         # Recursos estáticos (favicon, robots.txt)
├── stores/         # Stores de Pinia (navigation.ts)
├── types/          # Interfaces TypeScript compartidas (api, platform, content, category, tag)
├── utils/          # Funciones de utilidad pura (formateadores, slugify)
├── nuxt.config.ts  # Configuración central de Nuxt y RuntimeConfig
└── package.json
```

---

## 4. Instalación y Desarrollo

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Compilar para producción
pnpm build

# Previsualizar build de producción
pnpm preview
```

---

## 5. Licencia

- **Código**: GNU Affero General Public License v3.0 (GNU AGPLv3)
- **Contenidos**: Creative Commons Atribución-CompartirIgual 4.0 Internacional (CC BY-SA 4.0)
