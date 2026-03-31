import { describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '../../../../src/domain/index.js';
import { createTrelloSearchCardsAdapter } from '../../../../src/infrastructure/trello/adapter.js';

const baseConfig = {
  TRELLO_API_KEY: 'key-123',
  TRELLO_TOKEN: 'token-123',
  TRELLO_API_BASE_URL: 'https://api.trello.com/1',
  TRELLO_DEFAULT_BOARD_ID: 'board-default',
};

/**
 * Verifica el boundary HTTP minimo del adapter de lectura sin tocar Trello real.
 */
describe('Adapter de busqueda de tarjetas en Trello', () => {
  /**
   * Valida que un 404 se traduzca al error de dominio esperado por capas superiores.
   */
  it('debe traducir 404 a un DomainError de board inaccesible', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('missing board', { status: 404 }));
    const adapter = createTrelloSearchCardsAdapter(baseConfig, fetchMock as typeof fetch);

    const result = await adapter.listCards('board-missing');

    expect(result.ok).toBe(false);

    if (result.ok) {
      throw new Error('Se esperaba un resultado fallido');
    }

    expect(result.error.code).toBe(ErrorCode.BoardNotFound);
    expect(result.error.message).toBe('Board not found or inaccessible');
  });

  /**
   * Verifica que resolveBoard use boardId cuando esta presente ( precedence boardId > boardName).
   */
  it('debe usar boardId directo cuando se provee', async () => {
    const fetchMock = vi.fn();
    const adapter = createTrelloSearchCardsAdapter(baseConfig, fetchMock as typeof fetch);

    const result = await adapter.resolveBoard({ boardId: 'board-explicit' });

    expect(result).toEqual({ ok: true, value: 'board-explicit' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  /**
   * Verifica que resolveBoard normalice boardName para comparacion case-insensitive.
   */
  it('debe normalizar boardName para comparacion case-insensitive y detectar ambiguedad', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          { id: 'board-1', name: 'My Project Board' },
          { id: 'board-2', name: 'My PROJECT board' },
        ]),
        { status: 200 }
      )
    );
    const adapter = createTrelloSearchCardsAdapter(baseConfig, fetchMock as typeof fetch);

    const result = await adapter.resolveBoard({ boardName: '  MY   project   board  ' });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('Se esperaba error de ambiguedad');
    }
    expect(result.error.code).toBe(ErrorCode.BoardAmbiguous);
  });

  /**
   * Verifica que resolveBoard retorne error cuando boardName no existe.
   */
  it('debe retornar error cuando boardName no existe', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ id: 'board-1', name: 'Some Board' }]), {
        status: 200,
      })
    );
    const adapter = createTrelloSearchCardsAdapter(baseConfig, fetchMock as typeof fetch);

    const result = await adapter.resolveBoard({ boardName: 'Nonexistent Board' });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('Se esperaba error de no encontrado');
    }
    expect(result.error.code).toBe(ErrorCode.BoardNotFound);
  });

  /**
   * Verifica que resolveBoard use TRELLO_DEFAULT_BOARD_ID cuando no hay boardId ni boardName.
   */
  it('debe usar TRELLO_DEFAULT_BOARD_ID cuando no se provee boardId ni boardName', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ id: 'board-1', name: 'Some Board' }]), {
        status: 200,
      })
    );
    const adapter = createTrelloSearchCardsAdapter(baseConfig, fetchMock as typeof fetch);

    const result = await adapter.resolveBoard({});

    expect(result).toEqual({ ok: true, value: 'board-default' });
  });

  /**
   * Verifica que resolveBoard haga autodiscovery cuando hay exactamente un board accesible.
   */
  it('debe hacer autodiscovery cuando hay exactamente un board accesible', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ id: 'board-single', name: 'Only Board' }]), {
        status: 200,
      })
    );
    const configNoDefault = {
      ...baseConfig,
      TRELLO_DEFAULT_BOARD_ID: undefined,
    };
    const adapter = createTrelloSearchCardsAdapter(configNoDefault, fetchMock as typeof fetch);

    const result = await adapter.resolveBoard({});

    expect(result).toEqual({ ok: true, value: 'board-single' });
  });

  /**
   * Verifica que resolveBoard retorne error cuando hay multiples boards y no se provee selector.
   */
  it('debe retornar error cuando hay multiples boards y no se provee selector', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          { id: 'board-1', name: 'Board One' },
          { id: 'board-2', name: 'Board Two' },
        ]),
        { status: 200 }
      )
    );
    const configNoDefault = {
      ...baseConfig,
      TRELLO_DEFAULT_BOARD_ID: undefined,
    };
    const adapter = createTrelloSearchCardsAdapter(configNoDefault, fetchMock as typeof fetch);

    const result = await adapter.resolveBoard({});

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('Se esperaba error de board requerido');
    }
    expect(result.error.code).toBe(ErrorCode.BoardIdRequired);
  });

  /**
   * Verifica que boardId tenga precedencia sobre boardName.
   */
  it('debe preferir boardId sobre boardName', async () => {
    const fetchMock = vi.fn();
    const adapter = createTrelloSearchCardsAdapter(baseConfig, fetchMock as typeof fetch);

    const result = await adapter.resolveBoard({ boardId: 'board-123', boardName: 'Other Board' });

    expect(result).toEqual({ ok: true, value: 'board-123' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  /**
   * Verifica que resolveBoard resuelva boardName unico correctamente.
   */
  it('debe resolver boardName unico corretamente', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          { id: 'board-1', name: 'My Project' },
          { id: 'board-2', name: 'Other Board' },
        ]),
        { status: 200 }
      )
    );
    const adapter = createTrelloSearchCardsAdapter(baseConfig, fetchMock as typeof fetch);

    const result = await adapter.resolveBoard({ boardName: 'my project' });

    expect(result).toEqual({ ok: true, value: 'board-1' });
  });
});
