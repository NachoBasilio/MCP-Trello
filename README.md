# MCP Trello Server

Servidor MCP local para integraciones con Trello, construido con Node.js y TypeScript.

## Descripción general

Este proyecto implementa un servidor local basado en Model Context Protocol (MCP) para exponer capacidades consumibles por hosts compatibles con MCP.

El objetivo es ofrecer una base mantenible, tipada, testeable y extensible para interactuar con Trello sin mezclar bootstrap, contrato y runtime real.

## Capacidades previstas

La primera etapa del servidor contempla, como mínimo:

- listar tableros de Trello
- listar listas de un tablero
- listar tarjetas de una lista
- crear tarjetas
- agregar comentarios a tarjetas

## Estructura objetivo del proyecto

```
src/
├── mcp/                    # Bootstrap del servidor MCP, registry de tools/resources/prompts
├── application/            # Casos de uso y puertos (interfaces)
├── domain/                 # Entidades, invariantes, value objects
├── infrastructure/         # Implementaciones externas
│   └── trello/            # Cliente HTTP, auth, mappers de Trello
├── config/                 # Lectura de variables de entorno
└── shared/                 # Utilidades compartidas
tests/
├── unit/                   # Tests unitarios
├── contracts/              # Tests de contratos entre capas
└── fixtures/trello/        # Fixtures para tests de Trello
```

### Responsabilidades objetivo de cada capa

| Capa | Responsabilidad | Evitar |
| --- | --- | --- |
| `src/mcp/` | Server bootstrap, registry, handlers | Lógica de negocio |
| `src/application/` | Casos de uso y puertos | Dependencia directa del SDK de Trello |
| `src/domain/` | Entidades, invariantes, value objects | Imports de infraestructura |
| `src/infrastructure/trello/` | Cliente HTTP, auth, mappers | Reglas de negocio dispersas |

## Stack tecnológico

- **Node.js** — runtime del servidor MCP local
- **TypeScript** — tipado estático y mantenibilidad del código
- **MCP TypeScript SDK** (`@modelcontextprotocol/server`) — SDK oficial para implementar servidores MCP
- **Zod** — validación de esquemas utilizada por el SDK
- **Trello REST API** — capa de integración con Trello

## Dependencias

| Paquete | Propósito |
| --- | --- |
| `@modelcontextprotocol/sdk` | SDK oficial de MCP |
| `zod` | Validación de schemas tipados |
| `dotenv` | Lectura de variables de entorno |
| `vitest` | Framework de testing |

## SDK de MCP

El repositorio oficial del SDK de TypeScript para MCP es:

- <https://github.com/modelcontextprotocol/typescript-sdk>

Guía de implementación actual:

- usar el SDK de TypeScript para implementar el servidor
- priorizar la línea **v1.x** para trabajo orientado a estabilidad
- evitar tomar el branch `main` como referencia estable mientras v2 siga en estado pre-alpha

Esta recomendación se basa en el README oficial del repositorio, que indica que el branch `main` contiene v2 en desarrollo y que v1.x sigue siendo la línea recomendada para uso productivo.

## Estado del proyecto

El runtime MCP ya expone **10 tools** y **3 resources** conectados al cliente real de Trello. El adapter aplica la precedencia de board (`boardId` > `boardName` normalizado > `TRELLO_DEFAULT_BOARD_ID` > autodiscovery de un solo board) y ahora incorpora backoff exponencial (1s, 2s, 4s) ante respuestas 429 o fallos de red antes de propagar un error `Rate limited`.

Completado hasta ahora:

- bootstrap runnable del servidor MCP sobre `stdio`
- tool diagnóstica `bootstrap.status`
- integración completa con Trello (boards, lists, cards, labels, comments)
- 10 tools (`trello_search_cards`, `trello_add_comment`, `trello_list_boards`, `trello_list_columns`, `trello_create_card`, `trello_move_card`, `trello_delete_card`, `trello_add_labels`, `trello_change_label_color`, tool diagnóstica) y 3 resources (`board-summary`, `board-overdue`, `board-by-label`)
- documentación base del workflow + skills locales
- board resolution determinística y retries centralizados
- cobertura completa de Unit Tests, Integración y Contratos (Layer 5 SDD cubierto)

## Estado verificado del bootstrap MCP

Evidencia actual del repo:

- `src/index.ts` crea un `McpServer`, registra todas las capacidades MCP de Trello y conecta `StdioServerTransport`.
- `src/mcp/registry.ts` publica metadata honesta con 10 tools y 3 resources.
- `src/mcp/handlers.ts` expone el tool map completo bajo `capabilityPolicy: 'diagnostic-plus-full-trello'` y `trelloRuntimeAvailable: true`.
- `src/application/bootstrap.ts` arma las dependencias y todos los use cases conectados a infraestructura.

La arquitectura descripta en este README se ha implementado de forma completa.

## Cambios SDD activos

- Ya no hay cambios activos pendientes. Las features principales (`mcp-bootstrap-opencode` y `trello-mcp-tool-contract`) fueron implementadas y archivadas.

## Scripts

```bash
npm install          # Instalar dependencias
npm run dev          # Levantar el bootstrap MCP local desde TypeScript
npm run mcp:start    # Comando estable recomendado para OpenCode
npm run test         # Ejecutar tests con vitest
npm run test:run     # Ejecutar tests una vez
npm run typecheck    # Verificación de tipos TypeScript
```

## Ejecucion local para OpenCode

Comando estable del repo para levantar el server MCP local:

```bash
npm run mcp:start
```

Por que este comando y no un build o wrapper extra:

- el entrypoint real ya existe en `src/index.ts`
- el bootstrap vigente usa `stdio`, que es el transporte verificado para OpenCode en este repo
- `tsx` ejecuta TypeScript directo y evita meter un paso de build que esta etapa no permite

Precondiciones verificables del arranque:

- `TRELLO_API_KEY` y `TRELLO_TOKEN` son obligatorias y `src/config/index.ts` falla temprano si faltan
- `TRELLO_DEFAULT_BOARD_ID` sigue siendo opcional en el bootstrap actual
- al arrancar hoy solo se expone la tool diagnostica `bootstrap.status`; el runtime real de Trello sigue pendiente

## Setup

1. Copiar `.env.example` a `.env`
2. Completar `TRELLO_API_KEY` y `TRELLO_TOKEN`
3. Ejecutar `npm install`
4. Levantar el bootstrap local con `npm run mcp:start`

## Convenciones del repositorio

- `AGENTS.md` define las reglas de trabajo y guías específicas del proyecto
- `openspec/` guarda cambios SDD, dependencias y evidencia documental cuando la arquitectura objetivo todavía no coincide con lo implementado
- `skills/` contiene skills reutilizables para arquitectura, setup, testing, release y consistencia del workflow

## Licencia

La información de licencia se agregará cuando la base de implementación del proyecto quede definida.
