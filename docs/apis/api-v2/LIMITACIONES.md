# Limitaciones Conocidas de la API REST V2

Restricciones de diseño y comportamiento arquitectónico de la API V2.

---

## 1. Jerarquía de Categorías (1 Nivel de Anidado)

- La API soporta **estrictamente un único nivel de profundidad** en taxonomías:
  - Categorías Raíz (`parent === null`)
  - Subcategorías directas (`parent === "<slug-de-la-raiz>"`)
- No es posible anidar sub-subcategorías (3º nivel o superior).
- El menú de navegación debe diseñarse respetando este árbol plano de 2 niveles.

---

## 2. Identificadores Primarios por `slug`

- En endpoints de navegación (`/categories`), los recursos no exponen `id` numérico; la clave unívoca en frontend es siempre el `slug`.

---

## 3. Slugs Reservados en Contenidos

- La ruta `GET /platforms/{platform}/contents/highlights` está reservada por el enrutador para el endpoint de destacados, últimos y tendencias.
- Ningún contenido puede tener como slug `"highlights"`.

---

## 4. Techo de Paginación

- El parámetro `per_page` en colecciones paginadas tiene un valor máximo de **100 elementos**. Si se envía un valor superior, el backend lo acota a 100. El valor por defecto es 25.

---

## 5. Búsqueda de Texto (`q`)

- El parámetro `q` busca coincidencias en `title` y `excerpt`.
- No realiza búsqueda semántica ni de vector embeddings en el cuerpo completo de las páginas secundarias.

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
