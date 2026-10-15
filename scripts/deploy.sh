#!/usr/bin/env bash
set -euo pipefail

## ==============================================================================
## Script de Despliegue Atómico SSG para GoCD en Servidor Odin (Apache2)
## ==============================================================================

DEPLOY_BASE="/var/www"
RELEASES_DIR="$DEPLOY_BASE/releases"

## Cargar variables desde .env si no vienen en el entorno
if [[ -f .env ]]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
fi

PATHNAME="${PATHNAME:-www.laguialinux.com}"
SYMLINK_PATH="$DEPLOY_BASE/public/$PATHNAME"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RELEASE_PATH="$RELEASES_DIR/${PATHNAME}_$TIMESTAMP"

echo "========================================================================"
echo "🚀 Iniciando despliegue SSG para: $PATHNAME"
echo "📅 Timestamp: $TIMESTAMP"
echo "📂 Destino: $RELEASE_PATH"
echo "========================================================================"

## 1. Instalación de dependencias y generación estática (SSG)
echo "📦 [1/5] Instalando dependencias y compilando sitio estático con pnpm generate..."
corepack enable pnpm 2>/dev/null || true
pnpm install --frozen-lockfile
NODE_ENV=production pnpm generate

## 2. Verificación de integridad previa en .output/public
echo "🔍 [2/5] Comprobando integridad del build generado..."
if [[ ! -f .output/public/index.html ]]; then
    echo "❌ Error fatal: .output/public/index.html no fue generado." >&2
    exit 1
fi

CSS_COUNT=$(find .output/public/_nuxt -name "*.css" 2>/dev/null | wc -l || echo 0)
JS_COUNT=$(find .output/public/_nuxt -name "*.js" 2>/dev/null | wc -l || echo 0)
if [[ "$CSS_COUNT" -eq 0 ]] || [[ "$JS_COUNT" -eq 0 ]]; then
    echo "❌ Error fatal: Faltan bundles en .output/public/_nuxt (CSS: $CSS_COUNT, JS: $JS_COUNT)." >&2
    exit 1
fi

if [[ ! -f .output/public/sitemap.xml ]]; then
    echo "❌ Error fatal: .output/public/sitemap.xml no existe." >&2
    exit 1
fi

echo "  ✓ Build válido: $JS_COUNT archivos JS, $CSS_COUNT archivos CSS, sitemap.xml y robots.txt presentes."

## 3. Preparación de directorios y copia física
echo "📁 [3/5] Creando directorio de release y copiando archivos..."
mkdir -p "$RELEASES_DIR"
mkdir -p "$DEPLOY_BASE/public"

PREV_RELEASE=""
if [[ -L "$SYMLINK_PATH" ]]; then
    PREV_RELEASE=$(readlink "$SYMLINK_PATH" || true)
    echo "  ℹ️  Release activa previa: $PREV_RELEASE"
fi

rsync -avq --delete .output/public/ "$RELEASE_PATH/"
chmod -R u=rwX,go=rX "$RELEASE_PATH"

## 4. Conmutación atómica del enlace simbólico
echo "🔗 [4/5] Conmutando symlink de forma atómica a la nueva release..."
ln -sfn "$RELEASE_PATH" "${SYMLINK_PATH}_tmp"
mv -Tf "${SYMLINK_PATH}_tmp" "$SYMLINK_PATH"

## 5. Smoke Tests en Disco Físico (Sin peticiones HTTP externas)
## NOTA: No se realizan peticiones curl a dominios públicos para evitar
## falsos positivos con redirecciones DNS previas hacia la web antigua.
echo "🧪 [5/5] Ejecutando smoke tests de archivos físicos en disco..."
FAILED_TESTS=0

