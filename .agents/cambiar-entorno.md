# Prompt para Agentes: Cambio de Entorno (Guías ↔ Noticias)

Utiliza las siguientes instrucciones para cambiar de forma inmediata y limpia el contexto del frontend entre el portal de **Guías** (`laguialinux.com`) y el portal de **Noticias** (`news.laguialinux.com`).

---

## 1. Cambio a Portal de Guías (`laguialinux.com`)

```bash
# 1. Copiar configuración de Guías
cp .env-guias .env

# 2. Limpiar caché completa de Nuxt, Nitro y Vite
npx nuxi cleanup

# 3. Iniciar o reiniciar servidor de desarrollo
pnpm dev
```
O directamente con el script:
```bash
pnpm env:guias
```

**Verificación esperada**:
- `NUXT_PUBLIC_PLATFORM_SLUG` = `laguialinux`
- `NUXT_PUBLIC_THEME_ACCENT` = `emerald`
- `isGuides` = `true`, `isNews` = `false`
- Cabecera y portada muestran estilo terminal verde y contenidos de guías.

---

## 2. Cambio a Portal de Noticias (`news.laguialinux.com`)

```bash
# 1. Copiar configuración de Noticias
cp .env-noticias .env

# 2. Limpiar caché completa de Nuxt, Nitro y Vite
npx nuxi cleanup

# 3. Iniciar o reiniciar servidor de desarrollo
pnpm dev
```
O directamente con el script:
```bash
pnpm env:noticias
```

**Verificación esperada**:
- `NUXT_PUBLIC_PLATFORM_SLUG` = `news`
- `NUXT_PUBLIC_THEME_ACCENT` = `orange`
- `isGuides` = `false`, `isNews` = `true`
- Cabecera y portada muestran acento naranja tech, breaking news y alertas.

---

## 3. Reglas Críticas para el Agente
- **Nunca hardcodear** condicionales por URL en componentes cuando se pueda usar `isGuides` o `isNews` de `usePlatform()`.
- Tras cambiar `.env`, la limpieza de `.nuxt` con `nuxi cleanup` es **obligatoria** para evitar que Vite sirva fragmentos precompilados del entorno anterior.
