## Scope

Estas reglas aplican dentro de `tests/unit/application/` y sus subcarpetas.

## Objetivo de la carpeta

`tests/unit/application/` protege casos de uso y puertos chicos con dobles deterministas.

## Reglas especificas

- Mockear solo puertos externos al caso de uso.
- Describir si el caso cubre defaults, errores o reglas de filtrado.
- No duplicar la logica interna del use case dentro del fake.

## Checklist rapido

- [ ] El puerto fake es minimo y legible.
- [ ] La asercion observa comportamiento del caso de uso.
- [ ] No hay red ni SDKs externos.
