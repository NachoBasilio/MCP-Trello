# Delta for Trello MCP Tool Contract

## ADDED Requirements

### Requirement: Board Resolution for Board-Scoped Tools

The system SHALL resolve board-scoped tool calls using this precedence: explicit `boardId`, explicit `boardName` with normalized exact match, `TRELLO_DEFAULT_BOARD_ID`, then auto-discovery only when the authenticated member has access to exactly one board.

When `boardId` is present, the system MUST use it and MUST NOT evaluate `boardName`.

When `boardName` is present and `boardId` is absent, the system MUST compare board names using normalized exact matching (trim outer whitespace, collapse repeated internal whitespace, compare case-insensitively).

When `boardName` resolution produces multiple normalized exact matches, the system MUST return error code `-32008` with message "Ambiguous board name".

When explicit `boardName` resolution produces no exact match, the system MUST return `-32005` and MUST NOT silently fall back to `TRELLO_DEFAULT_BOARD_ID` or another accessible board.

When neither `boardId` nor `boardName` is provided and `TRELLO_DEFAULT_BOARD_ID` is unset, the system MAY auto-discover the board only if the authenticated member has access to exactly one board.

Board auto-discovery for this change SHALL rely on Trello member board listing via `GET /1/members/{id}/boards`.

#### Scenario: Explicit boardId wins over boardName

- GIVEN a caller provides both `boardId: "board-123"` and `boardName: "Other board"`
- WHEN a board-scoped tool resolves the target board
- THEN the system SHALL use `board-123`
- AND SHALL NOT evaluate `boardName`

#### Scenario: Resolve board by normalized exact boardName

- GIVEN the authenticated member has access to a board named `Platform Roadmap`
- WHEN the user invokes a board-scoped tool with `boardName: "  platform   roadmap  "`
- THEN the system SHALL resolve the board by normalized exact match

#### Scenario: Explicit boardName not found does not fall back

- GIVEN `TRELLO_DEFAULT_BOARD_ID` is set to a valid board ID
- AND no accessible board matches `boardName: "Ghost board"`
- WHEN the user invokes a board-scoped tool with `boardName: "Ghost board"`
- THEN the system SHALL return error code `-32005` with message "Board not found or inaccessible"
- AND SHALL NOT use `TRELLO_DEFAULT_BOARD_ID`

#### Scenario: Ambiguous normalized boardName

- GIVEN multiple accessible boards match the normalized name `delivery board`
- WHEN the user invokes a board-scoped tool with `boardName: "Delivery   Board"`
- THEN the system SHALL return error code `-32008` with message "Ambiguous board name"

#### Scenario: Single-board auto-discovery without explicit selectors

- GIVEN `TRELLO_DEFAULT_BOARD_ID` is NOT set
- AND the authenticated member has access to exactly one board
- WHEN the user invokes a board-scoped tool without `boardId` and without `boardName`
- THEN the system SHALL auto-discover that single accessible board

### Requirement: trello_create_card Tool

The system SHALL expose a `trello_create_card` MCP tool that creates a new card on a Trello board.

The tool MUST accept `name`, `listName` (optional, defaults to "To Do"), `boardId` (optional), `boardName` (optional), `description` (optional), and `pos` (optional, defaults to "bottom").

The tool SHALL create the list implicitly if it does not exist.

The tool MUST return a JSON object containing `id`, `name`, `idList`, `shortUrl`, `desc`, and `closed` fields.

#### Scenario: Create card in default list

- GIVEN `TRELLO_DEFAULT_BOARD_ID` is set to a valid board ID
- AND the board has a list named "To Do"
- WHEN the user invokes `trello_create_card` with `name: "Fix login bug"`
- THEN the system SHALL create a card named "Fix login bug" in the "To Do" list
- AND the system SHALL return the created card object with `id` and `shortUrl`

#### Scenario: Create card in custom list

- GIVEN the board has a list named "In Progress"
- WHEN the user invokes `trello_create_card` with `name: "New feature"`, `listName: "In Progress"`
- THEN the system SHALL create a card named "New feature" in the "In Progress" list

#### Scenario: Create card with implicit list creation

- GIVEN the board does NOT have a list named "Backlog"
- WHEN the user invokes `trello_create_card` with `name: "Debt item"`, `listName: "Backlog"`
- THEN the system SHALL create the "Backlog" list implicitly
- AND create the card in the newly created list

#### Scenario: Create card without default board configured

