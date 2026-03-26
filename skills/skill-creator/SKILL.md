---
name: skill-creator
description: >
  Crea o actualiza skills y guias de agentes locales para `serverMCPTrello`
  sin romper consistencia operativa ni duplicar reglas. Trigger: cuando el
  pedido mencione nuevas skills, AI workflow, agentes, instrucciones del repo,
  o cambios en `AGENTS.md`.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Cuando haya que crear una nueva skill dentro de `skills/`.
- Cuando haya que actualizar `AGENTS.md` para registrar skills locales.
- Cuando el proyecto necesite formalizar un workflow reusable para agentes.
- Cuando una convención del repo se repita y convenga convertirla en skill.

## Critical Patterns

- NO crear skills por capricho; solo cuando encapsulen una decision reusable.
- Cada skill debe vivir en `skills/{skill-name}/SKILL.md`.
- La carpeta `skills/{skill-name}/assets/` debe existir cuando la skill necesite plantillas reutilizables.
- Toda skill nueva debe quedar registrada en `AGENTS.md` con proposito, trigger y ruta.
- La descripcion del frontmatter debe incluir el trigger de uso, no solo el nombre.
- Evitar duplicar reglas globales si ya existen en `AGENTS.md`; la skill debe complementar, no clonar.
- Si una skill depende de una decision tecnica aun no tomada, marcarlo como pendiente en vez de inventar defaults.

## Workflow

1. Detectar si el problema es realmente reusable.
2. Definir un nombre corto, estable y orientado a accion o dominio.
3. Crear `skills/{skill-name}/SKILL.md` con frontmatter valido.
4. Documentar patrones criticos, ejemplos minimos y comandos reales.
5. Registrar la skill en `AGENTS.md`.
6. Verificar consistencia con lectura de archivos y `git diff --check`.

## Assets

- Usar `assets/SKILL-template.md` como punto de partida para nuevas skills.
- Adaptar el frontmatter al repo real; no copiar placeholders a ciegas.
- Si la skill necesita mas de una plantilla, agruparlas por uso dentro de `assets/`.

## Naming Guide

| Tipo | Patron | Ejemplo |
| --- | --- | --- |
| Arquitectura | `{dominio}-{enfoque}` | `mcp-server-architecture` |
| Integracion | `{proveedor}-api-{alcance}` | `trello-api-integration` |
| Tooling | `{runtime}-{stack}-setup` | `node-typescript-setup` |
| Calidad | `{objetivo}-{alcance}` | `testing-contracts` |

## Commands

```bash
git status --short --branch
git diff --check
```

## Validation

- Leer la skill creada completa despues de escribirla.
- Confirmar que `AGENTS.md` la referencia.
- Verificar que los triggers no pisen otra skill sin necesidad.
- No agregar `assets/` o `references/` vacios solo para aparentar estructura.
- Verificar que las plantillas en `assets/` esten sincronizadas con las reglas actuales del repo.
