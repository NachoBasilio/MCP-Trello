import { describe, expect, it, vi } from 'vitest';

import type { ApplicationDependencies, BootstrapDiagnosticSnapshot } from '../../../src/application/bootstrap.js';
import { createBootstrapHandlers } from '../../../src/mcp/handlers.js';

const bootstrapStatusFixture: BootstrapDiagnosticSnapshot = {
  scope: 'bootstrap',
  transport: 'stdio',
  capabilityPolicy: 'diagnostic-only',
  toolName: 'bootstrap.status',
  trelloRuntimeAvailable: false,
  trelloCredentialsConfigured: true,
  defaultBoardConfigured: false,
};

/**
 * Verifica el contrato observable del handler diagnostico que el bootstrap publica hoy.
 */
describe('Handlers MCP del bootstrap', () => {
  /**
   * Asegura que el bootstrap no publique capacidades fuera del diagnostico aprobado.
   */
  it('debe exponer solo la tool diagnostica bootstrap.status', () => {
    const dependencies: ApplicationDependencies = {
      config: {
        TRELLO_API_KEY: 'key-123',
        TRELLO_TOKEN: 'token-123',
        TRELLO_API_BASE_URL: 'https://api.trello.com/1',
      },
      getBootstrapStatus: vi.fn(() => bootstrapStatusFixture),
    };

    const handlers = createBootstrapHandlers(dependencies);

    expect(Object.keys(handlers)).toEqual(['diagnosticTool']);
    expect(handlers.diagnosticTool.name).toBe('bootstrap.status');
    expect(handlers.diagnosticTool.title).toBe('Estado de bootstrap');
    expect(handlers.diagnosticTool.description).toContain('sin anunciar runtime de Trello');
  });

  /**
   * Confirma que la ejecucion del handler traduzca el snapshot de application sin pedir adapters de Trello.
   */
  it('debe devolver contenido estructurado y textual desde getBootstrapStatus', async () => {
    const getBootstrapStatus = vi.fn(() => bootstrapStatusFixture);
    const dependencies: ApplicationDependencies = {
      config: {
        TRELLO_API_KEY: 'key-123',
        TRELLO_TOKEN: 'token-123',
        TRELLO_API_BASE_URL: 'https://api.trello.com/1',
      },
      getBootstrapStatus,
    };

    const handlers = createBootstrapHandlers(dependencies);
    const result = await handlers.diagnosticTool.execute();

    expect(getBootstrapStatus).toHaveBeenCalledTimes(1);
    expect(result.structuredContent).toEqual(bootstrapStatusFixture);
    expect(result.content).toEqual([
      {
        type: 'text',
        text: [
          'Bootstrap MCP status',
          '- transport target: stdio',
          '- capability policy: diagnostic-only',
          '- Trello runtime available: no',
          '- Trello credentials configured: yes',
          '- default board configured: no',
        ].join('\n'),
      },
    ]);
  });
});