- GIVEN `TRELLO_DEFAULT_BOARD_ID` is NOT set
- AND the user has access to exactly one board
- WHEN the user invokes `trello_create_card` with `name: "Test card"`
- THEN the system SHALL auto-discover the single accessible board
- AND create the card on that board

#### Scenario: Create card error - no board available

- GIVEN `TRELLO_DEFAULT_BOARD_ID` is NOT set
- AND the user has access to multiple boards
- WHEN the user invokes `trello_create_card` with `name: "Orphan card"`
- THEN the system SHALL return error code `-32001` with message "Board ID required"
- AND suggest setting `TRELLO_DEFAULT_BOARD_ID`

---

### Requirement: trello_move_card Tool

The system SHALL expose a `trello_move_card` MCP tool that moves a card to a different list.

The tool MUST accept `cardName`, `toList`, `boardId` (optional), `boardName` (optional), and `cardId` (optional, for disambiguation).

The tool SHALL use the same case-insensitive substring semantics as `CardQuery` when `cardId` is not provided.

The tool MUST return a JSON object containing the updated card with new `idList`.

#### Scenario: Move card by name

- GIVEN a card named "Fix login bug" exists in "To Do" list
- WHEN the user invokes `trello_move_card` with `cardName: "Fix login bug"`, `toList: "Done"`
- THEN the system SHALL move the card to the "Done" list
- AND return the updated card object

#### Scenario: Move card by ID (disambiguation)

- GIVEN multiple cards have names containing "login" (e.g., "Fix login bug", "Login timeout")
- WHEN the user invokes `trello_move_card` with `cardId: "abc123"`, `toList: "Done"`
- THEN the system SHALL move the card with ID "abc123" directly
- AND NOT perform additional name matching

#### Scenario: Move card ambiguous name

- GIVEN multiple cards match the substring search for "login"
- WHEN the user invokes `trello_move_card` with `cardName: "login"`, `toList: "Done"`
- THEN the system SHALL return error code `-32002` with message "Ambiguous card name"
- AND include a `suggestions` array with matching card objects containing `id`, `name`, `idList`

#### Scenario: Move card to non-existent list

- GIVEN the target list "Someday" does not exist on the board
- WHEN the user invokes `trello_move_card` with `cardName: "Maybe task"`, `toList: "Someday"`
- THEN the system SHALL create the "Someday" list
- AND move the card to the newly created list

#### Scenario: Move card error - card not found

- GIVEN no card matches "nonexistent card xyz"
- WHEN the user invokes `trello_move_card` with `cardName: "nonexistent card xyz"`, `toList: "Done"`
- THEN the system SHALL return error code `-32003` with message "Card not found"
- AND include `searchTerm` in the error metadata

---

### Requirement: trello_search_cards Tool

The system SHALL expose a `trello_search_cards` MCP tool that searches for cards by name.

The tool MUST accept `query`, `boardId` (optional), `boardName` (optional), and `limit` (optional, defaults to 10, max 50).

The tool SHALL use case-insensitive substring matching on card names with AND logic between query terms.

The tool MUST return an object containing `boardId`, `cards`, and `truncated`, where `cards` is an array of card objects containing `id`, `name`, `idList`, `listName`, `boardId`, `closed`, and `shortUrl`.

#### Scenario: Search cards with exact match

- GIVEN a card named "Fix login bug" exists on the board
- WHEN the user invokes `trello_search_cards` with `query: "Fix login bug"`
- THEN the system SHALL return an array containing the exact matching card

#### Scenario: Search cards with substring AND match

- GIVEN a card named "Authentication failure" exists
- WHEN the user invokes `trello_search_cards` with `query: "auth fail"`
- THEN the system SHALL return cards with names containing both "auth" and "fail" regardless of case

#### Scenario: Search cards with no results

- GIVEN no cards match "nonexistent query"
- WHEN the user invokes `trello_search_cards` with `query: "nonexistent query"`
- THEN the system SHALL return an empty array
- AND NOT raise an error

#### Scenario: Search cards by explicit boardName

- GIVEN the authenticated member has access to a board named `Product Delivery`
- AND that board contains a card named `Fix login bug`
- WHEN the user invokes `trello_search_cards` with `query: "Fix login bug", boardName: "product delivery"`
- THEN the system SHALL resolve the board by normalized exact name match
- AND return the matching card from that board

#### Scenario: Search cards limit

- GIVEN more than 20 cards match the query
- WHEN the user invokes `trello_search_cards` with `query: "bug", limit: 20`
- THEN the system SHALL return at most 20 cards inside `cards`
- AND include a `truncated: true` flag if results were limited

