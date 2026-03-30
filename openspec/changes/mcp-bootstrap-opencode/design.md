# Design: MCP Bootstrap OpenCode

## Technical Approach

This design defines the target bootstrap shape for the first runnable MCP server entrypoint without claiming Trello runtime support that does not exist yet. The current repository already provides partial foundations in `src/config/index.ts`, `src/domain/`, and `src/shared/index.ts`, while `src/index.ts` remains a placeholder and `src/mcp/` / `src/application/` still contain only reserved directories.

The bootstrap implementation is designed as a thin composition root:

1. `src/index.ts` owns process-level side effects.
2. `src/config/` loads and validates environment.
3. `src/application/` defines stable ports/use cases that do not depend on MCP or Trello SDK details.
4. `src/infrastructure/trello/` will eventually provide Trello adapters behind application ports.
5. `src/mcp/` translates transport concerns into application calls through registries and handlers.

For OpenCode, the first supported runtime transport should be local process transport (`stdio`) because the repository is explicitly scoped as a local MCP server and the downstream Trello contract is written as an MCP contract consumed by OpenCode. This bootstrap change still stops short of implementing that transport; it only records the design boundary and sequencing.

## Architecture Decisions

### Decision: Keep all runtime side effects in the entrypoint

**Choice**: `src/index.ts` is the only file that should load environment, assemble dependencies, start the MCP transport, and report fatal startup errors.

**Alternatives considered**: Loading config from multiple modules; letting `src/mcp/` or Trello adapters perform startup side effects implicitly.

**Rationale**: `src/AGENTS.md` explicitly requires avoiding side effects outside `src/config/` and the entrypoint. A single composition root keeps bootstrap testable and prevents hidden transport/config coupling.

### Decision: Bootstrap for OpenCode over stdio first

**Choice**: Design the first real transport as MCP `stdio` for local host execution.

**Alternatives considered**: Starting with SSE/HTTP transport; designing a generic multi-transport factory before the first runnable server exists.

**Rationale**: The repo README describes a local MCP server, and `trello-mcp-tool-contract` defines a contract between this server and OpenCode. `stdio` is the minimal transport shape for a local coding-assistant integration and avoids premature transport abstraction during bootstrap.

### Decision: Separate composition, registry, and handlers

**Choice**: Use three explicit MCP bootstrap boundaries:

- `src/index.ts`: composition root and startup.
- `src/mcp/registry.ts`: capability registration and metadata wiring.
- `src/mcp/handlers.ts`: aggregate handler wiring, with concrete capability modules living under `src/mcp/tools/` and `src/mcp/resources/` when Trello runtime work starts.

**Alternatives considered**: One large `src/index.ts`; a single `handlers.ts` file responsible for bootstrap, registration, and request translation.

**Rationale**: The local architecture skill for this repo requires `src/mcp/` to own bootstrap/registry/handlers while keeping business logic out. A dedicated registry layer lets downstream changes add capabilities without rewriting startup code.

### Decision: Keep application ports stable while Trello runtime is still absent

**Choice**: `src/application/` should expose ports/use cases that are transport-agnostic and Trello-provider-agnostic; bootstrap can wire a non-Trello diagnostic capability before Trello adapters exist.

**Alternatives considered**: Let handlers call Trello HTTP code directly; delay application boundaries until Trello implementation work starts.

**Rationale**: The repo already reserves `src/application/` and `src/infrastructure/trello/`. Defining the seam now prevents the downstream Trello contract from turning into direct transport-to-provider coupling.

### Decision: Start with truthful minimal capabilities

**Choice**: The first bootstrap-ready server should expose server identity plus a single non-Trello diagnostic tool named `bootstrap.status`, and it must not advertise any Trello tool/resource yet.

**Alternatives considered**: Shipping an empty capability registry; shipping placeholder Trello tools that return "not implemented"; documenting target Trello capabilities as if they were part of bootstrap readiness.

