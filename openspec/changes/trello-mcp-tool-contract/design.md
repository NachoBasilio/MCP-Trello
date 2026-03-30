# Design: trello-mcp-tool-contract

## Technical Approach

Expose 5 MCP tools and 3 MCP resources that wrap Trello API operations via a clean adapter layer. Card queries reuse the domain semantics already implemented in `CardQuery`: case-insensitive substring matching with AND logic between terms, without `fuse.js` for now. The architecture follows strict layer separation: MCP handlers delegate to application services, which use domain entities, with Trello API calls happening only in the infrastructure layer.

This is target-state design for Trello runtime work on top of the existing bootstrap. The current repository already has the `mcp-bootstrap-opencode` baseline (`stdio` transport plus `bootstrap.status`), and the implemented vertical slices of this change are currently `trello_search_cards` plus the minimum `trello_add_comment` write flow.

## Architecture Decisions

### Decision: Layer Separation

**Choice**: Four-layer architecture following the existing project structure
**Alternatives considered**: Two-layer (handlers + services), tightly coupled
**Rationale**: Separation allows testing each layer independently, isolates Trello API changes from business logic, and enables future adapter swaps (e.g., mock for tests, alternative backend)

### Decision: Card Name Matching Strategy

**Choice**: Reuse `CardQuery` semantics (case-insensitive substring + AND between terms)
**Alternatives considered**: `fuse.js`, `fast-levenshtein`
**Rationale**: The repository already contains the domain invariant we need in `src/domain/value-objects/CardQuery.ts`, so introducing `fuse.js` now would create contradictory documentation, a new dependency, and ranking behavior the runtime does not yet need for the first read-only slice.

### Decision: Error Handling

**Choice**: `Result<T, E>` type with tagged error codes, thrown as custom domain errors
**Alternatives considered**: Exceptions only, Go-style error returns, neverthrow library
**Rationale**: Type-safe errors that can be caught and handled by category (auth, not_found, rate_limit, upstream). Avoids external dependency since project already uses zod.

### Decision: Configuration Validation

**Choice**: Zod schemas in `src/config/` validating env vars at startup
**Alternatives considered**: Runtime checks, JSON Schema, plain objects
**Rationale**: Zod provides runtime validation with type inference, integrates with existing dep, and provides clear error messages on startup.

### Decision: Board Resolution Precedence

**Choice**: Resolve board-scoped tool calls in this strict order: explicit `boardId`, explicit `boardName` by normalized exact match, `TRELLO_DEFAULT_BOARD_ID`, then auto-discovery only when the authenticated member has exactly one accessible board
**Alternatives considered**: `boardName` partial matching, silent fallback from failed `boardName` to default board, unconditional auto-discovery
**Rationale**: `boardId` is the least ambiguous identifier, `boardName` is user-friendly but needs deterministic matching, and silent fallback would allow reads/writes against the wrong board. Restricting auto-discovery to the single-board case keeps the contract safe when configuration is incomplete.

### Decision: Board Discovery Endpoint

**Choice**: Use Trello member board listing via `GET /1/members/{id}/boards`
**Alternatives considered**: Relying on `GET /1/members/me?boards=open` as the primary discovery contract
**Rationale**: The external Trello REST documentation currently exposes `GET /members/{id}/boards` under the Members API group. Internal artifacts that still mention `GET /1/members/me?boards=open` conflict with that verified documentation and should not remain as source-of-truth for this change.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│  MCP Handlers (src/mcp/)                                     │
│  - Tool handlers (5): create_card, move_card, search_cards  │
│  - Resource handlers (3): board_summary, board_overdue      │
│  - Request validation, response serialization                │
└──────────────────────────┬────────────────────────────────────┘
                           │
┌──────────────────────────▼────────────────────────────────────┐
│  Application Services (src/application/)                       │
│  - CreateCardUseCase, MoveCardUseCase, SearchCardsUseCase     │
│  - AddLabelsUseCase, AddCommentUseCase                        │
│  - BoardQueryUseCase (for resources)                          │
│  - Depends on domain interfaces, not infrastructure           │
└──────────────────────────┬────────────────────────────────────┘
                           │
┌──────────────────────────▼────────────────────────────────────┐
│  Domain (src/domain/)                                         │
│  - Entities: Card, Board, Label, List, Comment                │
│  - Value Objects: CardName, BoardId, LabelId                 │
│  - Domain errors with codes                                    │
│  - NO infrastructure imports                                   │
└──────────────────────────┬────────────────────────────────────┘
                           │