---

### Requirement: trello_add_labels Tool

The system SHALL expose a `trello_add_labels` MCP tool that adds labels to a card.

The tool MUST accept `cardName` or `cardId`, `labels` (array of label objects), `boardId` (optional), and `boardName` (optional).

The tool SHALL add labels (NOT replace existing labels) - this is ADD mode only.

The tool MUST return the updated card with all labels.

#### Scenario: Add single label to card

- GIVEN a card without "bug" label
- AND a label with name "bug" exists on the board (color: "red")
- WHEN the user invokes `trello_add_labels` with `cardName: "Fix login bug"`, `labels: [{name: "bug"}]`
- THEN the system SHALL add the "bug" label to the card
- AND preserve any existing labels on the card

#### Scenario: Add multiple labels to card

- GIVEN a card without "bug" or "urgent" labels
- WHEN the user invokes `trello_add_labels` with `cardName: "Critical issue"`, `labels: [{name: "bug"}, {name: "urgent"}]`
- THEN the system SHALL add both labels to the card
- AND preserve any other existing labels

#### Scenario: Add label with implicit label creation

- GIVEN the board does NOT have a label named "needs-review"
- WHEN the user invokes `trello_add_labels` with `cardName: "PR #123"`, `labels: [{name: "needs-review", color: "sky"}]`
- THEN the system SHALL create the "needs-review" label with color "sky"
- AND add it to the card

#### Scenario: Add label error - card not found

- GIVEN no card matches "ghost card"
- WHEN the user invokes `trello_add_labels` with `cardName: "ghost card"`, `labels: [{name: "test"}]`
- THEN the system SHALL return error code `-32003` with message "Card not found"

---

### Requirement: trello_add_comment Tool

The system SHALL expose a `trello_add_comment` MCP tool that adds a comment to a card.

The tool MUST accept `cardName` or `cardId`, `text` (comment content), `boardId` (optional), and `boardName` (optional).

The tool SHALL return the created comment object with `id`, `text`, `creator`, and `date`.

#### Scenario: Add comment to card

- GIVEN a card named "Fix login bug" exists
- WHEN the user invokes `trello_add_comment` with `cardName: "Fix login bug"`, `text: "Assigned to John"`
- THEN the system SHALL add the comment to the card
- AND return the comment object with `id`, `text`, `creator`, and `date`

#### Scenario: Add comment by boardName and cardName

- GIVEN the authenticated member has access to a board named `Product Delivery`
- AND a card named `Fix login bug` exists on that board
- WHEN the user invokes `trello_add_comment` with `cardName: "Fix login bug"`, `boardName: " product   delivery ", text: "Assigned to John"`
- THEN the system SHALL resolve the board by normalized exact name match
- AND add the comment to the card on that board

#### Scenario: Add comment with markdown

- GIVEN a card exists
- WHEN the user invokes `trello_add_comment` with `cardName: "Task"`, `text: "**Bold** and _italic_ text"`
- THEN the system SHALL preserve the markdown formatting in the comment

#### Scenario: Add comment error - empty text

- GIVEN a card exists
- WHEN the user invokes `trello_add_comment` with `cardName: "Task"`, `text: ""`
- THEN the system SHALL return error code `-32004` with message "Comment text cannot be empty"

---

### Requirement: trello://boards/{board_id}/summary Resource

The system SHALL expose a Trello board summary resource at `trello://boards/{board_id}/summary`.

The resource MUST return a JSON object containing `id`, `name`, `description`, `url`, `closed` count, `lists` array (with `id`, `name`, `cards` count), and `members` array.

#### Scenario: Get board summary

- GIVEN a valid board ID
- WHEN the user requests the `trello://boards/{board_id}/summary` resource
- THEN the system SHALL return board metadata including name, description, URL
- AND include lists with card counts
- AND include member information

#### Scenario: Get board summary - invalid board

- GIVEN an invalid or inaccessible board ID
- WHEN the user requests the resource
- THEN the system SHALL return error code `-32005` with message "Board not found or inaccessible"

---

### Requirement: trello://boards/{board_id}/overdue Resource

The system SHALL expose an overdue cards resource at `trello://boards/{board_id}/overdue`.

The resource MUST return an array of card objects that have a due date in the past and are not closed.

Each card MUST include `id`, `name`, `dueDate`, `listName`, `assignees`, and `overdueDays` (calculated).

