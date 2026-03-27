# Tasks: Trello MCP Tool Contract

## Layer 1: Domain

- [x] 1.1 Create `src/domain/errors/DomainError.ts` with `ErrorCode` enum and `DomainError` class
- [x] 1.2 Create `src/domain/entities/Card.ts` with Card entity (id, name, description, due, listId, boardId, labels, url)
- [x] 1.3 Create `src/domain/entities/Board.ts` with Board entity (id, name)
- [x] 1.4 Create `src/domain/entities/Label.ts` with Label entity (id, name, color)
- [x] 1.5 Create `src/domain/entities/List.ts` with List entity (id, name, boardId)
- [x] 1.6 Create `src/domain/entities/Comment.ts` with Comment entity (id, text, creator, date)
- [x] 1.7 Create `src/domain/value-objects/CardQuery.ts` with CardQuery VO and fuzzy matching logic
- [x] 1.8 Create `src/domain/value-objects/ListName.ts` with ListName VO with validation
- [x] 1.9 Create `src/domain/value-objects/LabelName.ts` with LabelName VO with validation
- [x] 1.10 Create `src/domain/index.ts` re-exporting all domain entities, VOs, and errors

## Layer 2: Infrastructure

- [ ] 2.1 Create `src/shared/index.ts` with `Result<T, E>` type, `ok()` and `err()` helpers
- [ ] 2.2 Create `src/config/index.ts` with Zod env validation (TRELLO_API_KEY, TRELLO_TOKEN, TRELLO_DEFAULT_BOARD_ID, TRELLO_API_BASE_URL)
- [ ] 2.3 Create `src/infrastructure/trello/fixtures.ts` with test fixtures for Trello API payloads
- [ ] 2.4 Create `src/infrastructure/trello/mappers.ts` with TrelloDto → Domain entity mappers
- [ ] 2.5 Create `src/infrastructure/trello/board-api.ts` with board-related Trello API calls
- [ ] 2.6 Create `src/infrastructure/trello/list-api.ts` with list-related Trello API calls
- [ ] 2.7 Create `src/infrastructure/trello/card-api.ts` with card CRUD Trello API calls
- [ ] 2.8 Create `src/infrastructure/trello/label-api.ts` with label Trello API calls
- [ ] 2.9 Create `src/infrastructure/trello/comment-api.ts` with comment Trello API calls
- [ ] 2.10 Create `src/infrastructure/trello/adapter.ts` with TrelloApiAdapter implementing TrelloGateway interface
- [ ] 2.11 Create `src/types/tool-contract.ts` with Zod schemas for all tool inputs/outputs and resource schemas

## Layer 3: Application

- [ ] 3.1 Create `src/application/ports.ts` with TrelloGateway interface and DisambiguationResult type
- [ ] 3.2 Create `src/application/create-card.ts` with CreateCardUseCase (handles implicit list creation)
- [ ] 3.3 Create `src/application/move-card.ts` with MoveCardUseCase (fuzzy matching + disambiguation)
- [ ] 3.4 Create `src/application/search-cards.ts` with SearchCardsUseCase (fuzzy search with limit)
- [ ] 3.5 Create `src/application/add-labels.ts` with AddLabelsUseCase (ADD mode only, implicit label creation)
- [ ] 3.6 Create `src/application/add-comment.ts` with AddCommentUseCase
- [ ] 3.7 Create `src/application/board-summary.ts` with BoardSummaryUseCase
- [ ] 3.8 Create `src/application/board-overdue.ts` with BoardOverdueUseCase (calculate overdueDays)
- [ ] 3.9 Create `src/application/board-by-label.ts` with BoardByLabelUseCase

## Layer 4: MCP

- [ ] 4.1 Create `src/mcp/tools/create-card.ts` with trello_create_card handler
- [ ] 4.2 Create `src/mcp/tools/move-card.ts` with trello_move_card handler
- [ ] 4.3 Create `src/mcp/tools/search-cards.ts` with trello_search_cards handler
- [ ] 4.4 Create `src/mcp/tools/add-labels.ts` with trello_add_labels handler
- [ ] 4.5 Create `src/mcp/tools/add-comment.ts` with trello_add_comment handler
- [ ] 4.6 Create `src/mcp/resources/board-summary.ts` with trello://boards/{id}/summary handler
- [ ] 4.7 Create `src/mcp/resources/board-overdue.ts` with trello://boards/{id}/overdue handler
- [ ] 4.8 Create `src/mcp/resources/board-by-label.ts` with trello://boards/{id}/by-label handler
- [ ] 4.9 Create `src/mcp/registry.ts` with tool/resource registration using MCP SDK
- [ ] 4.10 Create `src/mcp/handlers.ts` with all handlers wired to use cases
- [ ] 4.11 Update `src/index.ts` with server bootstrap, config loading, and MCP server startup
- [ ] 4.12 Add fuse.js dependency for fuzzy matching

