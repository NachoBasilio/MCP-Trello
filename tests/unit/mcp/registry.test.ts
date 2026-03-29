import { describe, expect, it, vi } from 'vitest';
import { z as zod } from 'zod';

import type { BootstrapHandlers } from '../../../src/mcp/handlers.js';
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
    expect(bootstrapServerDefinition.options.instructions).toContain('Solo expone una tool diagnostica');
    expect(bootstrapServerDefinition.options.instructions).toContain('todavia no publica runtime de Trello');
    expect(bootstrapServerCapabilities).toEqual({ tools: {} });
  });

  /**
   * Confirma que el registry delega en la tool aprobada y no necesita transporte para registrar capacidades.
   */
  it('debe registrar la tool bootstrap.status sobre el servidor MCP recibido', () => {
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
          capabilityPolicy: zod.literal('diagnostic-only'),
          toolName: zod.literal('bootstrap.status'),
          trelloRuntimeAvailable: zod.literal(false),
          trelloCredentialsConfigured: zod.boolean(),
          defaultBoardConfigured: zod.boolean(),
        },
        execute,
      },
    };

    registerBootstrapCapabilities(server, handlers);

    expect(registerTool).toHaveBeenCalledTimes(1);
    expect(registerTool).toHaveBeenCalledWith(
      'bootstrap.status',
      {
        title: 'Estado de bootstrap',
        description: 'Describe el estado del bootstrap local.',
        outputSchema: handlers.diagnosticTool.outputSchema,
      },
      execute
    );
  });
});
