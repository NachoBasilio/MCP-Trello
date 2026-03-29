# Proposal: trello-mcp-tool-contract

## Intent

Define the tool contract between the MCP server and OpenCode (AI coding assistant) for Trello operations. This establishes the interface contract that enables OpenCode to create tasks, move them between columns, search for tasks, add labels, and comment on cards in Trello.

## Scope

### In Scope
- 5 MCP tools: `trello_create_card`, `trello_move_card`, `trello_search_cards`, `trello_add_labels`, `trello_add_comment`
- 3 MCP resources: `trello://boards/{board_id}/summary`, `trello://boards/{board_id}/overdue`, `trello://boards/{board_id}/by-label`
- Tool parameter schemas and return types
- Resource URI templates and response formats
- Design decisions: fuzzy card matching, ADD labels mode, implicit list creation, auto-discovery

### Out of Scope
- Trello API authentication implementation (handled separately)
- Webhook support for real-time updates
- Card creation via direct card ID (only name-based queries)
- Batch operations or transactions

## Approach

The MCP server exposes Trello capabilities via the Model Context Protocol. Each tool maps to a Trello API operation behind a pure adapter layer. Card queries use fuzzy matching against card names rather than IDs to improve UX. Labels are added (not set) to preserve existing labels. The default board is configured via `TRELLO_DEFAULT_BOARD_ID` environment variable.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/tools/` | New | Tool implementations (5 files) |
| `src/resources/` | New | Resource handlers (3 files) |
| `src/adapters/trello.ts` | New | Trello API adapter |
| `src/types/tool-contract.ts` | New | Type definitions for tools/resources |
| `src/mcp/handlers.ts` | New | MCP request handlers |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Fuzzy match returns wrong card | Medium | Disambiguate prompt when multiple matches found |
| Default board not configured | Low | Auto-discover board if user has only one |
| Rate limiting from Trello API | Low | Implement exponential backoff, document limits |

## Rollback Plan

1. Revert `src/tools/`, `src/resources/`, `src/types/tool-contract.ts` to previous state
2. Remove tool registrations from MCP handler
3. Remove `TRELLO_DEFAULT_BOARD_ID` from environment if no longer needed
4. No data migration required (contract only affects interface)

## Dependencies

- `mcp-bootstrap-opencode` must complete bootstrap/source-of-truth alignment before this change can claim MCP runtime readiness
- TRELLO_API_KEY and TRELLO_TOKEN environment variables configured
- Valid TRELLO_DEFAULT_BOARD_ID or single board accessible for auto-discovery
- `@modelcontextprotocol/sdk` for MCP server implementation

## Dependency Note

This change defines a target Trello contract on top of an existing minimal MCP bootstrap. The repository now has a runnable `stdio` bootstrap plus the diagnostic tool `bootstrap.status`, but it still lacks Trello runtime, Trello tools/resources, and Trello adapters. This change therefore remains downstream contract/runtime work rather than evidence of a Trello-ready server.

## Success Criteria

- [ ] All 5 tools respond with correctly typed JSON-RPC responses
- [ ] All 3 resources return structured board data
- [ ] Fuzzy card matching correctly identifies cards by name
- [ ] Labels are added (not replaced) when using `trello_add_labels`
- [ ] Missing list is created implicitly in `trello_create_card`
- [ ] Board auto-discovery works when `TRELLO_DEFAULT_BOARD_ID` is unset
