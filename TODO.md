# TODO del lote actual

## Ramas de trabajo desde `dev`

- [x] `feat/trello-list-columns` - Exponer columnas (listas) con ID para evitar mover por nombre ambiguo.
- [x] `feat/trello-label-color` - Preparar rama para tool de cambio de color de labels.

## Tareas del feature 1 (`feat/trello-list-columns`)

- [x] Crear use case para listar columnas de un board resolviendo `boardId`/`boardName`.
- [x] Agregar tool MCP `trello_list_columns` con salida estructurada (`id`, `name`).
- [x] Permitir `toListId` en `trello_move_card` para evitar crear listas por typo.
- [x] Actualizar registry/bootstrap/handlers con metadata honesta (10 tools).
- [ ] Cerrar docs finales y abrir PR a `dev`.

## Tareas del feature 2 (`feat/trello-label-color`)

- [x] Diseñar contrato de tool para cambiar color de labels existentes.
- [x] Implementar caso de uso + adapter Trello para update de color.
- [x] Agregar handler MCP + wiring en registry/bootstrap.
- [x] Cubrir pruebas unitarias de application y mcp.
- [ ] Abrir PR a `dev`.
