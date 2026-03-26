---
name: release-checklist
description: >
  Provee una checklist de readiness para cambios en el servidor MCP y sus skills,
  evitando marcar como listo algo que no fue verificado. Trigger: usar cuando el
  pedido trate sobre release, entrega, QA, smoke review, docs o handoff.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Cuando se prepare una entrega interna o una release tecnica.
- Cuando haya que validar que la documentacion y los skills no mienten.
- Cuando se quiera resumir que falta antes de considerar algo listo.

## Critical Patterns

- No decir "listo" sin evidencia: archivos, comandos, tests o checklist completada.
- Verificar coherencia entre `README.md`, `AGENTS.md` y `skills/`.
- Confirmar que no haya secretos, scripts inventados ni docs desactualizadas.
- Separar claramente lo implementado de lo pendiente.

## Release Checklist

| Item | Evidencia esperada |
| --- | --- |
| Alcance claro | Resumen de cambio y limites declarados |
| Documentacion consistente | Lectura de `README.md`, `AGENTS.md` y skills afectadas |
| Estado git limpio o entendido | `git status --short --branch` |
| Riesgos explicitados | Lista de pendientes o validaciones futuras |
| Sin pasos ficticios | Comandos reales o marcados como pendientes |

## Minimal Example

```txt
Hecho: bootstrap de skills y workflow.
Pendiente: package.json, tsconfig, src/.
Evidencia: AGENTS.md + skills/*/SKILL.md + git status.
```

## Commands

```bash
git status --short --branch
git diff -- AGENTS.md skills
```

## Exit Criteria

- El cambio tiene alcance acotado y no promete features no implementadas.
- La documentacion dice exactamente lo que existe hoy en el repo.
- Los siguientes pasos quedan enumerados sin vender humo.