#### Scenario: Get overdue cards

- GIVEN a board with cards that have past due dates
- WHEN the user requests the `trello://boards/{board_id}/overdue` resource
- THEN the system SHALL return only cards where `due < now` and `closed = false`
- AND calculate `overdueDays` as `today - dueDate`

#### Scenario: Get overdue - no overdue cards

- GIVEN a board with no overdue cards
- WHEN the user requests the resource
- THEN the system SHALL return an empty array

---

### Requirement: trello://boards/{board_id}/by-label Resource

The system SHALL expose a by-label grouping resource at `trello://boards/{board_id}/by-label`.

The resource MUST return a map of label names to arrays of cards that have that label.

Each card MUST include `id`, `name`, `listName`, `dueDate` (if set), and `closed`.

#### Scenario: Get cards by label

- GIVEN a board with cards labeled "bug", "feature", and "urgent"
- WHEN the user requests the `trello://boards/{board_id}/by-label` resource
- THEN the system SHALL return an object with keys for each label name
- AND each label key SHALL contain an array of cards with that label

---

### Requirement: Rate Limiting

The system SHALL implement exponential backoff for Trello API rate limit (429) responses.

The system SHOULD retry up to 3 times with delays of 1s, 2s, and 4s respectively.

#### Scenario: Rate limit handling

- GIVEN the Trello API returns a 429 rate limit response
- WHEN any tool makes a request
- THEN the system SHALL wait 1 second and retry
- AND if still rate limited, wait 2 seconds and retry again
- AND if still rate limited, wait 4 seconds and retry a third time
- AND if all retries fail, return error code `-32006` with message "Rate limited by Trello API"

---

### Requirement: Card Name Matching

The system SHALL implement card name matching for queries using case-insensitive substring matching.

The system SHOULD return cards where all query terms appear in the card name (AND logic).

#### Scenario: Fuzzy match - multiple terms

- GIVEN a card named "Fix critical authentication bug"
- WHEN the user searches with `query: "fix auth"`
- THEN the card SHALL match because both "fix" and "auth" appear in the name

#### Scenario: Fuzzy match - partial word

- GIVEN a card named "AuthenticationService"
- WHEN the user searches with `query: "auth"`
- THEN the card SHALL match as "auth" is a substring of "Authentication"

---

## Input/Output Schemas (Zod)

### trello_create_card

```typescript
const trelloCreateCardInput = z.object({
  name: z.string().min(1).max(512, "Card name must be under 512 characters"),
  listName: z.string().optional().default("To Do"),
  boardId: z.string().optional(),
  boardName: z.string().optional(),
  description: z.string().max(16384, "Description must be under 16384 characters").optional(),
  pos: z.enum(["top", "bottom", "up", "down"]).optional().default("bottom"),
});

const trelloCreateCardOutput = z.object({
  id: z.string(),
  name: z.string(),
  idList: z.string(),
  shortUrl: z.string().url(),
  desc: z.string(),
  closed: z.boolean(),
  due: z.string().nullable(),
  dueComplete: z.boolean(),
});
```

### trello_move_card

```typescript
const trelloMoveCardInput = z.object({
  cardName: z.string().optional(),
  cardId: z.string().optional(),
  toList: z.string().min(1),
  boardId: z.string().optional(),
  boardName: z.string().optional(),
}).refine(data => data.cardName || data.cardId, {
  message: "Either cardName or cardId must be provided",
});

const trelloMoveCardOutput = z.object({
  id: z.string(),
  name: z.string(),
  idList: z.string(),
  listName: z.string(),
  shortUrl: z.string().url(),
  closed: z.boolean(),
});
```

### trello_search_cards

```typescript
const trelloSearchCardsInput = z.object({
  query: z.string().min(1),
  boardId: z.string().optional(),
  boardName: z.string().optional(),
  limit: z.number().int().min(1).max(50).optional().default(10),
});

const trelloSearchCardsOutput = z.object({
  boardId: z.string(),
  truncated: z.boolean(),
  cards: z.array(z.object({
    id: z.string(),
    name: z.string(),
    idList: z.string(),
    listName: z.string(),
    boardId: z.string(),
    closed: z.boolean(),
    shortUrl: z.string().url(),
    due: z.string().nullable(),
  })),
});
```

### trello_add_labels

