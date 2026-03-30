# Tasks: Trello MCP Tool Contract

## Dependency Note

This task plan depends on `mcp-bootstrap-opencode` for bootstrap/source-of-truth alignment. The repository already provides the runnable `stdio` bootstrap (`src/index.ts`, `src/mcp/registry.ts`, `src/mcp/handlers.ts`, `src/application/bootstrap.ts`) plus shared/config foundations, so this change MUST extend that baseline instead of recreating it.

## Layer 1: Domain

- [x] 1.1 Create `src/domain/errors/DomainError.ts` with `ErrorCode` enum and `DomainError` class
- [x] 1.2 Create `src/domain/entities/Card.ts` with Card entity (id, name, description, due, listId, boardId, labels, url)
- [x] 1.3 Create `src/domain/entities/Board.ts` with Board entity (id, name)
- [x] 1.4 Create `src/domain/entities/Label.ts` with Label entity (id, name, color)
- [x] 1.5 Create `src/domain/entities/List.ts` with List entity (id, name, boardId)
- [x] 1.6 Create `src/domain/entities/Comment.ts` with Comment entity (id, text, creator, date)
- [x] 1.7 Create `src/domain/value-objects/CardQuery.ts` with CardQuery VO and substring matching logic
- [x] 1.8 Create `src/domain/value-objects/ListName.ts` with ListName VO with validation
- [x] 1.9 Create `src/domain/value-objects/LabelName.ts` with LabelName VO with validation
- [x] 1.10 Create `src/domain/index.ts` re-exporting all domain entities, VOs, and errors

## Layer 2: Infrastructure

- [x] 2.1 Reuse the existing `src/shared/index.ts` foundation and extend it only if Trello runtime needs additional shared helpers
- [x] 2.2 Reuse the existing `src/config/index.ts` env validation and extend it only if Trello runtime requires extra configuration beyond the bootstrap baseline
- [x] 2.3 Create `src/infrastructure/trello/fixtures.ts` with test fixtures for Trello API payloads
- [x] 2.4 Create `src/infrastructure/trello/mappers.ts` with TrelloDto → Domain entity mappers
- [x] 2.5 Create `src/infrastructure/trello/board-api.ts` with board-related Trello API calls
- [x] 2.6 Create `src/infrastructure/trello/list-api.ts` with list-related Trello API calls
- [x] 2.7 Create `src/infrastructure/trello/card-api.ts` with card CRUD Trello API calls
- [x] 2.8 Create `src/infrastructure/trello/label-api.ts` with label Trello API calls
- [x] 2.9 Create `src/infrastructure/trello/comment-api.ts` with comment Trello API calls
- [x] 2.10 Create `src/infrastructure/trello/adapter.ts` with the minimum read-only adapter needed for `trello_search_cards`
- [x] 2.11 Create `src/types/tool-contract.ts` with the minimum Zod schemas needed for the implemented tool slice
- [x] 2.12 Extend `src/infrastructure/trello/adapter.ts` with board listing + deterministic board resolution support using `GET /1/members/{id}/boards` and no silent fallback from failed `boardName`

## Layer 3: Application

- [x] 3.1 Create `src/application/ports.ts` with the minimum search port required by the implemented slice
- [x] 3.2 Create `src/application/create-card.ts` with CreateCardUseCase (handles implicit list creation)
- [x] 3.3 Create `src/application/move-card.ts` with MoveCardUseCase (CardQuery matching + disambiguation)
- [x] 3.4 Create `src/application/search-cards.ts` with SearchCardsUseCase using `CardQuery` substring semantics and limit/truncation
- [x] 3.5 Create `src/application/add-labels.ts` with AddLabelsUseCase (ADD mode only, implicit label creation)
- [x] 3.6 Create `src/application/add-comment.ts` with AddCommentUseCase
- [x] 3.7 Create `src/application/board-summary.ts` with BoardSummaryUseCase
- [x] 3.8 Create `src/application/board-overdue.ts` with BoardOverdueUseCase (calculate overdueDays)
- [x] 3.9 Create `src/application/board-by-label.ts` with BoardByLabelUseCase
- [x] 3.10 Replace direct `resolveBoardId` calls in `src/application/search-cards.ts` and `src/application/add-comment.ts` with shared board-resolution input (`boardId`, `boardName`) honoring precedence and explicit board ambiguity/not-found errors

