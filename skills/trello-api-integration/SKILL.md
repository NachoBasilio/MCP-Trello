---
name: trello-api-integration
description: >
  Define como integrar la API de Trello desde un servidor MCP con auth segura,
  mapeos estables y control de errores. Trigger: usar cuando el pedido trate
  sobre Trello API, tokens, boards, lists, cards, labels, webhooks o adapters externos.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Cuando haya que consumir endpoints de Trello o modelar su respuesta.
- Cuando se diseñen adapters, clientes HTTP o politicas de reintento.
- Cuando se defina como exponer entidades Trello a traves de MCP.

## Critical Patterns

- Encapsular `key`, `token` y base URL en config, nunca hardcodeados.
- Tratar la API de Trello como sistema externo inestable: timeouts, retries acotados y errores tipados.
- Mapear payloads de Trello a DTOs internos antes de llegar al dominio.
- No exponer ids o campos opcionales sin aclarar nulabilidad y semantica.
- Preparar adapters para pagination, rate limiting y permisos insuficientes.

## Integration Checklist

| Tema | Decision minima |
| --- | --- |
| Auth | Variables de entorno y cliente dedicado |
| HTTP | Wrapper con timeout y parseo consistente |
| Mapping | DTO externo -> modelo interno |
| Observabilidad | Logs estructurados sin filtrar secretos |
| Errores | Categorias: auth, validation, not-found, rate-limit, upstream |

## Minimal Example

```ts
type TrelloCardDto = {
  id: string;
  name: string;
  idList: string;
  due: string | null;
};

type CardSummary = {
  id: string;
  title: string;
  listId: string;
  dueAt: string | null;
};
```

## Commands

```bash
mkdir -p src/infrastructure/trello
mkdir -p tests/fixtures/trello
```

## Edge Cases to Respect

- Webhooks y callbacks necesitan validacion de firma o estrategia equivalente antes de confiar en el payload.
- Los labels, members y custom fields pueden venir incompletos segun permisos y query params.
- Un 404 de Trello puede significar recurso inexistente o falta de acceso; no asumir de una.
