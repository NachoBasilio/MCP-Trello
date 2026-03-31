import { describe, expect, it } from 'vitest';

import {
  createBoardAmbiguousError,
  createBoardIdRequiredError,
  type CardSummary,
} from '../../../src/domain/index.js';
import { createSearchCardsUseCase } from '../../../src/application/search-cards.js';
import { err, ok } from '../../../src/shared/index.js';

/**
 * Protege la slice de busqueda read-only y su decision de reutilizar `CardQuery` para filtrar resultados.
 */
describe('Caso de uso SearchCards', () => {
  /**
   * Verifica el filtrado case-insensitive con logica AND y el flag de truncado observable por MCP.
   */
  it('debe filtrar tarjetas con substring AND y marcar truncado cuando excede el limite', async () => {
    const cards: CardSummary[] = [
      {
        id: 'card-1',
        name: 'Fix authentication bug',
        idList: 'list-1',
        listName: 'To Do',
        boardId: 'board-1',
        closed: false,
        shortUrl: 'https://trello.com/c/card-1',
        due: null,
      },
      {
        id: 'card-2',
        name: 'Fix auth timeout',
        idList: 'list-1',
        listName: 'To Do',
        boardId: 'board-1',
        closed: false,
        shortUrl: 'https://trello.com/c/card-2',
        due: null,
      },
      {
        id: 'card-3',
        name: 'Document auth flow',
        idList: 'list-2',
        listName: 'Done',
        boardId: 'board-1',
        closed: false,
        shortUrl: 'https://trello.com/c/card-3',
        due: null,
      },
    ];

    const useCase = createSearchCardsUseCase({
      resolveBoardId: async () => ok('board-1'),
      listCards: async () => ok(cards),
      listBoards: async () => ok([]),
      resolveBoard: async () => ok('board-1'),
    });

    const result = await useCase.execute({ query: 'FIX auth', limit: 1 });

    expect(result).toEqual(
      ok({
        boardId: 'board-1',
        cards: [cards[0]],
        truncated: true,
      })
    );
  });

  /**
   * Confirma que el caso de uso propaga el error cuando no puede resolver un board efectivo.
   */
  it('debe propagar el error cuando no hay board explicito ni default disponible', async () => {
    const boardIdRequiredError = createBoardIdRequiredError();
    const useCase = createSearchCardsUseCase({
      resolveBoardId: async () => err(boardIdRequiredError),
      listCards: async () => ok([]),
      listBoards: async () => ok([]),
      resolveBoard: async () => err(boardIdRequiredError),
    });

    await expect(useCase.execute({ query: 'auth' })).resolves.toEqual(err(boardIdRequiredError));
  });

  /**
   * Verifica que un termino parcial sigue matcheando por substring (ej: auth -> AuthenticationService).
   */
  it('debe matchear palabras parciales en la busqueda', async () => {
    const cards: CardSummary[] = [
      {
        id: 'card-1',
        name: 'AuthenticationService refactor',
        idList: 'list-1',
        listName: 'To Do',
        boardId: 'board-1',
        closed: false,
        shortUrl: 'https://trello.com/c/card-1',
        due: null,
      },
    ];

    const useCase = createSearchCardsUseCase({
      resolveBoardId: async () => ok('board-1'),
      listCards: async () => ok(cards),
      listBoards: async () => ok([]),
      resolveBoard: async () => ok('board-1'),
    });

    const result = await useCase.execute({ query: 'auth' });

    expect(result).toEqual(
      ok({
        boardId: 'board-1',
        cards,
        truncated: false,
      })
    );
  });

  /**
   * Verifica que limite+truncado respetan el maximo solicitado en resultados grandes.
   */
  it('debe respetar limit y marcar truncated cuando hay mas resultados', async () => {
    const cards: CardSummary[] = [
      {
        id: 'card-1',
        name: 'Bug one',
        idList: 'list-1',
        listName: 'To Do',
        boardId: 'board-1',
        closed: false,
        shortUrl: 'https://trello.com/c/card-1',
        due: null,
      },
      {
        id: 'card-2',
        name: 'Bug two',
        idList: 'list-1',
        listName: 'To Do',
        boardId: 'board-1',
        closed: false,
        shortUrl: 'https://trello.com/c/card-2',
        due: null,
      },
      {
        id: 'card-3',
        name: 'Bug three',
        idList: 'list-1',
        listName: 'To Do',
        boardId: 'board-1',
        closed: false,
        shortUrl: 'https://trello.com/c/card-3',
        due: null,
      },
    ];

    const useCase = createSearchCardsUseCase({
      resolveBoardId: async () => ok('board-1'),
      listCards: async () => ok(cards),
      listBoards: async () => ok([]),
      resolveBoard: async () => ok('board-1'),
    });

    const result = await useCase.execute({ query: 'bug', limit: 2 });

    expect(result).toEqual(
      ok({
        boardId: 'board-1',
        cards: [cards[0], cards[1]],
        truncated: true,
      })
    );
  });

  /**
   * Verifica que la ambiguedad de boardName se propaga sin intentar listar tarjetas.
   */
  it('debe propagar error de board ambiguo cuando resolveBoard falla por multiples matches', async () => {
    const ambiguousBoardError = createBoardAmbiguousError(
      [
        { id: 'board-1', name: 'Delivery Board' },
        { id: 'board-2', name: 'delivery   board' },
      ],
      'Delivery Board'
    );

    const useCase = createSearchCardsUseCase({
      resolveBoardId: async () => ok('board-1'),
      listCards: async () => {
        throw new Error('No deberia listar tarjetas cuando resolveBoard falla');
      },
      listBoards: async () => ok([]),
      resolveBoard: async () => err(ambiguousBoardError),
    });

    const result = await useCase.execute({ query: 'login', boardName: 'Delivery Board' });

    expect(result).toEqual(err(ambiguousBoardError));
  });
});
