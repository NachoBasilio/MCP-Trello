## Scope

Estas reglas aplican dentro de `openspec/` y sus subcarpetas.

## Objetivo de la carpeta

`openspec/` guarda la fuente de verdad de cambios SDD, sus dependencias y la evidencia documental que justifica cada fase.

## Reglas especificas

- No describir como existente ningun runtime, tool, resource o integracion que hoy no tenga evidencia verificable en el repo.
- Toda spec nueva o modificada debe dejar explicita su relacion con cambios previos o dependencias activas cuando exista solapamiento.
- Si `README.md`, `AGENTS.md` raiz y `openspec/` entran en conflicto, corregirlos en el mismo cambio o dejar rationale explicito.
- Usar `proposal.md` para alcance y dependencia, `specs/` para comportamiento esperado y `design.md`/`tasks.md` solo cuando la fase corresponda.
- Mantener el foco en bootstrap y contratos; ni en pedo meter implementacion de runtime en esta carpeta.

## Checklist rapido

- [ ] La documentacion distingue entre estado actual y arquitectura objetivo.
- [ ] Las dependencias entre cambios quedaron explicitadas.
- [ ] No hay claims sin archivo, comando o artifact que los respalde.
