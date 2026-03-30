## Scope

Estas reglas aplican dentro de `src/mcp/` y sus subcarpetas.

## Objetivo de la carpeta

`src/mcp/` concentra el wiring del protocolo MCP: metadata del servidor, registry de capacidades y handlers que traducen al layer de application.

## Reglas especificas

- Mantener esta capa libre de imports directos a `src/infrastructure/trello/`.
- Los handlers traducen requests/responses; no meten logica de negocio ni lectura cruda de entorno.
- El registry define metadata y registro de capacidades, pero no arranca transportes.
- Toda capacidad nueva debe explicitar si es tool, resource o prompt y quedar alineada con el estado real del repo.

## Checklist rapido

- [ ] La metadata del servidor no promete mas de lo implementado.
- [ ] Los handlers solo consumen contratos de `src/application/`.
- [ ] No hay side effects fuera del entrypoint.