┌──────────────────────────▼────────────────────────────────────┐
│  Infrastructure (src/infrastructure/trello/)                   │
│  - TrelloApiAdapter: HTTP client + auth + Trello API calls    │
│  - BoardFinder, CardFinder, ListFinder, LabelFinder          │
│  - Mappers: TrelloDto → Domain entities                      │
│  - Implements domain interfaces (ports)                        │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
src/
├── index.ts                          # Entry point, server bootstrap
├── config/
│   └── index.ts                      # Zod env validation, config export
├── mcp/
│   ├── handlers.ts                   # Tool + Resource handlers registry
│   ├── tools/
│   │   ├── create-card.ts            # trello_create_card handler
│   │   ├── move-card.ts              # trello_move_card handler
│   │   ├── search-cards.ts           # trello_search_cards handler (Batch 1 implemented)
│   │   ├── add-labels.ts             # trello_add_labels handler
│   │   └── add-comment.ts             # trello_add_comment handler
│   ├── resources/
│   │   ├── board-summary.ts          # trello://boards/{id}/summary
│   │   ├── board-overdue.ts           # trello://boards/{id}/overdue
│   │   └── board-by-label.ts          # trello://boards/{id}/by-label
│   └── registry.ts                   # Tool/resource registration with MCP SDK
├── application/
│   ├── create-card.ts                # Use case
│   ├── move-card.ts                  # Use case
│   ├── search-cards.ts               # Use case (Batch 1 implemented)
│   ├── add-labels.ts                 # Use case
│   ├── add-comment.ts                # Use case
│   ├── board-summary.ts              # Use case for resource
│   ├── board-overdue.ts              # Use case for resource
│   ├── board-by-label.ts             # Use case for resource
│   └── ports.ts                      # Interface definitions (TrelloGateway, etc)
├── domain/
│   ├── entities/
│   │   ├── card.ts
│   │   ├── board.ts
│   │   ├── label.ts
│   │   ├── list.ts
│   │   └── comment.ts
│   ├── value-objects/
│   │   ├── card-name.ts
│   │   ├── board-id.ts
│   │   └── label-id.ts
│   └── errors.ts                    # Domain errors with error codes
├── infrastructure/
│   └── trello/
│       ├── adapter.ts                # Minimum read-only adapter for search in Batch 1
│       ├── board-api.ts              # Board-related API calls
│       ├── card-api.ts               # Card CRUD API calls
│       ├── list-api.ts               # List API calls
│       ├── label-api.ts              # Label API calls
│       ├── comment-api.ts            # Comment API calls
│       ├── mappers.ts                # TrelloDto → Domain entities
│       └── fixtures.ts               # Test fixtures for Trello payloads
├── shared/
│   └── index.ts                      # Result type, common utilities
└── types/
    └── tool-contract.ts              # Tool schemas, resource types (proposal item)
```

## Trello API Adapter Design

### Authentication

Trello uses `key` (API key) + `token` (OAuth token) passed as query params:
```
GET https://api.trello.com/1/boards/{id}?key={key}&token={token}
```

Both credentials come from environment variables, validated at startup via Zod.

### Endpoints Used

| Tool/Resource | Trello Endpoint | Method |
|---------------|------------------|--------|
| create_card | `/1/boards/{boardId}/lists` (get lists) then `/1/cards` | GET, POST |
| move_card | `/1/cards/{cardId}` | PUT |
| search_cards | `/1/boards/{boardId}/lists` + `/1/boards/{boardId}/cards` | GET |
| add_labels | `/1/cards/{cardId}/labels` | POST |
| add_comment | `/1/cards/{cardId}/actions/comments` | POST |
| board_summary | `/1/boards/{boardId}` + `/1/boards/{boardId}/lists` | GET |
| board_overdue | `/1/boards/{boardId}/cards` (filter by due) | GET |
| board_by_label | `/1/boards/{boardId}/labels` + `/1/boards/{boardId}/cards` | GET |

### Adapter Interface

```typescript
// src/application/ports.ts
export interface TrelloGateway {
  resolveBoard(input: { boardId?: string; boardName?: string }): Promise<Result<string, DomainError>>;
  listCards(boardId: string): Promise<Result<CardSummary[], DomainError>>;
}
```

### Board Resolution Flow

For board-scoped tools such as `trello_search_cards` and `trello_add_comment` when callers identify cards by name:

1. If `boardId` is provided, use it directly and do not evaluate `boardName`
2. If `boardId` is absent and `boardName` is provided, list accessible boards via `GET /1/members/{id}/boards`
3. Normalize candidate names before matching (trim outer whitespace, collapse repeated internal whitespace, compare case-insensitively)
4. If exactly one normalized exact match exists, use that board ID
5. If multiple normalized exact matches exist, return a dedicated ambiguous-board error
6. If no normalized exact match exists, return board-not-found for the provided `boardName`
7. Only when neither `boardId` nor `boardName` is provided, fall back to `TRELLO_DEFAULT_BOARD_ID`
8. Only when no explicit board selector is provided and no default board is configured, auto-discover the board if and only if the member has exactly one accessible board
9. If the single-board condition is not met, return board-required instead of guessing

## Card Name Matching Strategy

### Implementation

```typescript
// src/application/search-cards.ts
const query = CardQueryVO.create({ query: 'fix auth', limit: 10 });
const matchingCards = cards.filter((card) => query.matchesCardName(card.name));

