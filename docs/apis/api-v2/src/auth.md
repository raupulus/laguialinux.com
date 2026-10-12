# Contrato API V2 — Autenticación y usuario (Auth)

> Este archivo documenta **solo el contrato HTTP** de este módulo: rutas, auth,
> parámetros y forma exacta de la respuesta. Está pensado para copiarse a otro
> proyecto (o pegarse en el contexto de una IA) y que con eso baste para
> integrar estos endpoints sin leer el código fuente.

## Base y convenciones comunes a toda la API V2

- **Base URL**: `/api/v2`
- **Todas las respuestas** usan este envelope (`ApiResponseTrait`):

  ```json
  // Éxito
  { "success": true, "message": "Operación exitosa", "data": { ... } }
  // Error
  { "success": false, "message": "Descripción del error", "errors": { "campo": ["detalle"] } }
  ```

  `errors` solo aparece si hay detalle (p. ej. errores de validación 422). Un
  borrado (204) no lleva cuerpo en absoluto.
- **Autenticación**: Laravel Sanctum, cabecera `Authorization: Bearer <token>`.
  Hay dos familias de token que nunca se mezclan:
  - **Token de sesión** (ability `session`): lo emite este módulo. Es el que
    usa una persona desde una app/web propia.
  - **Token de dispositivo IoT** (abilities de módulo: `energy:write`,
    `weatherstation:write`, etc. + `device:{id}`): se emite desde aquí mismo
    (`POST /auth/tokens/devices`) pero se usa contra los demás módulos, nunca
    contra las rutas de este archivo salvo que se indique.
- **Ruta inexistente**: cualquier método/URL que no esté documentado responde
  `404` con `{ "success": false, "message": "API V2 - Endpoint no encontrado" }`
  (el contrato es la pareja método+ruta, no hay 405).

---

## Tokens (`/auth/tokens`)

El token es el recurso; no hay verbos sueltos (`login`/`logout`).

### `POST /auth/tokens` — Crear un token de sesión (login)

- **Auth**: no requiere autenticación previa.
- **Rate limit**: `api-auth` — 10 peticiones/min por IP **y** 10/min por email (ambas cuentan a la vez).
- **Body**:

| Campo | Tipo | Reglas |
|---|---|---|
| `email` | string | `required`, formato email, máx. 255 |
| `password` | string | `required`, mín. 6 |

- **Respuesta 201** (cabecera `Location` → `GET /auth/tokens`):

```json
{
  "success": true,
  "message": "Token creado correctamente",
  "data": {
    "token": "1|abcdef...",
    "expires_at": "2026-09-29T12:00:00.000000Z",
    "abilities": ["session"],
    "user": {
      "id": 1,
      "name": "Raúl",
      "nickname": "raupulus",
      "email": "public@raupulus.dev",
      "role": "SuperAdmin",
      "email_verified": true,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000000Z",
      "updated_at": "2026-01-01T00:00:00.000000Z"
    }
  }
}
```

  `token` solo se ve en esta respuesta; no se puede recuperar después.
  `expires_at` sale de `auth.api_session_days` (30 días por defecto).

- **Errores**: `401` credenciales inválidas, `403` cuenta desactivada (`is_active = false`), `422` validación.

### `GET /auth/tokens` — Listar mis tokens

- **Auth**: `auth:sanctum` + `ability:session` + `throttle:api`.
- **Respuesta 200** — paginada (25 por página, orden descendente por `created_at`):

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": [
    {
      "id": 3,
      "name": "api-session",
      "abilities": ["session"],
      "device_ids": [],
      "is_device_token": false,
      "last_used_at": "2026-08-29T10:00:00.000000Z",
      "expires_at": "2026-09-29T12:00:00.000000Z",
      "is_expired": false,
      "created_at": "2026-08-30T12:00:00.000000Z"
    }
  ],
  "meta": {
    "total": 1,
    "per_page": 25,
    "current_page": 1,
    "last_page": 1,
    "from": 1,
    "to": 1
  }
}
```

### `POST /auth/tokens/devices` — Emitir un token de dispositivo IoT

- **Auth**: `auth:sanctum` + `ability:session`.
- **Autorización**: `Policy::view` sobre el `HardwareDevice` indicado.

### `DELETE /auth/tokens/current` — Cerrar la sesión actual (logout)

- **Auth**: `auth:sanctum` + `ability:session`.
- **Respuesta**: `204` sin cuerpo.

### `DELETE /auth/tokens/{token}` — Revocar otro token propio

- **Auth**: `auth:sanctum` + `ability:session`. `{token}` es el `id` numérico del token.
- **Respuesta**: `204` sin cuerpo.

---

## Usuario (`/users`)

### `GET /users/me` — Mis datos

- **Auth**: `auth:sanctum` + `ability:session`.
- **Respuesta 200**:

```json
{
  "id": 1,
  "name": "Raúl",
  "nickname": "raupulus",
  "email": "public@raupulus.dev",
  "role": "SuperAdmin",
  "email_verified": true,
  "is_active": true,
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2026-01-01T00:00:00.000000Z"
}
```

---

## Análisis de Aplicación en el Frontend de La Guía Linux

### 1. Alcance para `laguialinux.com` y `news.laguialinux.com`
- **Sin cuentas de usuario finales**: Los lectores de guías y noticias navegan de forma 100% pública y anónima. No existe registro ni inicio de sesión para el público general.
- **Sin CSRF obligatorio para lectura**: Al ser una API REST desacoplada que se consume por GET, no requiere intercambio de tokens de sesión ni CSRF en peticiones públicas.
- **Protección contra scraping y copias no autorizadas**:
  1. **Cabecera Origin / CORS**: Restricción estricta de dominios autorizados en el backend (`laguialinux.com`, `news.laguialinux.com`).
  2. **Rate Limit por IP**: El límite global de 300 peticiones/minuto frena raspados masivos.
  3. **Protección en envíos (POST)**: Turnstile / reCAPTCHA en formularios de contacto y newsletter.
- **Uso Potencial Futuro**:
  - En caso de requerir un modo "Vista Previa de Borradores" o administración rápida directamente desde la web, se utilizaría `POST /api/v2/auth/tokens` con credenciales de administrador para obtener un token con ability `session`.


---
> Creado: 2026-10-11 · Última revisión: 2026-10-12
