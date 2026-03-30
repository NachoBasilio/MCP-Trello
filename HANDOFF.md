# Handoff de continuidad

## Estado al apagar esta PC

- Fecha: 2026-03-30
- Rama de trabajo: `feat/trello-mcp-tools`
- Base actual: `dev` y `origin/dev` estaban en `03028e6` antes de commitear estos cambios.
- Objetivo del lote: cerrar el slice minimo de `trello_search_cards` + `trello_add_comment` sobre el bootstrap MCP existente.

## Que se venia haciendo

Se estaba avanzando el cambio `openspec/changes/trello-mcp-tool-contract/` para que el repo deje de ser solo bootstrap diagnostico y pase a exponer dos capacidades Trello reales:

1. `trello_search_cards`
2. `trello_add_comment`

La implementacion agregada en este lote apunta a:

- puertos de aplicacion minimos en `src/application/ports.ts`
- caso de uso de busqueda en `src/application/search-cards.ts`
- caso de uso de comentario en `src/application/add-comment.ts`
- adapter Trello minimo en `src/infrastructure/trello/adapter.ts`
- contratos runtime en `src/types/tool-contract.ts`
- tools MCP en `src/mcp/tools/search-cards.ts` y `src/mcp/tools/add-comment.ts`
- wiring en `src/application/bootstrap.ts`, `src/mcp/handlers.ts`, `src/mcp/registry.ts` y `src/index.ts`
- pruebas unitarias/integracion para application, adapter, handlers, registry y bootstrap

## Donde quedamos parados

## Implementado

- `trello_search_cards` ya tiene vertical slice desde schema -> handler -> use case -> adapter.
- `trello_add_comment` ya tiene vertical slice minima con soporte por `cardId` o resolucion por `cardName`.
- El bootstrap local sigue exponiendo `bootstrap.status` y ahora suma las dos capacidades Trello reales del lote.
- La documentacion de `openspec` fue actualizada para dejar evidencia de que hoy NO existe el servidor Trello completo: solo search y add-comment.

## Pendiente importante

- La estrategia completa de resolucion por `boardName` todavia no esta cerrada en runtime.
- El adapter actual resuelve `boardId` explicito o `TRELLO_DEFAULT_BOARD_ID`, pero NO implementa aun el flujo completo documentado en spec para:
  - `boardName` normalizado
  - autodiscovery con `GET /1/members/{id}/boards`
  - error deterministico por board ambiguo
- Quedan muchas tareas abiertas del cambio `trello-mcp-tool-contract` fuera de este slice: create-card, move-card, add-labels y resources.

## Como retomar rapido en la otra PC

1. Abrir `HANDOFF.md`.
2. Revisar `openspec/changes/trello-mcp-tool-contract/tasks.md` para ver que items quedaron marcados y cuales siguen pendientes.
3. Seguir desde el gap de board resolution, porque es el hueco mas importante entre docs y runtime.
4. Validar despues los tests de `tests/unit/application/`, `tests/unit/infrastructure/trello/`, `tests/unit/mcp/` y `tests/integration/bootstrap/`.

## Archivos mas relevantes del lote

- `src/application/ports.ts`
- `src/application/search-cards.ts`
- `src/application/add-comment.ts`
- `src/infrastructure/trello/adapter.ts`
- `src/types/tool-contract.ts`
- `src/mcp/tools/search-cards.ts`
- `src/mcp/tools/add-comment.ts`
- `src/mcp/handlers.ts`
- `src/mcp/registry.ts`
- `src/index.ts`
- `openspec/changes/trello-mcp-tool-contract/proposal.md`
- `openspec/changes/trello-mcp-tool-contract/spec.md`
- `openspec/changes/trello-mcp-tool-contract/design.md`
- `openspec/changes/trello-mcp-tool-contract/tasks.md`

## Nota operativa

Si la idea es dejar esto realmente alineado con `dev`, el camino seguro es:

1. commitear este lote en `feat/trello-mcp-tools`
2. empujar la rama remota
3. fast-forward o mergear `dev` con ese commit
4. empujar `dev`

Este archivo existe para no perder contexto si se corta la sesion o se apaga la maquina.
