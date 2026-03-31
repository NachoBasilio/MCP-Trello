# OpenSpec

Este directorio registra cambios SDD del repo y evita que la documentacion de roadmap se mezcle con estado implementado.

## Estado verificado

- El servidor MCP ya expone **8 tools** y **3 resources** conectados al cliente real de Trello (`trelloRuntimeAvailable: true`).
- El comando estable del repo para que OpenCode lo ejecute sin build es `npm run mcp:start`, respaldado por `package.json` y `tsx` como runner TypeScript local.
- Ya se completaron los cambios SDD `mcp-bootstrap-opencode` y `trello-mcp-tool-contract`, dejando el servidor con soporte completo (búsqueda, comentarios, listado de boards, creación, movimiento, eliminación, y agregado de etiquetas, además de resumen, tarjetas vencidas y por label).

## Cambios activos

No hay cambios activos en progreso.

## Cambios Archivados

- `mcp-bootstrap-opencode`
- `trello-mcp-tool-contract`

## Regla operativa

Cuando haya conflicto entre un cambio de contrato futuro y el estado real del repo, manda la evidencia verificable del repo y esa diferencia debe quedar registrada en `openspec`.
