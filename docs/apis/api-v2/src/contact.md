# Contrato API V2 — Mensajes de contacto (Contact)

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
- **Ruta inexistente**: cualquier método/URL que no esté documentado responde
  `404` con `{ "success": false, "message": "API V2 - Endpoint no encontrado" }`
  (el contrato es la pareja método+ruta, no hay 405).

---

## Mensajes de contacto (`/contact-messages`)

El recurso es el mensaje, no la acción de enviarlo. La respuesta es **siempre
la misma** tanto si el mensaje se reenvía al dueño de la plataforma como si
se queda solo guardado por parecer dudoso: no se revela al remitente si un
mensaje parece spam para evitar ataques dirigidos o sustos innecesarios.

### `POST /contact-messages` — Enviar un mensaje de contacto

- **Auth**: no requiere autenticación.
- **Rate limit**: `contact` — **5 peticiones/hora por IP** (`RATE_LIMIT_CONTACTO`). Superado el límite, responde `429`.
- **Body**:

| Campo | Tipo | Reglas |
|---|---|---|
| `name` | string | `required`, máx. 255 |
| `email` | string | `required`, formato email, máx. 255 |
| `subject` | string | `required`, máx. 255 |
| `message` | string | `required`, mín. 10, máx. 5000 |
| `privacity` | boolean | opcional (`sometimes`) — aceptación de la política de privacidad |
| `contactme` | boolean | opcional (`sometimes`) — consentimiento para que le respondan |
| `attributes` | array | opcional (`sometimes`), máx. 20 claves. Campos libres que añada cada web (teléfono, empresa…) |
| `attributes.*` | string\|null | máx. 255 cada valor |
| `g-recaptcha-response` | string | Token de Google reCAPTCHA v3. Ver «Captcha» abajo |
| `recaptcha_token` | string | Alias de `g-recaptcha-response` |
| `cf-turnstile-response` | string | Token de Cloudflare Turnstile (el campo inyectado por su widget) |
| `turnstile_token` | string | Alias de `cf-turnstile-response` |

#### Captcha y Verificación de Seguridad
El formulario puede mandar el token de **Turnstile** o el de **reCAPTCHA v3** (en cualquiera de sus alias).
- Si llegan los dos, tiene prioridad **Turnstile**.
- Con algún proveedor configurado en el servidor, hace falta al menos un token; si falta, responde `422` con error en `g-recaptcha-response` (*"Falta la verificación de seguridad."*).
- Con ningún proveedor configurado (entornos de desarrollo o test locales), ningún token es obligatorio.

- **Respuesta 201**:

```json
{
  "success": true,
  "message": "Mensaje recibido correctamente",
  "data": null
}
```

- **Errores**:
  - `422` validación de los campos del formulario.
  - `422` con mensaje `"Verificacion de seguridad fallida"` si el token de captcha no supera la validación con Google o Cloudflare.
  - `429` al superar el límite de 5 peticiones por hora por IP.

---

## Buzón y Metadatos de Contacto de la Plataforma

- **Buzón oficial de la plataforma**: `public@laguialinux.com`
- **Autor y Administrador**: Raúl Caro Pastorino (`@raupulus`, `https://raupulus.dev`, email del autor: `public@raupulus.dev`).



---
> Creado: 2026-10-11 · Última revisión: 2026-10-12
