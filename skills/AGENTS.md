## Scope

Estas reglas aplican solo dentro de `skills/` y sus subcarpetas.

## Objetivo de la carpeta

`skills/` concentra guias reutilizables para agentes del repo. Cada skill debe
encapsular un workflow concreto, con triggers claros y evidencia verificable.

## Reglas especificas

- Toda skill nueva debe vivir en `skills/<nombre-estable>/SKILL.md`.
- El frontmatter debe incluir `name`, `description`, `license`, `metadata.author` y `metadata.version`.
- La descripcion debe explicar que hace la skill y cuando se dispara.
- No duplicar reglas globales completas si ya viven en `AGENTS.md`; la skill debe complementar.
- Todo ejemplo, checklist o comando debe ser coherente con este repo y con el flujo `dev` antes que `main`.
- No apuntar PRs a `main` salvo pedido explicito del usuario.
- Despues de crear o editar una skill, sincronizar referencias en `AGENTS.md` y revisar coherencia del catalogo.

## Checklist rapido

- [ ] La skill tiene nombre estable y reusable.
- [ ] El frontmatter esta completo.
- [ ] `AGENTS.md` raiz registra la skill con proposito, trigger y ruta.
- [ ] Los triggers no pisan otras skills sin necesidad.
