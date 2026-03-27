---
name: pull-request-prep
description: >
  Prepara y crea pull requests del repo con base `dev`, revisando estado de la
  rama, alcance, verificacion y cuerpo del PR antes de usar `gh pr create`.
  Trigger: cuando el pedido mencione pull request, PR, preparar entrega,
  resumir cambios para revision o crear PR con GitHub CLI.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0.0"
---

# pull-request-prep

## Cuando usar

- Cuando haya que preparar un PR desde la rama actual.
- Cuando el agente necesite redactar titulo, resumen y verificacion para revision.
- Cuando el pedido mencione `gh pr create`, base branch o entrega a `dev`.

## Patrones criticos

- En este repo la base por defecto es `dev`.
- NO apuntar a `main` salvo que el usuario lo pida de forma explicita.
- Antes de redactar el PR, inspeccionar estado de rama, diff y commits incluidos.
- El cuerpo del PR debe separar alcance, verificacion y fuera de alcance.
- No inventar pruebas ejecutadas ni compatibilidad no verificada.

## Workflow recomendado

1. Revisar el estado de la rama actual y si hay cambios sin commit.
2. Confirmar contra que rama compara el PR y usar `dev` por defecto.
3. Inspeccionar commits y diff acumulado desde la base real.
4. Redactar un titulo corto y un cuerpo que explique por que existe el PR.
5. Crear el PR con `gh pr create` usando `--base dev` salvo excepcion explicita.

## Inspeccion minima

- `git status --short --branch`
- `git branch --show-current`
- `git log --oneline --decorate dev..HEAD`
- `git diff --stat dev...HEAD`
- `git diff dev...HEAD`

## Plantilla de cuerpo

```md
## Resumen
- Punto 1 sobre el cambio
- Punto 2 sobre el impacto

## Verificacion
- [x] `git diff --check`
- [ ] Otras pruebas ejecutadas si realmente se corrieron

## Fuera de alcance
- Lo que deliberadamente no se incluye en este PR
```

## Comandos

```bash
git status --short --branch
git branch --show-current
git log --oneline --decorate dev..HEAD
git diff --stat dev...HEAD
gh pr create --base dev --title "tipo/alcance: descripcion" --body-file /tmp/pr-body.md
```

## Validacion

- Verificar que la rama actual no sea `main` antes de crear el PR.
- Verificar que `dev` exista y sea la base correcta del repo.
- Confirmar que el cuerpo del PR refleje solo cambios observados en commits y diff.
- Si falta verificacion ejecutable, declararlo explicitamente en el PR.
