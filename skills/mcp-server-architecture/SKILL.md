---
name: mcp-server-architecture
description: >
  Define una arquitectura escalable para un servidor MCP en Node.js/TypeScript,
  separando transporte, dominio y adapters. Trigger: usar cuando el pedido trate
  sobre arquitectura MCP, handlers, tools/resources/prompts, boundaries o layout
  de carpetas.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Cuando haya que definir o revisar la estructura del servidor MCP.
- Cuando aparezcan decisiones sobre handlers, registries, adapters o dominio.
- Cuando se evalue como crecer sin mezclar protocolo, negocio y proveedores externos.

## Critical Patterns

- Separar `src/mcp/` del dominio y de las integraciones externas.
- Modelar capacidades MCP como casos de uso estables; el transporte solo traduce entrada/salida.
- Toda dependencia a Trello vive detras de un adapter con interfaz propia.
- Centralizar validacion y mapping en boundaries; no dejar payloads crudos circular por todo el sistema.
- Disenar para sumar tools y resources sin duplicar wiring.

## Recommended Shape

| Capa | Responsabilidad | Evitar |
| --- | --- | --- |
| `src/mcp/` | Server bootstrap, registry de tools/resources/prompts, handlers | Logica de negocio |
| `src/application/` | Casos de uso y puertos | Dependencia directa del SDK de Trello |
| `src/domain/` | Entidades, invariantes, value objects | Imports de infraestructura |
| `src/infrastructure/trello/` | Cliente HTTP, auth, mappers externos | Reglas de negocio dispersas |

## Minimal Example

```ts
export interface TrelloBoardGateway {
  listBoards(workspaceId: string): Promise<BoardSummary[]>;
}

export class ListBoards {
  constructor(private readonly gateway: TrelloBoardGateway) {}

  execute(workspaceId: string) {
    return this.gateway.listBoards(workspaceId);
  }
}
```

## Commands

```bash
mkdir -p src/mcp src/application src/domain src/infrastructure/trello
mkdir -p tests/unit tests/contracts
```

## Decision Checks

- Si un cambio toca protocolo MCP y Trello a la vez, partirlo en dos capas y definir interfaz intermedia.
- Si una tool necesita mas de un servicio externo, crear un caso de uso orquestador en `src/application/`.
- Si un handler empieza a mapear demasiados campos, mover ese mapping a un adapter dedicado.
