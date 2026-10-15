#!/usr/bin/env bash
set -euo pipefail

## ==============================================================================
## Script para generar el archivo .env de producción para GoCD en Odin
## ==============================================================================

WORKSCRIPT="$(pwd)"

## Comprobaciones iniciales
if [[ $(whoami) = 'root' ]]; then
    echo "❌ Error: No debes ejecutar este script como usuario root." >&2
    exit 1
fi

if [[ ! -f "${WORKSCRIPT}/package.json" ]] ||
   [[ ! -d "${WORKSCRIPT}/scripts" ]] ||
   [[ ! -f "${WORKSCRIPT}/scripts/functions.sh" ]]; then
    echo "❌ Error: Este script solo puede ser ejecutado desde la raíz del proyecto Nuxt." >&2
    exit 1
fi

## Si no existe .env.example.production, usar fallback
BASE_TEMPLATE="${WORKSCRIPT}/.env.example.production"
if [[ ! -f "${BASE_TEMPLATE}" ]]; then
    BASE_TEMPLATE="${WORKSCRIPT}/.env.example"
fi

source "${WORKSCRIPT}/scripts/functions.sh"

echo "⚙️  Generando archivo .env a partir de ${BASE_TEMPLATE}..."

## Sobrescribir siempre para asegurar sincronización limpia con GoCD
cp "${BASE_TEMPLATE}" "${WORKSCRIPT}/.env"
chmod ug+rw "${WORKSCRIPT}/.env"

## 1. Variables de Entorno de Sistema / Build
replace_or_add_var_in_file "${WORKSCRIPT}/.env" 'NODE_ENV' "${NODE_ENV:-production}"
replace_or_add_var_in_file "${WORKSCRIPT}/.env" 'PATHNAME' "${PATHNAME:-www.laguialinux.com}"

## 2. Variables de Identidad y Metadatos de la Plataforma
replace_or_add_var_in_file "${WORKSCRIPT}/.env" 'NUXT_PUBLIC_PLATFORM_SLUG' "${NUXT_PUBLIC_PLATFORM_SLUG:-laguialinux}"
replace_or_add_var_in_file "${WORKSCRIPT}/.env" 'NUXT_PUBLIC_PLATFORM_DOMAIN' "${NUXT_PUBLIC_PLATFORM_DOMAIN:-laguialinux.com}"
replace_or_add_var_in_file "${WORKSCRIPT}/.env" 'NUXT_PUBLIC_PLATFORM_NAME' "${NUXT_PUBLIC_PLATFORM_NAME:-La Guía Linux}"
replace_or_add_var_in_file "${WORKSCRIPT}/.env" 'NUXT_PUBLIC_PLATFORM_TAGLINE' "${NUXT_PUBLIC_PLATFORM_TAGLINE:-Portal de Guías, Tutoriales y Referencia Técnica de GNU/Linux}"

## 3. Endpoint de la API REST Backend
replace_or_add_var_in_file "${WORKSCRIPT}/.env" 'NUXT_PUBLIC_API_BASE_URL' "${NUXT_PUBLIC_API_BASE_URL:-https://api.raupulus.dev/api/v2}"

## 4. Paleta Visual ('emerald' para Guías, 'orange' para Noticias)
replace_or_add_var_in_file "${WORKSCRIPT}/.env" 'NUXT_PUBLIC_THEME_ACCENT' "${NUXT_PUBLIC_THEME_ACCENT:-emerald}"

## 5. Activación / Desactivación de Módulos Especializados
replace_or_add_var_in_file "${WORKSCRIPT}/.env" 'NUXT_PUBLIC_FEATURES_TOOLS' "${NUXT_PUBLIC_FEATURES_TOOLS:-true}"
replace_or_add_var_in_file "${WORKSCRIPT}/.env" 'NUXT_PUBLIC_FEATURES_CVE_ALERTS' "${NUXT_PUBLIC_FEATURES_CVE_ALERTS:-false}"
replace_or_add_var_in_file "${WORKSCRIPT}/.env" 'NUXT_PUBLIC_FEATURES_KERNEL_WATCHER' "${NUXT_PUBLIC_FEATURES_KERNEL_WATCHER:-false}"

## 6. Variables Opcionales (AdSense)
if [[ -n "${NUXT_PUBLIC_ADSENSE_CLIENT_ID:-}" ]]; then
    replace_or_add_var_in_file "${WORKSCRIPT}/.env" 'NUXT_PUBLIC_ADSENSE_CLIENT_ID' "${NUXT_PUBLIC_ADSENSE_CLIENT_ID}"
fi

echo "✅ Archivo .env generado exitosamente para [${NUXT_PUBLIC_PLATFORM_NAME:-La Guía Linux}] (${PATHNAME:-www.laguialinux.com})."
