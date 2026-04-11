# server-mcp-trello

Servidor MCP local para Trello hecho con Node.js + TypeScript.

## Qué hay hoy en el repo

Estado **verificado** contra código y tests:

- entrypoint MCP por `stdio` en `src/index.ts`
- **15 tools** registradas en `src/mcp/registry.ts`
- **3 resources** registrados en `src/mcp/registry.ts`
- validación de entorno en `src/config/index.ts`
- suite verde: `npm run test:run` → **184 tests OK**
- chequeo de tipos verde: `npm run typecheck`

## Arquitectura

```txt
src/
├── mcp/                    # Registro MCP, handlers, tools y resources
├── application/            # Casos de uso y puertos
├── domain/                 # Entidades, invariantes y value objects
├── infrastructure/trello/  # Adapter HTTP, mappers y retry/backoff
├── config/                 # Lectura y validación de variables de entorno
└── shared/                 # Utilidades transversales

tests/
├── unit/
├── integration/
├── contracts/
└── fixtures/
```

## Requisitos

- Node.js **>= 20** (`package.json`)
- credenciales válidas de Trello
- un host compatible con MCP si querés consumirlo desde un cliente externo

## Variables de entorno

Definidas y validadas en `src/config/index.ts`:

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `TRELLO_API_KEY` | sí | API key de Trello |
| `TRELLO_TOKEN` | sí | token de Trello |
| `TRELLO_DEFAULT_BOARD_ID` | no | board por default cuando no mandás `boardId`/`boardName` |
| `TRELLO_API_BASE_URL` | no | base URL de Trello. Default: `https://api.trello.com/1` |

## Instalación local

```bash
npm install
cp .env.example .env
```

Después completá tu `.env` con las credenciales de Trello.

## Cómo usar el MCP paso a paso

### 1) Instalá dependencias

```bash
npm install
```

### 2) Configurá el entorno

```bash
cp .env.example .env
```

Completá:

```env
TRELLO_API_KEY=tu_api_key
TRELLO_TOKEN=tu_token
TRELLO_DEFAULT_BOARD_ID=opcional
TRELLO_API_BASE_URL=https://api.trello.com/1
```

### 3) Levantá el servidor MCP

```bash
npm run mcp:start
```

Ese script ejecuta `tsx src/index.ts` (`package.json`) y el servidor se conecta por `stdio` (`src/index.ts`).

### 4) Conectalo con OpenCode

Sí: al ejemplo anterior le faltaba el caso concreto de **OpenCode** con credenciales. Ahora va el tutorial como corresponde, sin fruta.

#### Opción A — recomendada: `opencode.json` dentro del repo

Camino rápido:

```bash
cp opencode.json.example opencode.json
export TRELLO_API_KEY="tu_api_key"
export TRELLO_TOKEN="tu_token"
opencode
```

Si preferís armarlo a mano, este es el contenido de `opencode.json` en la raíz del proyecto:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "trello": {
      "type": "local",
      "enabled": true,
      "command": ["npm", "run", "mcp:start"],
      "environment": {
        "TRELLO_API_KEY": "{env:TRELLO_API_KEY}",
        "TRELLO_TOKEN": "{env:TRELLO_TOKEN}"
      }
    }
  }
}
```

Después exportá las variables antes de abrir OpenCode:

```bash
export TRELLO_API_KEY="tu_api_key"
export TRELLO_TOKEN="tu_token"
export TRELLO_DEFAULT_BOARD_ID="tu_board_id_opcional"
export TRELLO_API_BASE_URL="https://api.trello.com/1"
opencode
```

Si querés fijar variables opcionales desde OpenCode, agregalas **solo si realmente tienen valor**:

```json
{
  "environment": {
    "TRELLO_API_KEY": "{env:TRELLO_API_KEY}",
    "TRELLO_TOKEN": "{env:TRELLO_TOKEN}",
    "TRELLO_DEFAULT_BOARD_ID": "{env:TRELLO_DEFAULT_BOARD_ID}",
    "TRELLO_API_BASE_URL": "{env:TRELLO_API_BASE_URL}"
  }
}
```

No metas esas opcionales porque sí. OpenCode reemplaza variables faltantes por string vacío en config, y `src/config/index.ts` rechaza `TRELLO_DEFAULT_BOARD_ID` vacío.

#### Opción B — más simple: dejar que el server lea `.env`

Como el servidor carga `dotenv/config` en `src/config/index.ts`, también podés usar este `opencode.json` más chico y dejar las credenciales en `.env`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "trello": {
      "type": "local",
      "enabled": true,
      "command": ["npm", "run", "mcp:start"]
    }
  }
}
```

**Tradeoff:**

- **Opción A**: más explícita y portable para OpenCode, porque no dependés de adivinar de dónde salen las variables.
- **Opción B**: más corta, pero depende de que el server encuentre correctamente tu `.env` al arrancar.

#### Opción C — config global de OpenCode

