import { describe, expect, it, vi } from 'vitest';
import { z as zod } from 'zod';

import type { BootstrapHandlers } from '../../../src/mcp/handlers.js';
import {
  trelloAddCommentInputSchemaShape,
  trelloAddCommentOutputSchema,
  trelloListBoardsOutputSchema,
  trelloSearchCardsInputSchema,
  trelloSearchCardsOutputSchema,
} from '../../../src/types/tool-contract.js';
import {
  bootstrapServerCapabilities,
  bootstrapServerDefinition,
  registerBootstrapCapabilities,
} from '../../../src/mcp/registry.js';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Protege el wiring de metadata y registro MCP.
 */
describe('Registry MCP del servidor', () => {
  it('debe publicar metadata del servidor con todas las tools label-centric', () => {
    expect(bootstrapServerDefinition.info).toEqual({
      name: 'server-mcp-trello',
      version: '0.1.0',
    });
    expect(bootstrapServerDefinition.options.instructions).toContain('trello_create_card');
    expect(bootstrapServerDefinition.options.instructions).toContain('trello_move_card');
    expect(bootstrapServerDefinition.options.instructions).toContain('trello_delete_card');
    expect(bootstrapServerDefinition.options.instructions).toContain('trello_add_labels');
    expect(bootstrapServerDefinition.options.instructions).toContain('trello_list_columns');
    expect(bootstrapServerDefinition.options.instructions).toContain('trello_change_label_color');
    expect(bootstrapServerDefinition.options.instructions).toContain('trello_list_board_labels');
    expect(bootstrapServerDefinition.options.instructions).toContain('trello_resolve_label');
    expect(bootstrapServerDefinition.options.instructions).toContain('trello_list_label_cards');
    expect(bootstrapServerDefinition.options.instructions).toContain('trello_search_cards_by_label');
    expect(bootstrapServerDefinition.options.instructions).toContain('trello_update_label');
    expect(bootstrapServerDefinition.options.instructions).toContain('board-summary');
    expect(bootstrapServerDefinition.options.instructions).toContain('board-overdue');
    expect(bootstrapServerDefinition.options.instructions).toContain('board-by-label');
    expect(bootstrapServerCapabilities).toEqual({ tools: {}, resources: {} });
  });

  it('debe registrar las 15 tools y 3 resources sobre el servidor MCP', () => {
    const registerTool = vi.fn();
    const registerResource = vi.fn();
    const server = {
      registerTool,
      registerResource,
    } as unknown as Parameters<typeof registerBootstrapCapabilities>[0];
    const execute = vi.fn();
    const read = vi.fn();
    const mockSchema = { field: zod.string() } as any;
    const mockTemplate = new ResourceTemplate('trello://boards/{boardId}/summary', { list: undefined });
    const handlers: BootstrapHandlers = {
      diagnosticTool: {
        name: 'bootstrap.status',
        title: 'Estado de bootstrap',
        description: 'Diagnostico.',
        outputSchema: {
          scope: zod.literal('bootstrap'),
          transport: zod.literal('stdio'),
          capabilityPolicy: zod.literal('diagnostic-plus-full-trello'),
          toolNames: zod.tuple([
            zod.literal('bootstrap.status'),
            zod.literal('trello_search_cards'),
            zod.literal('trello_add_comment'),
            zod.literal('trello_list_boards'),
            zod.literal('trello_list_columns'),
            zod.literal('trello_create_card'),
            zod.literal('trello_move_card'),
            zod.literal('trello_delete_card'),
            zod.literal('trello_add_labels'),
            zod.literal('trello_change_label_color'),
            zod.literal('trello_list_board_labels'),
            zod.literal('trello_resolve_label'),
            zod.literal('trello_list_label_cards'),
            zod.literal('trello_search_cards_by_label'),
            zod.literal('trello_update_label'),
          ]),
          trelloRuntimeAvailable: zod.literal(true),
          trelloWriteRuntimeAvailable: zod.literal(true),
          trelloCredentialsConfigured: zod.boolean(),
          defaultBoardConfigured: zod.boolean(),
        },
        execute,
      },
      searchCardsTool: {
        name: 'trello_search_cards',
        title: 'Buscar tarjetas',
        description: 'Busca.',
        inputSchema: trelloSearchCardsInputSchema.shape,
        outputSchema: trelloSearchCardsOutputSchema.shape,
        execute,
      },
      addCommentTool: {
        name: 'trello_add_comment',
        title: 'Agregar comentario',
        description: 'Comenta.',
        inputSchema: trelloAddCommentInputSchemaShape,
        outputSchema: trelloAddCommentOutputSchema.shape,
        execute,
      },
      listBoardsTool: {
        name: 'trello_list_boards',
        title: 'Listar boards',
        description: 'Lista.',
        outputSchema: trelloListBoardsOutputSchema.shape,
        execute,
      },
      listColumnsTool: {
        name: 'trello_list_columns',
        title: 'Listar columnas',
        description: 'Lista columnas.',
        inputSchema: mockSchema,
        outputSchema: mockSchema,
        execute,
      },
      createCardTool: {
        name: 'trello_create_card',
        title: 'Crear tarjeta',
        description: 'Crea.',
        inputSchema: mockSchema,
        outputSchema: mockSchema,
        execute,
      },
      moveCardTool: {
        name: 'trello_move_card',
        title: 'Mover tarjeta',
        description: 'Mueve.',
        inputSchema: mockSchema,
        outputSchema: mockSchema,
        execute,
      },
      deleteCardTool: {
        name: 'trello_delete_card',
        title: 'Eliminar tarjeta',
        description: 'Elimina.',
        inputSchema: mockSchema,
        outputSchema: mockSchema,
        execute,
      },
      addLabelsTool: {
        name: 'trello_add_labels',
        title: 'Agregar labels',
        description: 'Labels.',
        inputSchema: mockSchema,
        outputSchema: mockSchema,
        execute,
      },
      changeLabelColorTool: {
        name: 'trello_change_label_color',
        title: 'Cambiar color de label',
        description: 'Cambia color.',
        inputSchema: mockSchema,
        outputSchema: mockSchema,
        execute,
      },
      listBoardLabelsTool: {
        name: 'trello_list_board_labels',
        title: 'Listar labels del board',
        description: 'Lista labels.',
        inputSchema: mockSchema,
        outputSchema: mockSchema,
        execute,
      },
      resolveLabelTool: {
        name: 'trello_resolve_label',
        title: 'Resolver label',
        description: 'Resuelve label.',
        inputSchema: mockSchema,
        outputSchema: mockSchema,
        execute,
      },
      listLabelCardsTool: {
        name: 'trello_list_label_cards',
        title: 'Listar tarjetas por label',
        description: 'Lista tarjetas.',
        inputSchema: mockSchema,
        outputSchema: mockSchema,
        execute,
      },
      searchCardsByLabelTool: {
        name: 'trello_search_cards_by_label',
        title: 'Buscar tarjetas por label',
        description: 'Busca tarjetas por label.',
        inputSchema: mockSchema,
        outputSchema: mockSchema,
        execute,
      },
      updateLabelTool: {
        name: 'trello_update_label',
        title: 'Actualizar label',
        description: 'Actualiza label.',
        inputSchema: mockSchema,
        outputSchema: mockSchema,
        execute,
      },
      boardSummaryResource: {
        name: 'board-summary',
        template: mockTemplate,
        metadata: {
          title: 'Resumen de Board',
          description: 'Resumen.',
          mimeType: 'application/json',
        },
        read,
      },
      boardOverdueResource: {
        name: 'board-overdue',
        template: mockTemplate,
        metadata: {
          title: 'Tarjetas Vencidas',
          description: 'Vencidas.',
          mimeType: 'application/json',
        },
        read,
      },
      boardByLabelResource: {
        name: 'board-by-label',
        template: mockTemplate,
        metadata: {
          title: 'Tarjetas por Label',
          description: 'Por label.',
          mimeType: 'application/json',
        },
        read,
      },
    };

    registerBootstrapCapabilities(server, handlers);

    expect(registerTool).toHaveBeenCalledTimes(15);
    expect(registerResource).toHaveBeenCalledTimes(3);
  });
});
