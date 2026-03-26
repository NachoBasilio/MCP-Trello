---
name: testing-contracts
description: >
  Define una estrategia minima y escalable de pruebas para contratos MCP,
  adapters de Trello y casos de uso en Node.js/TypeScript. Trigger: usar cuando
  el pedido trate sobre tests, contratos, mocks, fixtures, validacion o regresiones.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Cuando haya que planificar o escribir pruebas.
- Cuando se agreguen nuevas tools/resources/prompts o adapters.
- Cuando se quieran fijar contratos antes de integrar con Trello real.

## Critical Patterns

- Priorizar tests de casos de uso y contract tests sobre snapshots sin criterio.
- Cada adapter externo necesita fixtures que representen respuestas reales y errores comunes.
- Los contratos MCP se validan por forma y semantica, no solo por status feliz.
- Mockear Trello en unit tests; reservar integracion real para pruebas acotadas y explicitas.
- Si un bug aparece, primero escribir una prueba que lo reproduzca.

## Test Pyramid

| Tipo | Objetivo | Doble recomendado |
| --- | --- | --- |
| Unit | Casos de uso y mappers | Fakes o stubs chicos |
| Contract | Input/output de handlers MCP | Fixtures versionadas |
| Integration | Cliente Trello y parsing | Sandbox o respuestas controladas |

## Minimal Example

```ts
it('maps a Trello card into MCP-safe output', async () => {
  const gateway = fakeGatewayReturningCard();
  const useCase = new GetCard(gateway);

  await expect(useCase.execute('card-1')).resolves.toMatchObject({
    id: 'card-1',
    title: 'Refinar backlog'
  });
});
```

## Commands

```bash
mkdir -p tests/unit tests/contracts tests/fixtures
npm test # cuando exista el script test
```

## Review Heuristics

- Un test vale si detecta un cambio roto de contrato o una regla de negocio.
- Si cuesta demasiado mockear algo, probablemente la interfaz esta mal cortada.
- Si una fixture no documenta el caso que cubre, renombrala y hacela explicita.
