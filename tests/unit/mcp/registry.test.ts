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

/**
 * Protege el wiring de metadata y registro MCP.
 */
describe('Registry MCP del servidor', () => {
  it('debe publicar metadata del servidor con 7 tools', () => {
    expect(bootstrapServerDefinition.info).toEqual({
      name: 'server-mcp-trello',
      version: '0.1.0',
    });
    expect(bootstrapServerDefinition.options.instructions).toContain('trello_create_card');
    expect(bootstrapServerDefinition.options.instructions).toContain('trello_move_card');
    expect(bootstrapServerDefinition.options.instructions).toContain('trello_add_labels');
    expect(bootstrapServerCapabilities).toEqual({ tools: {} });
  });

  it('debe registrar las 7 tools sobre el servidor MCP', () => {
    const registerTool = vi.fn();
    const server = {
      registerTool,
    } as unknown as Parameters<typeof registerBootstrapCapabilities>[0];
    const execute = vi.fn();
    const mockSchema = { field: zod.string() } as any;
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
            zod.literal('trello_create_card'),
            zod.literal('trello_move_card'),
            zod.literal('trello_add_labels'),
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
      addLabelsTool: {
        name: 'trello_add_labels',
        title: 'Agregar labels',
        description: 'Labels.',
        inputSchema: mockSchema,
        outputSchema: mockSchema,
        execute,
      },
    };

    registerBootstrapCapabilities(server, handlers);

    expect(registerTool).toHaveBeenCalledTimes(7);
  });
});