```typescript
const trelloAddLabelsInput = z.object({
  cardName: z.string().optional(),
  cardId: z.string().optional(),
  labels: z.array(z.object({
    name: z.string(),
    color: z.enum(["blue", "green", "red", "orange", "purple", "pink", "sky", "lime", "black", "yellow", "null"]).optional(),
  })).min(1),
  boardId: z.string().optional(),
  boardName: z.string().optional(),
}).refine(data => data.cardName || data.cardId, {
  message: "Either cardName or cardId must be provided",
});

const trelloAddLabelsOutput = z.object({
  id: z.string(),
  name: z.string(),
  idList: z.string(),
  labels: z.array(z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
  })),
  shortUrl: z.string().url(),
});
```

### trello_add_comment

```typescript
const trelloAddCommentInput = z.object({
  cardName: z.string().optional(),
  cardId: z.string().optional(),
  text: z.string().min(1).max 16384,
  boardId: z.string().optional(),
  boardName: z.string().optional(),
}).refine(data => data.cardName || data.cardId, {
  message: "Either cardName or cardId must be provided",
});

const trelloAddCommentOutput = z.object({
  id: z.string(),
  text: z.string(),
  creator: z.string(),
  date: z.string().datetime(),
});
```

### Resource Schemas

```typescript
const boardSummaryResource = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  url: z.string().url(),
  closed: z.boolean(),
  lists: z.array(z.object({
    id: z.string(),
    name: z.string(),
    cardsCount: z.number(),
  })),
  members: z.array(z.object({
    id: z.string(),
    fullName: z.string(),
    username: z.string(),
  })),
});

const overdueCardsResource = z.array(z.object({
  id: z.string(),
  name: z.string(),
  dueDate: z.string().datetime(),
  overdueDays: z.number(),
  listName: z.string(),
  assignees: z.array(z.string()),
  shortUrl: z.string().url(),
}));

const cardsByLabelResource = z.record(z.string(), z.array(z.object({
  id: z.string(),
  name: z.string(),
  listName: z.string(),
  due: z.string().datetime().nullable(),
  closed: z.boolean(),
  shortUrl: z.string().url(),
})));
```

## Error Codes

| Code | Name | Message | HTTP Status |
|------|------|---------|-------------|
| `-32001` | BOARD_ID_REQUIRED | Board ID required. Set TRELLO_DEFAULT_BOARD_ID or provide boardId parameter. | 400 |
| `-32002` | CARD_AMBIGUOUS | Ambiguous card name. Multiple cards match. Provide cardId for disambiguation. | 409 |
| `-32003` | CARD_NOT_FOUND | Card not found: {searchTerm} | 404 |
| `-32004` | COMMENT_EMPTY | Comment text cannot be empty | 400 |
| `-32005` | BOARD_NOT_FOUND | Board not found or inaccessible | 404 |
| `-32006` | RATE_LIMITED | Rate limited by Trello API. Retry after {delay}s | 429 |
| `-32007` | TRELLO_API_ERROR | Trello API error: {message} | 502 |
| `-32008` | BOARD_AMBIGUOUS | Ambiguous board name. Multiple accessible boards match. Provide `boardId`. | 409 |

## Edge Cases

### Card Name Ambiguity
When card name matching returns multiple cards, the system MUST return error `-32002` with a `suggestions` array. The user must then provide `cardId` to disambiguate.

### Board Auto-Discovery
If `TRELLO_DEFAULT_BOARD_ID` is not set and the user has exactly one board, the system SHALL use that board. If multiple boards exist, the system MUST return error `-32001`.

### Board Name Resolution
If `boardName` is provided, the system SHALL resolve it using normalized exact match against accessible boards. If multiple boards match, the system MUST return `-32008`. If no board matches, the system MUST return `-32005` and MUST NOT silently fall back to another board.

### Label Color
If a label with the specified name does not exist, the system SHALL create it with the provided color. If no color is provided, default to "blue".

### Special Characters
Card names with special regex characters (e.g., `*`, `?`, `+`) SHALL be handled safely by the matching boundary to prevent accidental regex injection.

### Card Position
The `pos` parameter supports "top", "bottom", "up" (above current card), "down" (below current card). Default is "bottom".

### Empty Search Results
`trello_search_cards` with no matches SHALL return `{ boardId, cards: [], truncated: false }`, not an error.

### Due Date Handling
Cards without due dates SHALL have `due: null` in all responses. The `overdueDays` field SHALL be `null` for cards without due dates.

### List Name Case Sensitivity
List names SHALL be matched case-insensitively.

### Card Already in Target List
When moving a card to the list it already occupies, the system SHALL return success with the unchanged card object.
