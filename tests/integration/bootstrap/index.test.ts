import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const registerToolSpy = vi.fn();
const connectSpy = vi.fn();
const mcpServerConstructorSpy = vi.fn();
const stdioTransportConstructorSpy = vi.fn();

vi.mock('dotenv/config', () => ({}));

vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => {
  class MockMcpServer {
    constructor(info: unknown, options: unknown) {
      mcpServerConstructorSpy(info, options);
    }

    registerTool = registerToolSpy;
    connect = connectSpy;
  }

  return {
    McpServer: MockMcpServer,
  };
});

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => {
  class MockStdioServerTransport {
    constructor() {
      stdioTransportConstructorSpy();
    }
  }

  return {
    StdioServerTransport: MockStdioServerTransport,
  };
});

/**
 * Verifica el boundary del entrypoint real del bootstrap sin usar transporte ni runtime de Trello reales.
 */
describe('Entrypoint del bootstrap MCP', () => {
  const originalEnvironment = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnvironment };
    connectSpy.mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.env = { ...originalEnvironment };
    vi.restoreAllMocks();
  });

  /**
   * Confirma que los errores de entorno frenen el arranque antes de conectar el transporte.
   */
  it('debe fallar rapido cuando el entorno es invalido', async () => {
    delete process.env.TRELLO_API_KEY;
    delete process.env.TRELLO_TOKEN;

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const processExitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never);

    await import('../../../src/index.ts');

    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Fatal MCP bootstrap startup error: [CONFIGURATION]')
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    expect(registerToolSpy).not.toHaveBeenCalled();
    expect(connectSpy).not.toHaveBeenCalled();
  });

  /**
   * Valida que el entrypoint complete el wiring del bootstrap real sin requerir adapters o llamadas de Trello.
   */
  it('debe alcanzar el arranque del bootstrap con entorno valido y solo mocks de MCP', async () => {
    process.env.TRELLO_API_KEY = 'key-123';
    process.env.TRELLO_TOKEN = 'token-123';
    delete process.env.TRELLO_DEFAULT_BOARD_ID;
    delete process.env.TRELLO_API_BASE_URL;

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const processExitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never);

    await import('../../../src/index.ts');

    await vi.waitFor(() => {
      expect(mcpServerConstructorSpy).toHaveBeenCalledTimes(1);
      expect(registerToolSpy).toHaveBeenCalledTimes(3);
      expect(stdioTransportConstructorSpy).toHaveBeenCalledTimes(1);
      expect(connectSpy).toHaveBeenCalledTimes(1);
    });

    expect(mcpServerConstructorSpy).toHaveBeenCalledWith(
      { name: 'server-mcp-trello', version: '0.1.0' },
      expect.objectContaining({
        capabilities: { tools: {} },
        instructions: expect.stringContaining('bootstrap.status, trello_search_cards y trello_add_comment'),
      })
    );
    expect(registerToolSpy).toHaveBeenCalledWith(
      'bootstrap.status',
      expect.objectContaining({
        title: 'Estado de bootstrap',
        description: expect.stringContaining('search y add-comment'),
      }),
      expect.any(Function)
    );
    expect(registerToolSpy).toHaveBeenCalledWith(
      'trello_search_cards',
      expect.objectContaining({
        title: 'Buscar tarjetas de Trello',
        description: expect.stringContaining('substrings case-insensitive'),
      }),
      expect.any(Function)
    );
    expect(registerToolSpy).toHaveBeenCalledWith(
      'trello_add_comment',
      expect.objectContaining({
        title: 'Agregar comentario en Trello',
        description: expect.stringContaining('cardId'),
      }),
      expect.any(Function)
    );
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(processExitSpy).not.toHaveBeenCalled();
  });
});
