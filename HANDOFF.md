# Handoff de continuidad

## Estado al apagar esta PC

- Fecha: 2026-03-31
- Rama de trabajo: `dev`
- Base actual: `dev` y `main` están sincronizados con `origin/dev` y `origin/main`.
- Objetivo del lote: completar los resources MCP pendientes (board-summary, board-overdue, board-by-label).

## Que se hizo en esta sesion

1. **Actualización de ramas**: Se hizo merge de `dev` a `main` y se sincronizaron ambas ramas con los remotos.
2. **Implementación de Layer 4 Resources**: Se completaron las tareas 4.6, 4.7 y 4.8:
   - `src/mcp/resources/board-summary.ts` - Resource para resumen de board
   - `src/mcp/resources/board-overdue.ts` - Resource para tarjetas vencidas
   - `src/mcp/resources/board-by-label.ts` - Resource para tarjetas por label
3. **Wiring completo**: Se actualizaron los archivos:
   - `src/mcp/handlers.ts` - Se agregaron los 3 resources al tipo `BootstrapHandlers`
   - `src/mcp/registry.ts` - Se agregaron capabilities de resources y el registro de los 3 resources
   - `src/application/bootstrap.ts` - Se agregaron los use cases al runtime
   - `src/index.ts` - Se agregaron los use cases al wiring
4. **Tests actualizados**: Se corrigieron los tests de:
   - `tests/unit/mcp/registry.test.ts` - Ahora verifica 7 tools + 3 resources
   - `tests/unit/mcp/handlers.test.ts` - Ahora verifica los 10 handlers (7 tools + 3 resources)
   - `tests/integration/bootstrap/index.test.ts` - Se agregó mock de ResourceTemplate y registerResource
5. **Board resolution + retries**: Se consolidó la precedencia `boardId > boardName normalizado > default > autodiscovery` y se agregó un helper de reintentos (1s/2s/4s) reutilizado por todas las APIs.
6. **Docs alineadas**: README/Handoff/spec reflejan que el runtime Trello ya existe y que lo pendiente es la capa de tests.

## Donde quedamos parados

### Implementado

- ✅ Todos los tools MCP (7): bootstrap.status, trello_search_cards, trello_add_comment, trello_list_boards, trello_create_card, trello_move_card, trello_add_labels
- ✅ Todos los resources MCP (3): board-summary, board-overdue, board-by-label
- ✅ Todos los use cases de aplicación (10)
- ✅ Toda la infraestructura (adapter, APIs, mappers, fixtures)
- ✅ Todo el dominio (entities, value objects, errors)
- ✅ Typecheck pasa sin errores
- ✅ Todos los tests pasan (105 tests)

### Pendiente importante

- El Layer 5 de pruebas sigue abierto: faltan unit tests adicionales, contract tests (create-card, move-card) e integración completa para cada tool/resource.
- Aún quedan escenarios por cubrir en tests automatizados para rate limit telemetry y búsqueda (por ejemplo, slice boundaries del search tool).

## Como retomar rápido en la otra PC

1. Abrir `HANDOFF.md`.
2. Revisar `openspec/changes/trello-mcp-tool-contract/tasks.md` para ver qué items quedaron marcados y cuáles siguen pendientes.
3. Continuar con Layer 5: unit + contract + integration según `openspec/changes/trello-mcp-tool-contract/tasks.md`.
4. Una vez que Layer 5 esté cubierto, correr checklist de release y preparar PR final.

## Archivos más relevantes del lote

- `src/mcp/resources/board-summary.ts`
- `src/mcp/resources/board-overdue.ts`
- `src/mcp/resources/board-by-label.ts`
- `src/mcp/resources/index.ts`
- `src/mcp/handlers.ts`
- `src/mcp/registry.ts`
- `src/application/bootstrap.ts`
- `src/index.ts`
- `tests/unit/mcp/registry.test.ts`
- `tests/unit/mcp/handlers.test.ts`
- `tests/integration/bootstrap/index.test.ts`
- `openspec/changes/trello-mcp-tool-contract/tasks.md`

## Nota operativa

El servidor MCP expone 7 tools y 3 resources, con board resolution completa y backoff ante 429. Todos los tests actuales (105) pasan. El siguiente paso es cubrir Layer 5 según el plan SDD antes de preparar release.

Este archivo existe para no perder contexto si se corta la sesión o se apaga la máquina.
