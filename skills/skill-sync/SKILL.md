---
name: skill-sync
description: >
  Audita y sincroniza metadata, referencias y estructura de las skills locales
  de `serverMCPTrello` para evitar desalineaciones entre `skills/` y
  `AGENTS.md`. Trigger: usar despues de crear o modificar cualquier skill, o
  cuando el pedido mencione sincronizar skills, validar metadata o revisar la
  coherencia del catalogo de agentes.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0.0"
---

# skill-sync

## Cuando usar

- Despues de crear o modificar cualquier skill dentro de `skills/`.
- Cuando `AGENTS.md` pueda haber quedado desalineado con el catalogo real.
- Antes de cerrar un PR que toque convenciones de agentes o workflow AI.

## Validaciones obligatorias

1. Estructura: cada skill vive en `skills/<nombre>/SKILL.md`.
2. Metadata minima: `name`, `description`, `license`, `metadata.author`, `metadata.version`.
3. Registro: toda skill activa aparece en `AGENTS.md` con proposito, trigger y ruta.
4. Triggers: no deben superponerse innecesariamente ni dejar huecos obvios.
5. Assets: si una skill depende de plantillas o ejemplos reutilizables, su carpeta `assets/` debe existir.
6. Coherencia: reglas de `AGENTS.md` y skills no deben contradecirse.

## Reglas criticas

- No inventar automatizaciones que el repo todavia no tiene.
- Mantener cambios chicos y auditables; sincronizar no es reescribir todo.
- Si falta una decision de modelo o governance, dejarla explicita como pendiente.
- Corregir primero fuentes de verdad (`skills/` y `AGENTS.md`) antes de tocar README u otros docs futuros.

## Checklist rapido

- [ ] Toda skill nueva esta registrada en `AGENTS.md`.
- [ ] Los triggers de auto-carga reflejan el uso real.
- [ ] No hay rutas rotas dentro de `skills/`.
- [ ] Las plantillas en `assets/` siguen las reglas actuales del repo.
- [ ] No quedaron skills meta faltantes para sostener el workflow.

## Comandos

```bash
git status --short --branch
git diff --check
```

## Resultado esperado

- El catalogo de skills queda coherente y navegable.
- Un agente nuevo puede entender que skill cargar sin adivinar.
- Los cambios en workflow AI quedan trazables en archivos concretos.
