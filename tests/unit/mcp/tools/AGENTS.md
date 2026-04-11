## Scope

Estas reglas aplican a `tests/unit/mcp/tools/`.

## Objetivo

Cubrir validaciones de contratos MCP para cada tool individual, enfocandonos en schemas zod y serializacion textual sin tocar infraestructura.

## Reglas

- Cada prueba debe describir la regla de validacion que protege.
- Usar `import.meta.url` para rutas relativas si se necesita cargar fixtures.
- No mockear la capa de aplicacion; solo se testean los schemas puros expuestos por los handlers.

## Checklist rapido

- [ ] La prueba apunta a un schema concreto.
- [ ] La descripcion explica la regla MCP cubierta.
- [ ] No se agregan dependencias de red.