**Rationale**: The active bootstrap spec forbids claiming tools/resources/transports already exist when they do not. A single diagnostic tool gives OpenCode a real smoke-verification surface without overselling Trello runtime support or leaving the registry empty.

## Data Flow

Current target bootstrap flow:

```text
process start
  -> src/index.ts
      -> loadConfig(process.env)
      -> create application dependency container
      -> create MCP server instance
      -> register capabilities from src/mcp/registry.ts
      -> connect stdio transport for OpenCode
```

Target layering once downstream Trello work starts:

```text
OpenCode host
  -> stdio transport
    -> src/mcp/registry.ts
      -> src/mcp/handlers/*
        -> src/application/* use cases
          -> src/infrastructure/trello/* adapters
            -> Trello REST API
```

## File Changes

| File | Action | Description |
| --- | --- | --- |
| `openspec/changes/mcp-bootstrap-opencode/design.md` | Create | Record the bootstrap runtime design and sequencing boundaries |
| `openspec/README.md` | Modify | Update the highest observed phase for `mcp-bootstrap-opencode` from SPEC to DESIGN |
| `src/index.ts` | Planned Modify | Replace placeholder with the single composition root when APPLY starts |
| `src/mcp/registry.ts` | Planned Create | Centralize capability registration and keep bootstrap wiring out of handlers |
| `src/mcp/handlers.ts` | Planned Create | Aggregate MCP-facing handler wiring without business logic or Trello HTTP code |
| `src/mcp/tools/` | Planned Create | Hold tool-specific MCP translators when Trello runtime work is approved |
| `src/mcp/resources/` | Planned Create | Hold resource-specific MCP translators when Trello runtime work is approved |
| `src/application/` | Planned Create | Add transport-agnostic ports/use cases consumed by handlers |
| `src/infrastructure/trello/` | Planned Create | Add Trello adapters only when downstream Trello runtime work is approved |

## Interfaces / Contracts

Target internal contracts for APPLY work:

```ts
export interface CapabilityRegistry {
  register(): void;
}

export interface McpHandler<Input, Output> {
  execute(input: Input): Promise<Output>;
}

export interface ApplicationDependencies {
  config: Config;
  getBootstrapStatus(): BootstrapDiagnosticSnapshot;
}
```

Boundary rules:

- `src/index.ts` may import config, MCP bootstrap modules, and dependency factories.
- `src/mcp/registry.ts` may import MCP SDK types and handler factories, but not Trello HTTP clients directly.
- `src/mcp/handlers.ts`, `src/mcp/tools/*`, and `src/mcp/resources/*` may import application ports/use cases and mapping helpers, but not raw environment reads.
- `src/application/*` may depend on domain types and abstract ports only.
- `src/infrastructure/trello/*` may depend on config and provider payload mapping, but must stay behind application ports.

## Testing Strategy

| Layer | What to Test | Approach |
| --- | --- | --- |
| Unit | Config loading and bootstrap dependency factories | Reuse `loadConfig` tests/patterns and assert pure composition helpers without starting transport |
| Unit | Registry wiring | Verify capability registration with mocked MCP server interfaces |
| Unit | Handlers | Verify input/output translation against application ports using stubs |
| Integration | Entrypoint bootstrap | Spawn the entrypoint with test env and assert startup failure/success boundaries without Trello calls |
| E2E | Not in bootstrap phase | Defer until Trello runtime capabilities exist |

## Migration / Rollout

No migration required.

Recommended sequencing:

1. Complete this bootstrap design and task breakdown.
2. Implement a runnable MCP bootstrap with truthful minimal capabilities only.
3. Keep Trello tools/resources in the downstream `trello-mcp-tool-contract` change.
4. Extend the registry/handlers only after the transport bootstrap is proven.

## Open Questions

- [ ] Confirm whether OpenCode in the target developer workflow needs only `stdio` or if an additional transport must be supported later.
