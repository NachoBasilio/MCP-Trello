---
name: node-typescript-setup
description: >
  Estandariza el bootstrap de un proyecto Node.js + TypeScript para un servidor MCP,
  con scripts y convenciones listas para crecer. Trigger: usar cuando el pedido trate
  sobre setup, TypeScript, scripts, estructura base, tooling o configuracion inicial.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Cuando haya que crear o revisar `package.json`, `tsconfig.json` o scripts.
- Cuando se defina el layout inicial del repo.
- Cuando se quiera evitar meter tooling de mas antes de tener necesidad real.

## Critical Patterns

- Arrancar con el minimo stack estable: Node LTS, TypeScript estricto y scripts simples.
- Mantener un entrypoint claro para el server MCP y separar config de runtime.
- No agregar frameworks pesados si el servidor puede resolverse con SDK MCP + utilidades chicas.
- Preferir aliases o helpers solo si reducen complejidad real; ni en pedo meter magia temprano.
- Documentar scripts como `pendiente` si todavia no existen en el repo.
- Todo JSDoc nuevo o modificado debe escribirse en espanol, especialmente en APIs publicas, factories y boundaries.
- Cada carpeta que gane complejidad propia debe tener su `AGENTS.md` local para registrar reglas de scope, asi la raiz no termina siendo un quilombo monolitico.

## Baseline Decisions

| Tema | Recomendacion |
| --- | --- |
| Runtime | Node.js LTS |
| Lenguaje | TypeScript con `strict: true` |
| Scripts | `dev`, `test`, `lint`, `typecheck` cuando existan |
| Config | `src/config/` con lectura de env encapsulada |
| Errores | Resultados tipados o errores de dominio, no strings sueltos |

## Minimal Example

```json
{
  "type": "module",
  "scripts": {
    "dev": "pendiente-definir",
    "test": "pendiente-definir",
    "typecheck": "tsc --noEmit"
  }
}
```

## Commands

```bash
npm pkg set type=module
npx tsc --init
mkdir -p src/config src/shared
```

## Guardrails

- Si el repo aun no tiene scripts ejecutables, no inventarlos en AGENTS; marcarlos como pendientes.
- Si aparece una libreria nueva, justificar que problema resuelve.
- Si una convencion se repite, moverla a skill antes de duplicarla en prompts sueltos.
