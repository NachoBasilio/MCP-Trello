## Scope

Estas reglas aplican dentro de `src/application/` y sus subcarpetas.

## Objetivo de la carpeta

`src/application/` define dependencias bootstrap-safe, puertos y casos de uso agnosticos del transporte MCP y de Trello.

## Reglas especificas

- No importar el SDK de MCP en esta capa.
- No leer `process.env` ni arrancar transporte desde esta carpeta.
- Exponer contratos chicos y explicitamente tipados para que `src/mcp/` solo traduzca entrada/salida.
- Si una dependencia deja de ser bootstrap-safe, moverla a infraestructura o crear un puerto dedicado.

## Checklist rapido

- [ ] La API publicada sigue siendo agnostica de MCP.
- [ ] No hay side effects ni lecturas de entorno.
- [ ] Los contratos alcanzan para que `src/mcp/` no dependa de Trello runtime.
