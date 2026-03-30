## Scope

Estas reglas aplican dentro de `src/types/` y sus subcarpetas.

## Objetivo de la carpeta

`src/types/` concentra contratos de boundary reutilizables para MCP y otros consumers, sin meter runtime ni infraestructura.

## Reglas especificas

- Mantener schemas chicos y enfocados en capacidades realmente implementadas.
- No leer entorno, no llamar red y no importar el SDK de MCP.
- Si una variante todavia no existe en runtime, no declararla como contrato activo.

## Checklist rapido

- [ ] Los schemas reflejan el estado real del repo.
- [ ] Los tipos exportados son concretos y chicos.
- [ ] No hay dependencias de infraestructura.