## Layer 4: MCP

- [x] 4.1 Create `src/mcp/tools/create-card.ts` with trello_create_card handler
- [x] 4.2 Create `src/mcp/tools/move-card.ts` with trello_move_card handler
- [x] 4.3 Create `src/mcp/tools/search-cards.ts` with trello_search_cards handler
- [x] 4.4 Create `src/mcp/tools/add-labels.ts` with trello_add_labels handler
- [x] 4.5 Create `src/mcp/tools/add-comment.ts` with trello_add_comment handler
- [ ] 4.6 Create `src/mcp/resources/board-summary.ts` with trello://boards/{id}/summary handler
- [ ] 4.7 Create `src/mcp/resources/board-overdue.ts` with trello://boards/{id}/overdue handler
- [ ] 4.8 Create `src/mcp/resources/board-by-label.ts` with trello://boards/{id}/by-label handler
- [x] 4.9 Extend `src/mcp/registry.ts` with the read-only search tool registration on top of the bootstrap registry introduced by `mcp-bootstrap-opencode`
- [x] 4.10 Extend `src/mcp/handlers.ts` with the search handler wired to application on top of the bootstrap handler aggregate introduced by `mcp-bootstrap-opencode`
- [x] 4.11 Extend `src/index.ts` composition wiring with the minimum Trello search dependencies while preserving the bootstrap stdio startup introduced by `mcp-bootstrap-opencode`
- [x] 4.12 Reuse `CardQuery` semantics for matching and explicitly avoid adding `fuse.js` in this batch
- [x] 4.13 Extend the existing Trello adapter/wiring with the minimum add-comment path without claiming broader write support
- [x] 4.14 Extend `src/types/tool-contract.ts`, `src/mcp/tools/search-cards.ts`, and `src/mcp/tools/add-comment.ts` so the active runtime contract accepts optional `boardName` without overstating support in other pending tools
- [x] 4.15 Create `trello_list_boards` MCP tool for listing all accessible boards (handler + use case + wiring)

## Layer 5: Testing

- [ ] 5.1 Write unit tests for `src/domain/errors.ts` - error codes and DomainError class
- [ ] 5.2 Write unit tests for `src/domain/entities/card.ts` - Card entity creation and validation
- [ ] 5.3 Write unit tests for `src/shared/index.ts` - Result type operations (ok, err, isOk, isErr)
- [ ] 5.4 Write unit tests for `src/infrastructure/trello/adapter.ts` - HTTP error mapping, rate limit handling
- [ ] 5.5 Write unit tests for `src/infrastructure/trello/mappers.ts` - DTO to entity mapping
- [ ] 5.6 Write contract tests for `src/application/create-card.ts` - implicit list creation scenario
- [ ] 5.7 Write contract tests for `src/application/move-card.ts` - disambiguation on multiple matches
- [x] 5.8 Write contract tests for `src/application/search-cards.ts` - substring matching AND logic
- [x] 5.9 Write minimum contract tests for `src/application/add-comment.ts` - empty text, name resolution, and direct cardId path
- [ ] 5.10 Write unit tests for `src/application/board-overdue.ts` - overdueDays calculation
- [ ] 5.11 Write integration tests for `src/mcp/tools/create-card.ts` - full flow from MCP call to Trello API
- [ ] 5.12 Write integration tests for `src/mcp/tools/move-card.ts` - error -32002 (ambiguous) scenario
- [ ] 5.13 Write integration tests for `src/mcp/resources/board-summary.ts` - resource response format
- [ ] 5.14 Write tests for the Trello search slice boundary - multiple terms, partial words, and limit/truncation across runtime layers
- [ ] 5.15 Add unit and contract tests for board resolution precedence: explicit `boardId` wins over `boardName`, normalized exact `boardName` match resolves deterministically, failed `boardName` does not fall back, and single-board auto-discovery triggers only when exactly one accessible board exists
- [ ] 5.16 Add ambiguous-board error coverage for both `trello_search_cards` and `trello_add_comment` when normalized board names match multiple accessible boards

