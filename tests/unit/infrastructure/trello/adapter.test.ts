import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';

import { ErrorCode } from '../../../../src/domain/index.js';
import { ok } from '../../../../src/shared/index.js';
import { createTrelloSearchCardsAdapter } from '../../../../src/infrastructure/trello/adapter.js';

vi.mock('../../../../src/infrastructure/trello/retry.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../src/infrastructure/trello/retry.js')>();
  return {
    ...actual,
    createFetchWithRetry: (impl: typeof fetch) => impl,
  };
});

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

  it('debe mapear listLabelCards incluyendo listName y respetar limit+1', async () => {
    const fixture = loadLabelCardsFixture();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(fixture.lists), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(fixture.cards), { status: 200 }));
    const adapter = createTrelloSearchCardsAdapter(baseConfig, fetchMock as typeof fetch);

    const result = await adapter.listLabelCards({ boardId: 'board-1', labelId: 'label-1', limit: 2 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[0]).toContain('/labels/label-1/cards');
    expect(result).toEqual(
      ok([
        {
          id: 'card-1',
          name: 'Fix login bug',
          idList: 'list-1',
          listName: 'Backlog',
          boardId: 'board-1',
          closed: false,
          shortUrl: 'https://trello.com/c/card-1',
          due: null,
        },
        {
          id: 'card-2',
          name: 'Write docs',
          idList: 'list-2',
          listName: 'Done',
          boardId: 'board-1',
          closed: false,
          shortUrl: 'https://trello.com/c/card-2',
          due: null,
        },
      ])
    );
  });

  it('debe traducir 429 a RateLimited en listLabelCards', async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 'list-1', name: 'To Do' }]), { status: 200 }))
      .mockImplementation(() =>
        Promise.resolve(new Response('rate limit', { status: 429, headers: { 'retry-after': '60' } }))
      );
    const adapter = createTrelloSearchCardsAdapter(baseConfig, fetchMock as typeof fetch);

    try {
      const pendingResult = adapter.listLabelCards({ boardId: 'board-1', labelId: 'label-1', limit: 3 });
      await vi.runAllTimersAsync();
      const result = await pendingResult;

      expect(result.ok).toBe(false);
      if (result.ok) {
        throw new Error('Se esperaba error');
      }
      expect(result.error.code).toBe(ErrorCode.RateLimited);
    } finally {
      vi.useRealTimers();
    }
  });

  it('debe actualizar labels combinando nombre y color', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 'label-1',
            name: 'Critical',
            color: 'green',
          }),
          { status: 200 }
        )
      );
    const adapter = createTrelloSearchCardsAdapter(baseConfig, fetchMock as typeof fetch);

    const result = await adapter.updateLabel('label-1', { name: 'Critical', color: 'green' });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/labels/label-1'),
      expect.objectContaining({ method: 'PUT' })
    );
    expect(result).toEqual(ok({ id: 'label-1', name: 'Critical', color: 'green' }));
  });
});

const loadLabelCardsFixture = () => {
  const fileUrl = new URL('../../../fixtures/trello/label-cards.json', import.meta.url);
  return JSON.parse(readFileSync(fileUrl, 'utf-8')) as {
    lists: Array<{ id: string; name: string }>;
    cards: Array<{
      id: string;
      name: string;
      idList: string;
      idBoard: string;
      closed: boolean;
      shortUrl: string;
      due: string | null;
    }>;
  };
};
