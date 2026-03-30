## Scope

Estas reglas aplican dentro de `src/infrastructure/trello/` y sus subcarpetas.

## Objetivo de la carpeta

`src/infrastructure/trello/` encapsula cliente HTTP, mapeos externos y traduccion de errores hacia contratos internos estables.

## Reglas especificas

- No importar SDKs de MCP ni mezclar serializacion del protocolo en esta capa.
- Toda llamada a Trello debe pasar por helpers chicos que inyecten auth, timeout y parseo consistente.
- Los payloads crudos de Trello se validan o normalizan aca antes de salir hacia `src/application/`.
- La logica de matching por nombre vive en dominio/aplicacion; aca solo se obtiene y traduce data remota.

## Checklist rapido

- [ ] No hay lecturas directas de `process.env`; usar `Config` inyectado.
- [ ] Los errores devueltos son `DomainError` tipados.
- [ ] La salida publicada no expone payloads crudos de Trello.