## Dependencies

```
Layer 1 (Domain)
  └─ All Layer 1 tasks must complete before Layer 2

Layer 2 (Infrastructure)
  └─ 2.1 (shared), 2.2 (config) are already satisfied by the bootstrap baseline and must be reused before all other Infrastructure tasks
  └─ 2.4 (mappers) depends on 2.3 (fixtures) and Layer 1 entities
  └─ 2.10 (adapter) depends on 2.4-2.9 (all API files)
  └─ All Layer 2 must complete before Layer 3

Layer 3 (Application)
  └─ 3.1 (ports) depends on Layer 1 and Layer 2
  └─ All other application tasks depend on 3.1
  └─ All Layer 3 must complete before Layer 4

Layer 4 (MCP)
  └─ 4.1-4.8 (individual handlers) depend on Layer 3
  └─ 4.9-4.11 depend on `mcp-bootstrap-opencode` APPLY completion because bootstrap owns the initial entrypoint, registry, and handler boundaries
  └─ 4.9-4.10 (registry, handlers) depend on 4.1-4.8
  └─ 4.11 (index.ts) depends on 4.9-4.10 and 2.2 (config)

Layer 5 (Testing)
  └─ 5.1-5.5 (unit tests) depend on respective implementation files
  └─ 5.6-5.10 (contract tests) depend on Layer 3
  └─ 5.11-5.14 (integration tests) depend on Layer 4
```

## Implementation Order

1. **Start with Domain** (1.1-1.9): Entities, value objects, and errors - no external dependencies
2. **Then Infrastructure foundation reuse** (2.1-2.2): Shared utilities and config already exist from the bootstrap and should only be extended if Trello runtime requires it
3. **Then Infrastructure APIs** (2.3-2.9): Trello API calls and mappers
4. **Then Infrastructure adapter** (2.10-2.11): Main adapter and types
5. **Then Application** (3.1-3.9): Ports and all use cases
6. **Then Trello MCP capabilities** (4.1-4.10): Tool/resource handlers plus extensions to the bootstrap registry and handler aggregate
7. **Then bootstrap composition extension** (4.11-4.12): Wire Trello dependencies into the existing stdio bootstrap and reuse CardQuery matching support
8. **Finally Testing** (5.1-5.16): Unit, contract, and integration tests

## Notes

- Error codes: -32001 (BOARD_ID_REQUIRED), -32002 (CARD_AMBIGUOUS), -32003 (CARD_NOT_FOUND), -32004 (COMMENT_EMPTY), -32005 (BOARD_NOT_FOUND), -32006 (RATE_LIMITED), -32007 (TRELLO_API_ERROR), -32008 (BOARD_AMBIGUOUS)
- `mcp-bootstrap-opencode` already owns the first runnable `stdio` entrypoint and the initial diagnostic capability policy; this change extends that wiring with the read-only search slice instead of replacing it.
- The repo now also includes the minimal `trello_add_comment` write slice; metadata must keep marking create/move/add-labels/resources as still pending.
- Rate limiting: implement exponential backoff (1s, 2s, 4s) with up to 3 retries
- Board resolution precedence: `boardId` > `boardName` exact match normalizado > `TRELLO_DEFAULT_BOARD_ID` > single-board auto-discovery via `GET /1/members/{id}/boards`
- Explicit `boardName` failures must return a deterministic error and MUST NOT silently fall back to a different board
- Matching strategy: reuse `src/domain/value-objects/CardQuery.ts` (case-insensitive substring + AND logic) and do not add `fuse.js` in this batch