## Layer 5: Testing

- [ ] 5.1 Write unit tests for `src/domain/errors.ts` - error codes and DomainError class
- [ ] 5.2 Write unit tests for `src/domain/entities/card.ts` - Card entity creation and validation
- [ ] 5.3 Write unit tests for `src/shared/index.ts` - Result type operations (ok, err, isOk, isErr)
- [ ] 5.4 Write unit tests for `src/infrastructure/trello/adapter.ts` - HTTP error mapping, rate limit handling
- [ ] 5.5 Write unit tests for `src/infrastructure/trello/mappers.ts` - DTO to entity mapping
- [ ] 5.6 Write contract tests for `src/application/create-card.ts` - implicit list creation scenario
- [ ] 5.7 Write contract tests for `src/application/move-card.ts` - disambiguation on multiple matches
- [ ] 5.8 Write contract tests for `src/application/search-cards.ts` - fuzzy matching AND logic
- [ ] 5.9 Write contract tests for `src/application/add-labels.ts` - ADD mode (not replace)
- [ ] 5.10 Write unit tests for `src/application/board-overdue.ts` - overdueDays calculation
- [ ] 5.11 Write integration tests for `src/mcp/tools/create-card.ts` - full flow from MCP call to Trello API
- [ ] 5.12 Write integration tests for `src/mcp/tools/move-card.ts` - error -32002 (ambiguous) scenario
- [ ] 5.13 Write integration tests for `src/mcp/resources/board-summary.ts` - resource response format
- [ ] 5.14 Write tests for fuzzy matching logic in CardFinder - multiple terms, partial words, special chars escaping

## Dependencies

```
Layer 1 (Domain)
  └─ All Layer 1 tasks must complete before Layer 2

Layer 2 (Infrastructure)
  └─ 2.1 (shared), 2.2 (config) before all other Infrastructure tasks
  └─ 2.4 (mappers) depends on 2.3 (fixtures) and Layer 1 entities
  └─ 2.10 (adapter) depends on 2.4-2.9 (all API files)
  └─ All Layer 2 must complete before Layer 3

Layer 3 (Application)
  └─ 3.1 (ports) depends on Layer 1 and Layer 2
  └─ All other application tasks depend on 3.1
  └─ All Layer 3 must complete before Layer 4

Layer 4 (MCP)
  └─ 4.1-4.8 (individual handlers) depend on Layer 3
  └─ 4.9-4.10 (registry, handlers) depend on 4.1-4.8
  └─ 4.11 (index.ts) depends on 4.9-4.10 and 2.2 (config)

Layer 5 (Testing)
  └─ 5.1-5.5 (unit tests) depend on respective implementation files
  └─ 5.6-5.10 (contract tests) depend on Layer 3
  └─ 5.11-5.14 (integration tests) depend on Layer 4
```

## Implementation Order

1. **Start with Domain** (1.1-1.9): Entities, value objects, and errors - no external dependencies
2. **Then Infrastructure foundation** (2.1-2.2): Shared utilities and config - needed by everything else
3. **Then Infrastructure APIs** (2.3-2.9): Trello API calls and mappers
4. **Then Infrastructure adapter** (2.10-2.11): Main adapter and types
5. **Then Application** (3.1-3.9): Ports and all use cases
6. **Then MCP handlers** (4.1-4.10): Tool and resource handlers
7. **Then MCP bootstrap** (4.11-4.12): Server entry point
8. **Finally Testing** (5.1-5.14): Unit, contract, and integration tests

## Notes

- Error codes: -32001 (BOARD_ID_REQUIRED), -32002 (CARD_AMBIGUOUS), -32003 (CARD_NOT_FOUND), -32004 (COMMENT_EMPTY), -32005 (BOARD_NOT_FOUND), -32006 (RATE_LIMITED), -32007 (TRELLO_API_ERROR)
- Rate limiting: implement exponential backoff (1s, 2s, 4s) with up to 3 retries
- Board auto-discovery: if TRELLO_DEFAULT_BOARD_ID unset, call GET /1/members/me?boards=open and use single board if only one exists
- Fuzzy matching: use fuse.js with threshold 0.4, require minMatchCharLength of 2, AND logic for multiple terms
