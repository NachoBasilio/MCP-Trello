# OpenSpec

Este directorio registra cambios SDD del repo y evita que la documentacion de roadmap se mezcle con estado implementado.

## Estado verificado

- El bootstrap real del servidor MCP YA existe para el alcance minimo aprobado: `src/index.ts` conecta `stdio`, `src/mcp/registry.ts` registra metadata/capacidades y `src/mcp/handlers.ts` expone solo la tool diagnostica `bootstrap.status`.
- El comando estable del repo para que OpenCode lo ejecute sin build es `npm run mcp:start`, respaldado por `package.json` y `tsx` como runner TypeScript local.
- Ese bootstrap sigue siendo deliberadamente minimo: `src/application/bootstrap.ts` informa `trelloRuntimeAvailable: false`, asi que todavia NO hay tools, resources ni adapters reales de Trello implementados.
- El cambio `trello-mcp-tool-contract` queda como trabajo downstream para extender este bootstrap existente con runtime y contrato real de Trello.

## Cambios activos

| Cambio | Fase mas avanzada observada | Estado | Dependencia |
| --- | --- | --- | --- |
| `mcp-bootstrap-opencode` | APPLY | Implementado | Base verificada del bootstrap MCP runnable sobre `stdio` |
| `trello-mcp-tool-contract` | TASKS | Downstream | Extiende `src/index.ts`, `src/mcp/registry.ts` y `src/mcp/handlers.ts` sin recrear bootstrap |

## Regla operativa

Cuando haya conflicto entre un cambio de contrato futuro y el estado real del repo, manda la evidencia verificable del repo y esa diferencia debe quedar registrada en `openspec`.
