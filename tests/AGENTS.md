## Scope

Estas reglas aplican solo dentro de `tests/` y sus subcarpetas.

## Objetivo de la carpeta

`tests/` documenta y protege los contratos del proyecto con foco en:

- invariantes de dominio
- regresiones de comportamiento
- claridad de la intencion de cada caso

## Reglas especificas

- Todo `describe`, `it` y JSDoc nuevo o modificado debe escribirse en espanol.
- Cada archivo de prueba debe incluir JSDoc utiles que expliquen el proposito del grupo de pruebas o la invariante cubierta.
- No agregar comentarios decorativos ni repetir literalmente el codigo bajo prueba.
- Mantener nombres descriptivos; no usar variables de una sola letra.
- Si una prueba cubre defaults, errores o invariantes, dejarlo explicito en la descripcion.
- Evitar mezclar concerns de infraestructura cuando la prueba pertenece al dominio.

## Checklist rapido

- [ ] Las descripciones de prueba explican comportamiento observable.
- [ ] El JSDoc aporta contexto real y esta en espanol.
- [ ] No se introducen builds ni validaciones fuera de las permitidas por el repo.
