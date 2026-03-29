# Design: trello-mcp-tool-contract

## Technical Approach

Expose 5 MCP tools and 3 MCP resources that wrap Trello API operations via a clean adapter layer. Card queries use fuzzy matching (fuse.js) against card names to improve UX without requiring exact IDs. The architecture follows strict layer separation: MCP handlers delegate to application services, which use domain entities, with Trello API calls happening only in the infrastructure layer.

This is target-state design for Trello runtime work on top of the existing bootstrap. The current repository already has the `mcp-bootstrap-opencode` baseline (`stdio` transport plus `bootstrap.status`), but this design is still downstream because Trello tools/resources and Trello infrastructure are not implemented yet.

## Architecture Decisions

### Decision: Layer Separation

**Choice**: Four-layer architecture following the existing project structure
**Alternatives considered**: Two-layer (handlers + services), tightly coupled
**Rationale**: Separation allows testing each layer independently, isolates Trello API changes from business logic, and enables future adapter swaps (e.g., mock for tests, alternative backend)

### Decision: Fuzzy Matching Library

**Choice**: `fuse.js` over `fast-levenshtein`
**Alternatives considered**: `fast-levenshtein` (raw distance), manual substring match
**Rationale**: Fuse.js provides threshold-based scoring with sorted results out of the box. For card name lookup (short strings, typos expected), fuzzy scoring is more user-friendly than pure edit distance.

### Decision: Error Handling

**Choice**: `Result<T, E>` type with tagged error codes, thrown as custom domain errors
**Alternatives considered**: Exceptions only, Go-style error returns, neverthrow library
**Rationale**: Type-safe errors that can be caught and handled by category (auth, not_found, rate_limit, upstream). Avoids external dependency since project already uses zod.

### Decision: Configuration Validation

**Choice**: Zod schemas in `src/config/` validating env vars at startup
**Alternatives considered**: Runtime checks, JSON Schema, plain objects
**Rationale**: Zod provides runtime validation with type inference, integrates with existing dep, and provides clear error messages on startup.

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
│   │   ├── search-cards.ts           # trello_search_cards handler
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
│   ├── search-cards.ts               # Use case
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
│       ├── adapter.ts                # TrelloApiAdapter (main client)
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
| search_cards | `/1/boards/{boardId}/cards` (search all) | GET |
| add_labels | `/1/cards/{cardId}/labels` | POST |
| add_comment | `/1/cards/{cardId}/actions/comments` | POST |
| board_summary | `/1/boards/{boardId}` + `/1/boards/{boardId}/lists` | GET |
| board_overdue | `/1/boards/{boardId}/cards` (filter by due) | GET |
| board_by_label | `/1/boards/{boardId}/labels` + `/1/boards/{boardId}/cards` | GET |

### Adapter Interface

```typescript
// src/application/ports.ts
export interface TrelloGateway {
  getBoard(boardId: BoardId): Promise<Result<Board, DomainError>>;
  getBoardLists(boardId: BoardId): Promise<Result<List[], DomainError>>;
  getBoardCards(boardId: BoardId): Promise<Result<Card[], DomainError>>;
  createCard(card: NewCard): Promise<Result<Card, DomainError>>;
  updateCard(cardId: CardId, updates: Partial<Card>): Promise<Result<Card, DomainError>>;
  addLabelToCard(cardId: CardId, labelId: LabelId): Promise<Result<void, DomainError>>;
  addComment(cardId: CardId, text: string): Promise<Result<Comment, DomainError>>;
  searchCardsByName(boardId: BoardId, name: string): Promise<Result<Card[], DomainError>>;
}
```

### Auto-discovery Logic

If `TRELLO_DEFAULT_BOARD_ID` is unset:
1. Call `GET /1/members/me?boards=open` to list user's boards
2. If only 1 board, use it as default
3. If multiple or none, return `ConfigurationError` with clear message

## Fuzzy Matching Strategy

### Implementation

```typescript
// src/infrastructure/trello/card-finder.ts
import Fuse from 'fuse.js';

const fuseOptions = {
  includeScore: true,
  threshold: 0.4,      // 0 = exact match, 1 = match anything
  minMatchCharLength: 2,
};

export class CardFinder {
  constructor(private readonly gateway: TrelloGateway) {}

  async findByName(boardId: BoardId, name: string): Promise<Card[]> {
    const result = await this.gateway.searchCardsByName(boardId, name);
    if (!result.ok) throw result.error;

    const fuse = new Fuse(result.value, { ...fuseOptions, keys: ['name'] });
    return fuse.search(name).map(r => r.item);
  }

  async disambiguate(boardId: BoardId, name: string): Promise<DisambiguationResult> {
    const cards = await this.findByName(boardId, name);
    
    if (cards.length === 0) {
      return { type: 'not_found', message: `No card matching "${name}" found` };
    }
    if (cards.length === 1) {
      return { type: 'single', card: cards[0] };
    }
    return { 
      type: 'multiple', 
      cards, 
      message: `Multiple cards match "${name}". Choose one: ${cards.map(c => c.name).join(', ')}` 
    };
  }
}
```

### Disambiguation Prompt

When multiple matches found, return structured response so the LLM can:
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

- [ ] Should `trello_search_cards` support searching across all boards or just the default board?
- [ ] Rate limit handling: should we cache board lists for a short period to reduce API calls?
- [ ] Do we need pagination for `board_by_label` resource when boards have many cards?
