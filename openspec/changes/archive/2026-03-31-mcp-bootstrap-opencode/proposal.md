# Proposal: mcp-bootstrap-opencode

## Intent

Define the bootstrap source of truth for the MCP server repository so the documented architecture, current scaffolding, and downstream Trello contract work all describe the same reality.

## Scope

### In Scope
- Repository-level bootstrap evidence for the current MCP server state
- Explicit separation between implemented foundations and not-yet-implemented MCP runtime
- Documentation alignment across `README.md`, `AGENTS.md`, and `openspec/`
- Dependency declaration for downstream changes that assume MCP tools/resources exist

### Out of Scope
- Implementing MCP runtime, handlers, registry, or transports
- Implementing Trello adapters, tools, resources, or prompts
- Running builds, releases, or deployment steps

## Approach

Capture the current bootstrap truth as documentation-first SDD artifacts. Keep the existing domain/config groundwork visible, but require all docs to state that MCP runtime capabilities are still pending. Downstream Trello contract work must reference this bootstrap change as a prerequisite rather than implying the server already exists.

## Affected Areas

| Area | Impact | Description |
| --- | --- | --- |
| `README.md` | Modified | Align current status with verified bootstrap reality |
| `AGENTS.md` | Modified | Add `openspec/` as source of truth for planned changes |
| `openspec/` | New/Modified | Record bootstrap spec and change dependencies |
| `openspec/changes/trello-mcp-tool-contract/` | Modified | Mark bootstrap dependency and avoid contradictory assumptions |

## Risks

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Future docs overstate runtime readiness again | Medium | Keep bootstrap spec as prerequisite reference in downstream changes |
| Parallel changes duplicate architecture decisions | Medium | Centralize bootstrap truth in `mcp-bootstrap-opencode` and reference it from other changes |
| Contributors misread domain scaffolding as full MCP readiness | High | State explicitly that domain/config foundations do not equal runtime MCP support |

## Rollback Plan

1. Revert the bootstrap documentation updates in `README.md`, `AGENTS.md`, and `openspec/`
2. Remove dependency notes from downstream change artifacts
3. Restore the previous documentation state if a replacement bootstrap source of truth is introduced

## Dependencies

- Verified repository state on branch `feat/mcp-bootstrap`
- Existing placeholder entrypoint at `src/index.ts`
- Existing Trello contract change `trello-mcp-tool-contract`, which must be reconciled with bootstrap reality

## Success Criteria

- [ ] `README.md`, `AGENTS.md`, and `openspec/` describe the same current bootstrap status
- [ ] `mcp-bootstrap-opencode` has a spec artifact that distinguishes current foundations from pending runtime work
- [ ] `trello-mcp-tool-contract` declares its dependency on the bootstrap change instead of implying ready MCP runtime
