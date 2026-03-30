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

Actualmente este repositorio ya tiene un bootstrap MCP runnable sobre `stdio`, pero todavia no implementa runtime funcional de Trello.

Completado hasta ahora:

- bootstrap runnable del servidor MCP sobre `stdio`
- tool diagnostica `bootstrap.status`
- tests unitarios e integracion del bootstrap MCP
- documentación base del workflow
- skills locales y guía de agentes
- convenciones iniciales del proyecto
- foundations de dominio, configuración y utilidades compartidas

Pendiente:

- integración con cliente de Trello
- implementación de tools y resources MCP de Trello
- cobertura automatizada del runtime real de Trello

## Estado verificado del bootstrap MCP

Evidencia actual del repo:

- `src/index.ts` crea un `McpServer`, registra capacidades bootstrap y conecta `StdioServerTransport`.
- `src/mcp/registry.ts` publica metadata honesta y registra una sola tool diagnostica.
- `src/mcp/handlers.ts` expone solamente `bootstrap.status` con `capabilityPolicy: 'diagnostic-only'` y `trelloRuntimeAvailable: false`.
- `src/application/bootstrap.ts` arma dependencias bootstrap-safe sin adapters ni runtime de Trello.

La arquitectura descripta en este README sigue siendo la arquitectura objetivo. Lo implementado hoy es solo el bootstrap local por `stdio` con una capacidad diagnostica; Trello runtime, tools y resources reales siguen pendientes.

## Cambios SDD activos

- `mcp-bootstrap-opencode`: define la fuente de verdad del bootstrap y alinea documentación con el estado real del repo.
- `trello-mcp-tool-contract`: define el trabajo downstream para agregar tools/resources reales de Trello encima del bootstrap ya existente.

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
