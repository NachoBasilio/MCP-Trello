## Proyecto

`serverMCPTrello` es la base para un servidor MCP local en Node.js + TypeScript que expone capacidades de Trello con una arquitectura mantenible, testeable y lista para crecer sin hotfixes improvisados.

## Objetivo de este bootstrap

- Definir un workflow de agentes y skills reutilizables antes de implementar el servidor.
- Priorizar contratos claros, boundaries por dominio y automatizacion de calidad.
- Mantener el repo chico: esta etapa solo documenta estructura y decisiones operativas.

## Fuente de verdad

1. Solicitud explicita del usuario.
2. Este `AGENTS.md`.
3. `README.md`.
4. `skills/*/SKILL.md`.

## Reglas de trabajo

- No implementar el servidor MCP completo durante el bootstrap de skills/agentes.
- No hacer build; validar con lectura, consistencia y estado git.
- No hacer commit ni push salvo instruccion explicita.
- Antes de tocar arquitectura, leer primero `skills/mcp-server-architecture/SKILL.md`.
- Antes de tocar integracion Trello, leer primero `skills/trello-api-integration/SKILL.md`.
- Antes de proponer setup o tooling, leer primero `skills/node-typescript-setup/SKILL.md`.
- Antes de agregar o cambiar pruebas, leer primero `skills/testing-contracts/SKILL.md`.
- Antes de preparar entrega o corte de release, leer primero `skills/release-checklist/SKILL.md`.
- Toda decision no trivial debe dejar evidencia en archivos o comandos verificables.

## Flujo recomendado

1. Definir alcance y capacidades MCP.
2. Diseñar arquitectura y contratos internos.
3. Acordar setup Node/TypeScript y estructura de carpetas.
4. Implementar integraciones Trello detras de adapters puros.
5. Cubrir contratos, validaciones y casos de error con tests.
6. Ejecutar checklist de release antes de exponer cambios como listos.

## Skills locales disponibles

| Skill | Proposito | Trigger principal | Ruta |
| --- | --- | --- | --- |
| `mcp-server-architecture` | Diseñar boundaries, transporte MCP y capas del servidor | Arquitectura MCP, folders, handlers, adapters | `skills/mcp-server-architecture/SKILL.md` |
| `node-typescript-setup` | Guiar setup inicial de Node.js + TypeScript sin sobreingenieria | `package.json`, `tsconfig`, scripts, tooling | `skills/node-typescript-setup/SKILL.md` |
| `trello-api-integration` | Estandarizar acceso a Trello, auth y mapeos de dominio | Boards, cards, labels, webhooks, rate limits | `skills/trello-api-integration/SKILL.md` |
| `testing-contracts` | Definir estrategia de pruebas para contratos MCP y adapters | Unit tests, contract tests, mocks, fixtures | `skills/testing-contracts/SKILL.md` |
| `release-checklist` | Validar readiness sin vender humo | Release, docs, changelog, seguridad, smoke review | `skills/release-checklist/SKILL.md` |

## Triggers de auto-carga

- Cargar `mcp-server-architecture` cuando el pedido mencione MCP server, tools/resources/prompts, handlers, arquitectura, capas o escalabilidad.
- Cargar `node-typescript-setup` cuando el pedido mencione bootstrap, setup, TypeScript, scripts, lint, estructura base o tooling.
- Cargar `trello-api-integration` cuando el pedido mencione Trello API, auth, tokens, boards, lists, cards, webhooks o mapeo de payloads.
- Cargar `testing-contracts` cuando el pedido mencione tests, contratos, validacion, mocks, fixtures o regression safety.
- Cargar `release-checklist` cuando el pedido mencione release, checklist, QA manual, readiness o entrega.

## Criterio de escalabilidad

- Preferir skills chicas y enfocadas antes que una mega-guia monolitica.
- Mantener nombres estables para poder reusar skills en futuros agentes.
- Toda nueva skill debe tener frontmatter completo, comandos reales o marcados como pendientes, y registrarse en esta tabla.