return {
  cards: matchingCards.slice(0, query.limit),
  truncated: matchingCards.length > query.limit,
};
```

### Current Slice Boundary

The implemented slices still do not add `fuse.js`, typo tolerance, board-name resolution, safe auto-discovery, create/move/add-label operations, or resources. They only:

- read board cards and resolve list names for `trello_search_cards`
- resolve a card by `cardId` or by `cardName` using existing `CardQuery` semantics
- post a Trello comment and map the returned action into the domain `Comment`

## Disambiguation Prompt

When multiple matches found, future write tools can still return structured response so the LLM can:
1. Present options to user
2. Ask user to clarify which card

## Error Handling Pattern

### Result Type

```typescript
// src/shared/index.ts
export type Result<T, E = DomainError> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
```

### Domain Error Codes

```typescript
// src/domain/errors.ts
export enum ErrorCode {
  NotFound = 'NOT_FOUND',
  Validation = 'VALIDATION',
  Authentication = 'AUTH',
  RateLimit = 'RATE_LIMIT',
  Upstream = 'UPSTREAM',
  Configuration = 'CONFIG',
  AmbiguousMatch = 'AMBIGUOUS_MATCH',
}

export class DomainError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
```

### Error Mapping in Adapter

```typescript
// src/infrastructure/trello/adapter.ts
private mapHttpError(status: number, body: unknown): DomainError {
  switch (status) {
    case 401:
    case 403:
      return new DomainError(ErrorCode.Authentication, 'Invalid Trello credentials');
    case 404:
      return new DomainError(ErrorCode.NotFound, 'Resource not found');
    case 429:
      return new DomainError(ErrorCode.RateLimit, 'Trello rate limit exceeded');
    default:
      return new DomainError(ErrorCode.Upstream, 'Trello API error', { status, body });
  }
}
```

## Configuration

### Environment Variables

```typescript
// src/config/index.ts
import { z } from 'zod';

const configSchema = z.object({
  TRELLO_API_KEY: z.string().min(1, 'TRELLO_API_KEY is required'),
  TRELLO_TOKEN: z.string().min(1, 'TRELLO_TOKEN is required'),
  TRELLO_DEFAULT_BOARD_ID: z.string().optional(),
  TRELLO_API_BASE_URL: z.string().default('https://api.trello.com/1'),
  MCP_SERVER_NAME: z.string().default('trello-mcp'),
  MCP_SERVER_VERSION: z.string().default('1.0.0'),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(): Config {
  const result = configSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path}: ${e.message}`).join(', ');
    throw new DomainError(ErrorCode.Configuration, `Invalid config: ${errors}`);
  }
  return result.data;
}
```

### Validation Timing

- Config loaded at server startup (src/index.ts)
- Throws `DomainError` with `CONFIG` code if invalid
- All handlers receive config via dependency injection

## Data Flow: create_card Example

```
LLM → MCP Protocol → create-card handler (src/mcp/tools/create-card.ts)
  → CreateCardUseCase (src/application/create-card.ts)
    → CardFinder.findByName() for optional duplicate check
    → TrelloGateway.getBoardLists() to find/create list
    → TrelloGateway.createCard()
      → TrelloApiAdapter (src/infrastructure/trello/adapter.ts)
        → HTTP POST /1/cards with auth
        → Map TrelloCardDto → Card entity
    ← Card entity
  ← Tool response { id, name, listId, ... }
→ MCP Protocol → LLM
```

## Open Questions

- [ ] Search remains board-scoped for this change; no cross-board search is planned in the current contract.
- [ ] Rate limit handling: should we cache board lists for a short period to reduce API calls?
- [ ] Do we need pagination for `board_by_label` resource when boards have many cards?