Si no querés meter `opencode.json` en el repo, podés configurarlo en `~/.config/opencode/opencode.json`.
En ese caso conviene usar ruta absoluta con `--prefix`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "trello": {
      "type": "local",
      "enabled": true,
      "command": [
        "npm",
        "--prefix",
        "/ruta/absoluta/a/serverMCPTrello",
        "run",
        "mcp:start"
      ],
      "environment": {
        "TRELLO_API_KEY": "{env:TRELLO_API_KEY}",
        "TRELLO_TOKEN": "{env:TRELLO_TOKEN}"
      }
    }
  }
}
```

#### Verificación en OpenCode

1. Abrí OpenCode dentro del repo:

```bash
opencode
```

2. En otra terminal, verificá que OpenCode vea el server:

```bash
opencode mcp list
```

3. Ya dentro de OpenCode, probá primero:

- `use trello y ejecutá bootstrap.status`

4. Si eso responde bien, seguí con:

- `trello_list_boards`
- `trello_list_columns`
- `trello_create_card`

#### Qué está verificado y qué no

- **Verificado**: OpenCode soporta `mcp` en `opencode.json`, servidores `type: "local"`, `command` como array y `environment` como objeto (`https://opencode.ai/docs/mcp-servers/`, `https://opencode.ai/docs/config/`).
- **Verificado**: este repo hoy está conectado en OpenCode con un comando equivalente a `npm --prefix /home/ignadev/work/serverMCPTrello run mcp:start` (`opencode mcp list`).
- **Verificado**: el server requiere `TRELLO_API_KEY` y `TRELLO_TOKEN` en `src/config/index.ts`.
- **Verificado**: OpenCode reemplaza env vars ausentes por string vacío en config (`https://opencode.ai/docs/config/`), así que no conviene inyectar opcionales vacías porque `src/config/index.ts` las rechaza.
- **Likely**: si usás la opción B, `.env` debería alcanzar porque el server importa `dotenv/config`; aun así, para OpenCode prefiero la opción A porque elimina ambigüedad.

### 5) Verificá que el servidor respondió

Primero ejecutá la tool diagnóstica:

- `bootstrap.status`

Esa tool devuelve el transporte, la policy publicada, las tools registradas y si las credenciales/default board quedaron configuradas (`src/mcp/handlers.ts`, `src/application/bootstrap.ts`).

### 6) Probá un flujo real mínimo

Orden recomendado:

1. `trello_list_boards`
2. `trello_list_columns` con `boardId` o `boardName`
3. `trello_create_card` para crear una tarjeta
4. `trello_add_comment` o `trello_add_labels` si querés enriquecerla

Ejemplos de payload:

```json
{}
```

```json
{
  "boardId": "tu_board_id"
}
```

```json
{
  "name": "Fix login bug",
  "boardId": "tu_board_id",
  "listName": "To Do",
  "pos": "bottom"
}
```

### 7) Consumí resources si necesitás lectura estructurada

Resources publicados:

- `trello://boards/{boardId}/summary`
- `trello://boards/{boardId}/overdue`
- `trello://boards/{boardId}/by-label/{labelName}`

Ejemplos:

- `trello://boards/board-1/summary`
- `trello://boards/board-1/overdue`
- `trello://boards/board-1/by-label/Bug?limit=10`

## Tools disponibles

### Diagnóstico

- `bootstrap.status`

### Boards, listas y tarjetas

- `trello_list_boards`
- `trello_list_columns`
- `trello_search_cards`
- `trello_create_card`
- `trello_move_card`
- `trello_delete_card`
- `trello_add_comment`
- `trello_add_labels`

### Labels

- `trello_change_label_color`
- `trello_list_board_labels`
- `trello_resolve_label`
- `trello_list_label_cards`
- `trello_search_cards_by_label`
- `trello_update_label`

## Resolución de board

La selección de board sigue esta precedencia documentada en el README anterior y cubierta por el runtime actual:

1. `boardId`
2. `boardName`
3. `TRELLO_DEFAULT_BOARD_ID`
4. autodiscovery cuando el usuario tiene un solo board accesible

## Scripts reales del repo

```bash
npm run dev
npm run mcp:start
npm run test
npm run test:run
npm run typecheck
```

### Script no operativo todavía

```bash
npm run lint
```

Ese script sigue en `pendiente-definir` dentro de `package.json`. No lo vendas como si estuviera listo porque sería fruta.

## Evidencia de verificación

- `src/index.ts` arranca `McpServer` y conecta `StdioServerTransport`
- `src/mcp/registry.ts` registra **15 tools** y **3 resources**
- `src/mcp/handlers.ts` publica `bootstrap.status` y el resto de handlers reales
- `tests/integration/bootstrap/index.test.ts` verifica `registerTool` **15 veces** y `registerResource` **3 veces**
- `npm run test:run` pasó con **35 archivos / 184 tests OK**
- `npm run typecheck` pasó sin errores

## Convenciones del repo

- `AGENTS.md` define reglas de trabajo y boundaries
- `skills/` documenta workflows reutilizables del proyecto
- `openspec/changes/archive/` guarda el historial SDD archivado

## Licencia

MIT (`package.json`).
