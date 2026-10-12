# Sistema de Diseño y Tokens UI

Tokens de diseño, paletas de color, tipografía y reglas visuales del frontend Nuxt de La Guía Linux (`laguialinux.com` y `news.laguialinux.com`).

---

## 1. Fundamentos y Filosofía

- **Enfoque Dark First**: El ecosistema está diseñado con una base oscura profunda (`#080c14`), minimizando fatiga visual y optimizando el contraste para lectores técnicos y de código.
- **Identidad Dual por Plataforma**:
  - **Portal de Guías (`laguialinux.com`)**: Acentos Verde Esmeralda / Terminal (`#00ff66`, `#10b981`). Evoca terminales POSIX, éxito en ejecución y precisión técnica.
  - **Portal de Noticias (`news.laguialinux.com`)**: Acentos Naranja / Tech (`#f97316`, `#ea580c`). Evoca actualidad, dinamismo editorial y breaking news.
- **Rendimiento y Cero CLS**: Estructuras sólidas, dimensiones explícitas en activos multimedia y componentes con slots fijos para evitar saltos de maquetación.

---

## 2. Paleta de Colores (Tokens CSS @theme Tailwind v4)

Definidos en `assets/css/main.css`:

### 2.1. Superficies y Fondo (Comunes)

| Token CSS | Clase Tailwind v4 | Valor Hex | Uso |
| :--- | :--- | :--- | :--- |
| `--color-dark-bg` | `bg-dark-bg` | `#080c14` | Fondo principal de la ventana y body. |
| `--color-dark-card` | `bg-dark-card` | `#0b0f17` | Fondo de tarjetas, bloques secundarios y listados. |
| `--color-dark-surface` | `bg-dark-surface` | `#0f172a` | Superficies elevadas, dropdowns, tooltips y modales. |
| `--color-dark-border` | `border-dark-border` | `#1e293b` | Bordes sutiles, divisores y contornos de tarjetas. |

### 2.2. Acentos Guías (`laguialinux.com`)

| Token CSS | Clase Tailwind v4 | Valor Hex | Uso |
| :--- | :--- | :--- | :--- |
| `--color-brand-emerald` | `text-brand-emerald`, `bg-brand-emerald` | `#00ff66` | Acento vibrante, focus, estados activos y badges destacados. |
| `--color-brand-emerald-dark` | `text-brand-emerald-dark`, `bg-brand-emerald-dark` | `#10b981` | Botones primarios, enlaces con hover y acentos atenuados. |

### 2.3. Acentos Noticias (`news.laguialinux.com`)

| Token CSS | Clase Tailwind v4 | Valor Hex | Uso |
| :--- | :--- | :--- | :--- |
| `--color-brand-orange` | `text-brand-orange`, `bg-brand-orange` | `#f97316` | Acento primario de noticias, tickers de última hora y badges. |
| `--color-brand-orange-dark` | `text-brand-orange-dark`, `bg-brand-orange-dark` | `#ea580c` | Hover de botones y estados interactivos en noticias. |

---

## 3. Tipografía

| Token CSS | Familia | Peso habitual | Uso |
| :--- | :--- | :--- | :--- |
| `--font-heading` | `Plus Jakarta Sans` | 600, 700, 800 | Títulos principales (H1, H2, H3), cabeceras y logotipos. |
| `--font-sans` | `Inter`, system-ui | 400, 500, 600 | Cuerpo de texto, párrafos, metadatos y navegación. |
| `--font-mono` | `JetBrains Mono`, monospace | 400, 500 | Comandos de terminal, código en línea, rutas y snippets. |

---

## 4. Iconografía

Implementada mediante el módulo oficial `@nuxt/icon` con renderizado SVG limpio bajo demanda vía Iconify (colección recomendada: `lucide:*` y `heroicons:*`).

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
