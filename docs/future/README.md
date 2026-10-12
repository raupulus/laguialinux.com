# Funcionalidades y Arquitectura Futura (`docs/future/`)

Iniciativas, características y decisiones de evolución técnica decididas para el proyecto pero aplazadas para fases posteriores.

> **Regla permanente**: Este directorio no almacena bugs, incidencias ni deuda técnica inmediata, sino funcionalidades deliberadamente pospuestas.

---

## 1. Modo PWA y Lector Offline

- **Descripción**: Permitir la instalación del portal como Progressive Web App y cachear guías seleccionadas en IndexedDB/Service Worker para consulta sin conexión a internet en talleres o salas de servidores.
- **Motivo de aplazamiento**: Priorizar la experiencia web SSR inicial, Core Web Vitals y la indexación SEO completa.

---

## 2. Soporte de Comentarios de Lectores (Webhooks / ActivityPub)

- **Descripción**: Integración de sistema de comentarios federado o moderado para guías y noticias.
- **Motivo de aplazamiento**: El contrato de API V2 expone el flag `comments: { enabled: false }`, pero el módulo backend de comentarios comunitarios se habilitará tras la consolidación del tráfico.

---

## 3. Playground Interactivo de Terminal WASM

- **Descripción**: Ejecución de una máquina virtual mínima Linux en WebAssembly (ej. v86 o WebVM) para probar comandos no destructivos directamente en el navegador.
- **Motivo de aplazamiento**: Evaluación de rendimiento en dispositivos móviles y peso del bundle estático.

---
> Creado: 2026-10-12 · Última revisión: 2026-10-12
