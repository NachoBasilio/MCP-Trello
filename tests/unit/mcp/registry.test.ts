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
 * Protege el wiring de metadata y registro MCP sin arrancar transporte real.
 */
describe('Registry MCP del bootstrap', () => {
  /**
   * Verifica que la metadata publicada siga siendo minima y honesta respecto del alcance actual.
   */
  it('debe publicar metadata del servidor alineada con un bootstrap diagnostico', () => {
    expect(bootstrapServerDefinition.info).toEqual({
      name: 'server-mcp-trello',
      version: '0.1.0',
    });
    expect(bootstrapServerDefinition.options.instructions).toContain('bootstrap.status, trello_search_cards, trello_add_comment y trello_list_boards');
    expect(bootstrapServerDefinition.options.instructions).toContain('resto del runtime de Trello sigue fuera de alcance');
    expect(bootstrapServerCapabilities).toEqual({ tools: {} });
  });

  /**
   * Confirma que el registry delega en la tool aprobada y no necesita transporte para registrar capacidades.
   */
  it('debe registrar la tool bootstrap.status y la search slice sobre el servidor MCP recibido', () => {
    const registerTool = vi.fn();
    const server = {
      registerTool,
    } as unknown as Parameters<typeof registerBootstrapCapabilities>[0];
    const execute = vi.fn();
    const handlers: BootstrapHandlers = {
      diagnosticTool: {
        name: 'bootstrap.status',
        title: 'Estado de bootstrap',
        description: 'Describe el estado del bootstrap local.',
        outputSchema: {
          scope: zod.literal('bootstrap'),
          transport: zod.literal('stdio'),
          capabilityPolicy: zod.literal('diagnostic-plus-search-and-comment'),
          toolNames: zod.tuple([
            zod.literal('bootstrap.status'),
            zod.literal('trello_search_cards'),
            zod.literal('trello_add_comment'),
            zod.literal('trello_list_boards'),
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
        title: 'Buscar tarjetas de Trello',
        description: 'Busca tarjetas de forma read-only.',
        inputSchema: trelloSearchCardsInputSchema.shape,
        outputSchema: trelloSearchCardsOutputSchema.shape,
        execute,
      },
      addCommentTool: {
        name: 'trello_add_comment',
        title: 'Agregar comentario en Trello',
        description: 'Agrega comentarios a tarjetas existentes.',
        inputSchema: trelloAddCommentInputSchemaShape,
        outputSchema: trelloAddCommentOutputSchema.shape,
        execute,
      },
      listBoardsTool: {
        name: 'trello_list_boards',
        title: 'Listar boards de Trello',
        description: 'Lista todos los boards accesibles.',
        outputSchema: trelloListBoardsOutputSchema.shape,
        execute,
      },
    };

    registerBootstrapCapabilities(server, handlers);

    expect(registerTool).toHaveBeenCalledTimes(4);
    expect(registerTool).toHaveBeenCalledWith(
      'bootstrap.status',
      {
        title: 'Estado de bootstrap',
        description: 'Describe el estado del bootstrap local.',
        outputSchema: handlers.diagnosticTool.outputSchema,
      },
      execute
    );
    expect(registerTool).toHaveBeenCalledWith(
      'trello_search_cards',
      {
        title: 'Buscar tarjetas de Trello',
        description: 'Busca tarjetas de forma read-only.',
        inputSchema: handlers.searchCardsTool.inputSchema,
        outputSchema: handlers.searchCardsTool.outputSchema,
      },
      execute
    );
    expect(registerTool).toHaveBeenCalledWith(
      'trello_add_comment',
      {
        title: 'Agregar comentario en Trello',
        description: 'Agrega comentarios a tarjetas existentes.',
        inputSchema: handlers.addCommentTool.inputSchema,
        outputSchema: handlers.addCommentTool.outputSchema,
      },
      execute
    );
    expect(registerTool).toHaveBeenCalledWith(
      'trello_list_boards',
      {
        title: 'Listar boards de Trello',
        description: 'Lista todos los boards accesibles.',
        outputSchema: handlers.listBoardsTool.outputSchema,
      },
      execute
    );
  });
});
