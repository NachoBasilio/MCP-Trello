## Scope

Estas reglas aplican dentro de `tests/unit/` y sus subcarpetas.

## Objetivo de la carpeta

`tests/unit/` fija contratos chicos y deterministas para helpers puros,
factories y boundaries de traduccion sin arrancar transporte real.

## Reglas especificas

- Mockear solo colaboraciones externas al unit bajo prueba; no duplicar el comportamiento interno del modulo.
- Cada prueba debe dejar explicito si protege defaults, errores o metadata observable.
- Evitar fixtures innecesarias cuando alcanza con stubs locales y descriptivos.
- No tocar red, filesystem ni transporte MCP real desde esta carpeta.

## Checklist rapido

- [ ] El caso aísla una sola unidad o boundary chico.
- [ ] Los dobles de prueba son minimos y legibles.
- [ ] La asercion protege comportamiento observable y no detalles accidentales.
