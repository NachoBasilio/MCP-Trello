# Proposal: trello-mcp-tool-contract

## Intent

Define the tool contract between the MCP server and OpenCode (AI coding assistant) for Trello operations. The change remains broader than the first implementation batches, but the repository now materializes only two vertical slices on top of the existing bootstrap: read-only `trello_search_cards` and minimal write `trello_add_comment`. Before extending those slices, this change also needs a closed board-resolution strategy so the contract stops depending on implicit board selection.

## Scope

### In Scope
- 5 MCP tools: `trello_create_card`, `trello_move_card`, `trello_search_cards`, `trello_add_labels`, `trello_add_comment`
- 3 MCP resources: `trello://boards/{board_id}/summary`, `trello://boards/{board_id}/overdue`, `trello://boards/{board_id}/by-label`
- Tool parameter schemas and return types
- Resource URI templates and response formats
- Design decisions: substring search semantics from `CardQuery`, ADD labels mode, implicit list creation, and safe board resolution precedence (`boardId` > `boardName` exact match normalizado > `TRELLO_DEFAULT_BOARD_ID` > single-board auto-discovery)

### Out of Scope
- Trello API authentication implementation (handled separately)
- Webhook support for real-time updates
- Card creation via direct card ID (only name-based queries)
- Batch operations or transactions

## Approach

The MCP server exposes Trello capabilities via the Model Context Protocol. Each tool maps to a Trello API operation behind a pure adapter layer. Card queries reuse the domain semantics already materialized in `CardQuery`: case-insensitive substring matching with AND logic between terms, without `fuse.js` for now. Labels are added (not set) to preserve existing labels. Board resolution for board-scoped tools is ordered as: explicit `boardId`, then explicit `boardName` by normalized exact match, then `TRELLO_DEFAULT_BOARD_ID`, then auto-discovery only when the authenticated member has exactly one accessible board. If explicit `boardName` resolution fails, the contract MUST return an error instead of silently falling back to another board. The current repo state implements `trello_search_cards` plus the minimal `trello_add_comment` write slice, reusing the same card-resolution semantics when callers provide `cardName` instead of `cardId`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/mcp/tools/` | New | Tool implementations, starting with `trello_search_cards` |
| `src/infrastructure/trello/adapter.ts` | New | Minimum Trello adapter for card search plus add-comment |
| `src/types/tool-contract.ts` | New | Runtime schemas for the implemented tool slice |
| `src/mcp/handlers.ts` | Extend | MCP handlers now aggregate bootstrap diagnostics plus search/add-comment |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Substring search returns broad matches on short terms | Medium | Reuse `CardQuery` AND logic, keep limit/truncation visible, postpone stronger ranking until evidence demands it |
| Board name resolves to zero or multiple accessible boards | Medium | Require normalized exact match, add explicit ambiguous-board error, and forbid silent fallback from failed `boardName` |
| Default board not configured | Low | Auto-discover board only if the authenticated member has exactly one accessible board |
| Rate limiting from Trello API | Low | Implement exponential backoff, document limits |

## Rollback Plan

1. Revert `src/tools/`, `src/resources/`, `src/types/tool-contract.ts` to previous state
2. Remove tool registrations from MCP handler
3. Remove `TRELLO_DEFAULT_BOARD_ID` from environment if no longer needed
4. No data migration required (contract only affects interface)

## Dependencies

- `mcp-bootstrap-opencode` must complete bootstrap/source-of-truth alignment before this change can claim MCP runtime readiness
- TRELLO_API_KEY and TRELLO_TOKEN environment variables configured
- Valid `TRELLO_DEFAULT_BOARD_ID`, explicit board input, or exactly one accessible board discoverable through `GET /1/members/{id}/boards`
- `@modelcontextprotocol/sdk` for MCP server implementation

## Dependency Note

This change defines a target Trello contract on top of an existing minimal MCP bootstrap. The repository now has a runnable `stdio` bootstrap plus `bootstrap.status`, `trello_search_cards`, and `trello_add_comment`, but it still lacks the rest of the planned Trello tools/resources. This change therefore remains downstream contract/runtime work rather than evidence of a fully Trello-ready server.

## Success Criteria

- [ ] All 5 tools respond with correctly typed JSON-RPC responses
- [ ] All 3 resources return structured board data
- [ ] Card name matching follows `CardQuery` semantics (case-insensitive substring + AND across terms)
- [ ] Labels are added (not replaced) when using `trello_add_labels`
- [ ] Missing list is created implicitly in `trello_create_card`
- [ ] Board-scoped tools resolve boards in this order: `boardId` > `boardName` exact match normalizado > `TRELLO_DEFAULT_BOARD_ID` > single-board auto-discovery
- [ ] Explicit `boardName` failure never falls back silently to a different board
- [ ] Ambiguous normalized board-name matches return a dedicated error instead of picking an arbitrary board
