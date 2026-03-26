# MCP Trello Server

Servidor MCP local para integraciones con Trello, construido con Node.js y TypeScript.

## Descripción general

Este proyecto implementa un servidor local basado en Model Context Protocol (MCP) para exponer capacidades de Trello como herramientas y recursos consumibles por hosts compatibles con MCP.

El objetivo es ofrecer una base mantenible, tipada, testeable y extensible para interactuar con tableros, listas y tarjetas de Trello.

## Capacidades previstas

La primera etapa del servidor contempla, como mínimo:

- listar tableros de Trello
- listar listas de un tablero
- listar tarjetas de una lista
- crear tarjetas
- agregar comentarios a tarjetas

## Stack tecnológico

- **Node.js** — runtime del servidor MCP local
- **TypeScript** — tipado estático y mantenibilidad del código
- **MCP TypeScript SDK** (`@modelcontextprotocol/server`) — SDK oficial para implementar servidores MCP
- **Zod** — validación de esquemas utilizada por el SDK
- **Trello REST API** — capa de integración con Trello

## SDK de MCP

El repositorio oficial del SDK de TypeScript para MCP es:

- <https://github.com/modelcontextprotocol/typescript-sdk>

Guía de implementación actual:

- usar el SDK de TypeScript para implementar el servidor
- priorizar la línea **v1.x** para trabajo orientado a estabilidad
- evitar tomar el branch `main` como referencia estable mientras v2 siga en estado pre-alpha

Esta recomendación se basa en el README oficial del repositorio, que indica que el branch `main` contiene v2 en desarrollo y que v1.x sigue siendo la línea recomendada para uso productivo.

## Estado del proyecto

Actualmente este repositorio se encuentra en etapa de preparación inicial.

Completado hasta ahora:

- bootstrap del repositorio
- documentación base del workflow
- skills locales y guía de agentes
- convenciones iniciales del proyecto

Pendiente:

- scaffold inicial del servidor
- integración con cliente de Trello
- implementación de tools y resources MCP
- pruebas automatizadas

## Convenciones del repositorio

- `AGENTS.md` define las reglas de trabajo y guías específicas del proyecto
- `skills/` contiene skills reutilizables para arquitectura, setup, testing, release y consistencia del workflow

## Licencia

La información de licencia se agregará cuando la base de implementación del proyecto quede definida.
