# Tasks: MCP Bootstrap OpenCode

## Dependency Note

This task plan owns the first runnable MCP bootstrap only: `src/index.ts`, `src/mcp/registry.ts`, and `src/mcp/handlers.ts` for OpenCode over `stdio` with truthful minimal capabilities.

It MUST NOT add Trello tools, Trello resources, or provider adapters. That runtime work remains in `trello-mcp-tool-contract` after this bootstrap change establishes the entrypoint and MCP wiring boundaries.

## Phase 1: Scope Lock And Bootstrap Contracts

- [x] 1.1 Resolve the open capability policy in `openspec/changes/mcp-bootstrap-opencode/design.md` so `src/mcp/registry.ts` has a fixed bootstrap target: either an empty capability set or a single non-Trello diagnostic capability.
- [x] 1.2 Create `src/application/bootstrap.ts` with the `ApplicationDependencies` shape and a pure `createApplicationDependencies(config)` factory that exposes only bootstrap-safe dependencies.
- [x] 1.3 Create `src/mcp/handlers.ts` with a `createBootstrapHandlers(dependencies)` aggregate that contains no Trello imports and only returns the capability set approved in task 1.1.
- [x] 1.4 Create `src/mcp/registry.ts` with `registerBootstrapCapabilities(server, handlers)` so capability registration and server metadata wiring stay out of `src/index.ts`.

## Phase 2: Entrypoint And Transport Wiring

- [x] 2.1 Update `src/index.ts` to replace the placeholder with the single composition root: call `loadConfig`, create application dependencies, create the MCP server, register bootstrap capabilities, connect `stdio`, and report fatal startup errors.
- [x] 2.2 Keep startup side effects confined to `src/index.ts` by ensuring `src/mcp/handlers.ts`, `src/mcp/registry.ts`, and `src/application/bootstrap.ts` remain pure module wiring without direct environment reads or implicit transport startup.
- [x] 2.3 Preserve truthful bootstrap scope in code by ensuring the initial registry does not advertise Trello tools/resources before `trello-mcp-tool-contract` is applied.

## Phase 3: Bootstrap Verification

- [x] 3.1 Create `tests/unit/config/index.test.ts` to pin the `loadConfig` behavior used by the entrypoint, including actionable failures for invalid or missing environment values.
- [x] 3.2 Create `tests/unit/mcp/handlers.test.ts` to verify `createBootstrapHandlers` only exposes the approved bootstrap capability set and does not depend on Trello adapters.
- [x] 3.3 Create `tests/unit/mcp/registry.test.ts` with mocked MCP server interfaces to verify server metadata plus bootstrap capability registration without starting a real transport.
- [x] 3.4 Create `tests/integration/bootstrap/index.test.ts` to exercise the entrypoint boundaries: invalid environment fails fast, valid environment reaches bootstrap startup, and no Trello runtime calls are required.

## Phase 4: Docs And Downstream Handoff

- [x] 4.1 Update `README.md` to describe the repository as having a runnable `stdio` bootstrap while keeping Trello tools/resources explicitly pending.
- [x] 4.2 Update `openspec/README.md` to mark `mcp-bootstrap-opencode` as implemented once Phase 1-3 land and to keep `trello-mcp-tool-contract` listed as downstream runtime work.
- [x] 4.3 Update `openspec/changes/trello-mcp-tool-contract/tasks.md` so its MCP-layer tasks extend the bootstrap entrypoint/registry/handlers instead of recreating them from scratch.

## Dependencies

```text
Phase 1 (Scope Lock And Bootstrap Contracts)
  └─ 1.1 must finish before 1.3 and 1.4 because registry/handler behavior depends on the approved bootstrap capability policy.
  └─ 1.2 must finish before 1.3 because handlers are assembled from application dependencies.

Phase 2 (Entrypoint And Transport Wiring)
  └─ 2.1 depends on 1.2-1.4.
  └─ 2.2 and 2.3 depend on 2.1 because they verify the concrete bootstrap wiring stays inside the intended boundaries.

Phase 3 (Bootstrap Verification)
  └─ 3.1 depends on the existing `src/config/index.ts` and should complete before 3.4.
  └─ 3.2 depends on 1.3.
  └─ 3.3 depends on 1.4.
  └─ 3.4 depends on 2.1-2.3 and uses the contract locked in 1.1.

Phase 4 (Docs And Downstream Handoff)
  └─ 4.1-4.2 depend on Phases 1-3 so docs describe verified runtime state instead of target-only architecture.
  └─ 4.3 depends on 1.1-2.3 because downstream MCP tasks must extend the final bootstrap ownership boundaries.
```

## Recommended Apply Batches

1. Batch A: 1.1-1.4
2. Batch B: 2.1-2.3
3. Batch C: 3.1-3.4
4. Batch D: 4.1-4.3

## Notes

- `package.json` already includes `@modelcontextprotocol/sdk`, so this bootstrap plan should wire the existing dependency instead of introducing transport abstraction or Trello-specific packages.
- `src/config/index.ts` and `src/shared/index.ts` already exist as verified foundations; this change should reuse them rather than recreating configuration or result primitives.
