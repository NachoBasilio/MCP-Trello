## Scope

Estas reglas aplican dentro de `tests/unit/infrastructure/trello/` y sus subcarpetas.

## Objetivo de la carpeta

`tests/unit/infrastructure/trello/` fija el boundary de adaptacion HTTP y mapeo a contratos internos sin tocar Trello real.

## Reglas especificas

- Mockear `fetch` y verificar URLs, parseo y errores observables.
- No testear matching de dominio aca; eso vive fuera de infraestructura.
- Mantener fixtures inline salvo que el caso requiera reuse real.

## Checklist rapido

- [ ] La prueba no toca red real.
- [ ] La asercion cubre mapping o error observable.
- [ ] El doble de `fetch` es explicito y chico.
