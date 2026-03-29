## Scope

Estas reglas aplican dentro de `src/` excepto cuando exista un `AGENTS.md` mas especifico en una subcarpeta.

## Objetivo de la carpeta

`src/` contiene la implementacion del servidor MCP separada por capas para evitar acoplar dominio, runtime y transporte.

## Reglas especificas

- Mantener imports con extension `.js` en archivos TypeScript para respetar `NodeNext`.
- `src/shared/` solo expone utilidades transversales agnosticas de Trello y de MCP.
- `src/config/` encapsula lectura y validacion de entorno; no debe mezclar handlers, SDKs ni llamadas HTTP.
- Evitar side effects fuera de `src/config/` y del entrypoint; si hace falta cargar entorno, centralizarlo ahi.
- Todo JSDoc nuevo o modificado debe escribirse en espanol.

## Checklist rapido

- [ ] La pieza nueva respeta el corte por capas.
- [ ] Los exports publicos son chicos y explicitamente tipados.
- [ ] La configuracion falla temprano con mensajes accionables.
