# Bootstrap Specification

## Purpose

Define the repository bootstrap contract for the MCP Trello server so planning artifacts, root documentation, and future changes remain aligned with the verified state of the codebase.

## Requirements

### Requirement: Documentation MUST distinguish current state from target architecture

The repository documentation MUST separate verified bootstrap state from planned MCP server architecture.

#### Scenario: Root documentation reflects verified bootstrap state

- GIVEN the repository contains `src/index.ts` as a placeholder entrypoint
- AND `src/mcp/` does not contain implemented handlers or registry files
- WHEN a maintainer reads the root documentation
- THEN the documentation MUST state that MCP runtime bootstrap is still pending
- AND the documentation MAY describe the target architecture only if it is clearly labeled as planned or target state

#### Scenario: Foundations are not misrepresented as runtime readiness

- GIVEN the repository already contains domain, config, and shared foundation files
- WHEN those files are referenced in repository documentation or planning artifacts
- THEN the documentation MUST describe them as partial foundations
- AND it MUST NOT claim that MCP tools, resources, or transports are already implemented

### Requirement: Bootstrap change MUST be the prerequisite source of truth for runtime-facing changes

Any change that describes MCP tools, resources, or Trello runtime behavior MUST declare whether it depends on the bootstrap change.

#### Scenario: Downstream Trello contract change declares bootstrap dependency

- GIVEN `trello-mcp-tool-contract` describes MCP tools and resources for Trello
- WHEN its proposal or related evidence is updated
- THEN it MUST declare dependency on `mcp-bootstrap-opencode` for MCP bootstrap/runtime readiness
- AND it MUST avoid language that implies the runtime wiring already exists in the repository today

#### Scenario: New runtime-facing change is proposed before bootstrap completion

- GIVEN a future change introduces MCP handlers, registry wiring, or transport concerns
- WHEN that change is documented in `openspec/`
- THEN it MUST reference the bootstrap source of truth
- AND it SHOULD state whether it consumes, extends, or supersedes the bootstrap assumptions

### Requirement: OpenSpec MUST record change relationships and rationale when conflicts exist

When repository docs and change artifacts conflict, `openspec/` MUST capture the resolved rationale and updated dependency chain.

#### Scenario: Conflict between target contract and current codebase is resolved

- GIVEN a change artifact describes behavior that is not yet present in the repository
- WHEN the conflict is identified during SDD work
- THEN `openspec/` MUST record which artifact becomes the source of truth for the current phase
- AND the updated artifacts MUST explain the dependency or sequencing rationale

#### Scenario: Active changes can be reviewed without guessing

- GIVEN there are multiple active changes with overlapping scope
- WHEN a maintainer inspects `openspec/README.md`
- THEN it MUST list the active changes and their current dependency relationship
- AND it MUST let the maintainer infer the next SDD step without assuming hidden context
