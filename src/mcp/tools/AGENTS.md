## Scope

Estas reglas aplican dentro de `src/mcp/tools/` y sus subcarpetas.

## Objetivo de la carpeta

`src/mcp/tools/` define handlers MCP por tool, con validacion de entrada y serializacion de salida alineadas con el estado real del repo.

## Reglas especificas

- Cada archivo publica una sola tool y consume solo contratos de `src/application/` y `src/types/`.
- Las tools no leen entorno ni llaman infraestructura directamente.
- Las descripciones y metadata deben ser honestas respecto del alcance implementado hoy.

## Checklist rapido

- [ ] El handler solo traduce entrada/salida.
- [ ] El schema coincide con la implementacion real.
- [ ] La tool no promete operaciones fuera del slice actual.
