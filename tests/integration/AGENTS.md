## Scope

Estas reglas aplican dentro de `tests/integration/` y sus subcarpetas.

## Objetivo de la carpeta

`tests/integration/` verifica boundaries entre modulos reales del bootstrap sin
usar Trello ni arrancar transportes reales.

## Reglas especificas

- Mockear solo SDKs, procesos o transportes externos al repo.
- Mantener reales los modulos internos del bootstrap salvo que el caso pida aislar un boundary puntual.
- Restaurar `process.env`, spies globales y cache de modulos en cada prueba.
- No introducir llamadas de red ni dependencias a credenciales reales.

## Checklist rapido

- [ ] El caso cruza modulos reales del repo.
- [ ] Los mocks externos son los minimos para observar el boundary.
- [ ] La prueba no vende runtime de Trello inexistente.
