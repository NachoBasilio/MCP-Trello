## Scope

Estas reglas aplican solo dentro de `src/domain/` y sus subcarpetas.

## Objetivo de la carpeta

`src/domain/` define el modelo de dominio estable del servidor MCP de Trello:

- entidades
- value objects
- errores de dominio
- exports publicos del dominio

No es la capa para hablar con Trello, MCP ni configuracion de runtime.

## Reglas especificas

- No importar nada de `src/infrastructure/`, `src/mcp/` ni SDKs externos de transporte.
- No meter payloads crudos de Trello en el dominio; primero mapearlos en adapters o boundaries.
- Mantener entidades y value objects chicos, explicitos y con invariantes claras.
- Usar Zod solo para validar invariantes de runtime del dominio; no para mezclar concerns de transporte.
- Todo JSDoc nuevo o modificado debe escribirse en espanol.
- No usar variables de una sola letra en esta carpeta.
- Si agregas una entidad, value object o error publico, exportalo desde `src/domain/index.ts`.
- Los errores de dominio deben ser semanticos y tipados; no strings sueltos ni codigos magicos desperdigados.

## Decision checks

- Si una regla depende de HTTP, auth, env vars o Trello API raw, probablemente NO pertenece a `src/domain/`.
- Si un archivo necesita importar infraestructura para funcionar, el corte de capas esta mal.
- Si una validacion solo existe por el contrato MCP o por el shape del provider, moverla al boundary correspondiente.
- Si una logica representa una invariante del negocio o del lenguaje ubicuo, entonces si pertenece al dominio.

## Checklist rapido

- [ ] El archivo sigue siendo agnostico de MCP y de Trello HTTP.
- [ ] Las invariantes viven aca y estan cubiertas por tests unitarios.
- [ ] Los nombres del dominio son consistentes con el barrel `src/domain/index.ts`.
- [ ] El JSDoc esta en espanol y describe el por que o la invariante, no obviedades.