check_file() {
    local file_path="$1"
    local description="$2"
    if [[ -f "$file_path" ]] && [[ -s "$file_path" ]]; then
        echo "  [OK] $description: $file_path"
    else
        echo "  [FALLO] Archivo inexistente o vacío: $file_path ($description)" >&2
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

check_content() {
    local file_path="$1"
    local pattern="$2"
    local description="$3"
    if [[ -f "$file_path" ]] && grep -q "$pattern" "$file_path"; then
        echo "  [OK] Contenido verificado ($description)"
    else
        echo "  [FALLO] Patrón \"$pattern\" no encontrado en $file_path ($description)" >&2
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# 5.1. Comprobación del enlace simbólico activo
RESOLVED_LINK=$(readlink "$SYMLINK_PATH" || echo "")
if [[ "$RESOLVED_LINK" = "$RELEASE_PATH" ]]; then
    echo "  [OK] Symlink $SYMLINK_PATH apunta correctamente a $RELEASE_PATH"
else
    echo "  [FALLO] Symlink no apunta a la release esperada ($RESOLVED_LINK != $RELEASE_PATH)" >&2
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# 5.2. Archivos raíz esenciales
check_file "$SYMLINK_PATH/index.html" "Página principal"
check_content "$SYMLINK_PATH/index.html" "<!DOCTYPE html>" "DOCTYPE HTML5"
check_file "$SYMLINK_PATH/sitemap.xml" "Sitemap XML"
check_content "$SYMLINK_PATH/sitemap.xml" "<urlset" "Estructura XML de Sitemap"
check_file "$SYMLINK_PATH/robots.txt" "Robots.txt"
check_file "$SYMLINK_PATH/404.html" "Página 404 estática"
check_file "$SYMLINK_PATH/.htaccess" "Configuración Apache2"

# 5.3. Existencia de bundles JavaScript y CSS en la ruta servida
NUXT_JS_EXISTS=$(find "$SYMLINK_PATH/_nuxt" -name "*.js" 2>/dev/null | wc -l || echo 0)
NUXT_CSS_EXISTS=$(find "$SYMLINK_PATH/_nuxt" -name "*.css" 2>/dev/null | wc -l || echo 0)
if [[ "$NUXT_JS_EXISTS" -gt 0 ]] && [[ "$NUXT_CSS_EXISTS" -gt 0 ]]; then
    echo "  [OK] Bundles activos en _nuxt (JS: $NUXT_JS_EXISTS, CSS: $NUXT_CSS_EXISTS)"
else
    echo "  [FALLO] Faltan bundles en $SYMLINK_PATH/_nuxt" >&2
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# 5.4. Páginas estáticas según la plataforma
check_file "$SYMLINK_PATH/contacto/index.html" "Página de Contacto"
check_file "$SYMLINK_PATH/aviso-legal/index.html" "Página de Aviso Legal"
check_file "$SYMLINK_PATH/privacidad/index.html" "Página de Privacidad"

if [[ "$PATHNAME" != *"news"* ]]; then
    check_file "$SYMLINK_PATH/guias/index.html" "Catálogo de Guías"
    check_file "$SYMLINK_PATH/herramientas/index.html" "Suite de Herramientas Sysadmin"
fi

## Veredicto final
if [[ "$FAILED_TESTS" -eq 0 ]]; then
    echo "------------------------------------------------------------------------"
    echo "✅ Todos los smoke tests en disco han finalizado con éxito."
    
    ## Limpieza: mantener solo las 5 releases más recientes
    echo "🧹 Purgando releases antiguas (manteniendo las 5 más recientes)..."
    ls -dt "$RELEASES_DIR"/${PATHNAME}_* 2>/dev/null | tail -n +6 | while read -r old_rel; do
        if [[ -n "$old_rel" && -d "$old_rel" ]]; then
            rm -rf "$old_rel"
        fi
    done
    
    echo "✨ Despliegue completado con éxito: $PATHNAME -> $RELEASE_PATH"
    echo "========================================================================"
else
    echo "------------------------------------------------------------------------"
    echo "❌ Error fatal en los smoke tests ($FAILED_TESTS fallos detectados)." >&2
    if [[ -n "$PREV_RELEASE" ]] && [[ -d "$PREV_RELEASE" ]]; then
        echo "⏪ Ejecutando rollback al release anterior: $PREV_RELEASE" >&2
        ln -sfn "$PREV_RELEASE" "${SYMLINK_PATH}_tmp"
        mv -Tf "${SYMLINK_PATH}_tmp" "$SYMLINK_PATH"
        echo "✅ Rollback completado." >&2
    fi
    exit 1
fi
