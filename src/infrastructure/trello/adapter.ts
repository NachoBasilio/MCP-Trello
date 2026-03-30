import { z as zod } from 'zod';

import type { Config } from '../../config/index.js';
import {
  createAuthError,
  createBoardAmbiguousError,
  createBoardIdRequiredError,
  createBoardNotFoundError,
  createComment,
  createRateLimitedError,
  createTrelloApiError,
  type Board,
  type CardSummary,
  type DomainError,
} from '../../domain/index.js';
import { err, ok, type Result } from '../../shared/index.js';

import type { TrelloAddCommentPort, TrelloBoardPort } from '../../application/ports.js';
import { fetchMemberBoards } from './board-api.js';

const trelloCardSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  idList: zod.string(),
  idBoard: zod.string(),
  closed: zod.boolean(),
  shortUrl: zod.string().url(),
  due: zod.string().nullable().optional(),
});

const trelloListSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
});

const trelloCommentActionSchema = zod.object({
  id: zod.string(),
  date: zod.string().datetime(),
  data: zod.object({
    text: zod.string(),
  }),
  memberCreator: zod
    .object({
      fullName: zod.string().optional(),
      username: zod.string().optional(),
    })
    .optional(),
});

type TrelloCardDto = zod.infer<typeof trelloCardSchema>;

type FetchLike = typeof fetch;

/**
 * Crea el adapter minimo de solo lectura para buscar tarjetas en Trello sin filtrar payloads crudos hacia arriba.
 */
export const createTrelloSearchCardsAdapter = (
  config: Config,
  fetchImplementation: FetchLike = fetch
): TrelloAddCommentPort & TrelloBoardPort => {
  return {
    resolveBoardId: async (boardId?: string): Promise<Result<string, DomainError>> => {
      const candidateBoardId = boardId?.trim() || config.TRELLO_DEFAULT_BOARD_ID?.trim();

      if (!candidateBoardId) {
        return err(createBoardIdRequiredError());
      }

      return ok(candidateBoardId);
    },

    listCards: async (boardId: string): Promise<Result<CardSummary[], DomainError>> => {
      const listsResponse = await fetchImplementation(
        buildTrelloUrl(config, `/boards/${boardId}/lists`, {
          fields: 'name',
        })
      );

      if (!listsResponse.ok) {
        return err(await mapTrelloError(listsResponse));
      }

      const cardsResponse = await fetchImplementation(
        buildTrelloUrl(config, `/boards/${boardId}/cards`, {
          fields: 'id,name,idList,idBoard,closed,shortUrl,due',
          filter: 'all',
        })
      );

      if (!cardsResponse.ok) {
        return err(await mapTrelloError(cardsResponse));
      }

      const lists = zod.array(trelloListSchema).parse(await listsResponse.json());
      const cards = zod.array(trelloCardSchema).parse(await cardsResponse.json());
      const listNames = new Map<string, string>(lists.map((list) => [list.id, list.name]));

      return ok(cards.map((card) => mapCardSummary(card, listNames)));
    },

    addComment: async (cardId: string, text: string) => {
      const response = await fetchImplementation(
        buildTrelloUrl(config, `/cards/${cardId}/actions/comments`, {
          text,
        }),
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        return err(await mapTrelloError(response));
      }

      const action = trelloCommentActionSchema.parse(await response.json());

      return ok(
        createComment({
          id: action.id,
          text: action.data.text,
          creator: action.memberCreator?.fullName ?? action.memberCreator?.username ?? 'Unknown creator',
          date: action.date,
        })
      );
    },

    /**
     * Lista todos los boards accesibles del miembro autenticado.
     */
    listBoards: async (): Promise<Result<Board[], DomainError>> => {
      return fetchMemberBoards(config, 'me', fetchImplementation);
    },

    /**
     * Resuelve el board efectivo siguiendo la precedencia estricta:
     * 1. boardId si fue provisto
     * 2. boardName con match exacto normalizado (trim + colapsar espacios + case-insensitive)
     * 3. TRELLO_DEFAULT_BOARD_ID del config
     * 4. Auto-discovery solo cuando hay exactamente un board accesible
     */
    resolveBoard: async (input: {
      boardId?: string;
      boardName?: string;
    }): Promise<Result<string, DomainError>> => {
      // 1. boardId explícito tiene prioridad absoluta
      const explicitBoardId = input.boardId?.trim();
      if (explicitBoardId) {
        return ok(explicitBoardId);
      }

      // 2. boardName requiere listar boards y hacer match exacto normalizado
      if (input.boardName) {
        const boardsResult = await fetchMemberBoards(config, 'me', fetchImplementation);

        if (!boardsResult.ok) {
          return boardsResult;
        }

        const normalizedName = normalizeBoardName(input.boardName);
        const matches: Board[] = [];

        for (const board of boardsResult.value) {
          if (normalizeBoardName(board.name) === normalizedName) {
            matches.push(board);
          }
        }

        if (matches.length === 0) {
          return err(createBoardNotFoundError());
        }

        if (matches.length > 1) {
          return err(
            createBoardAmbiguousError(
              matches.map((board) => ({ id: board.id, name: board.name })),
              input.boardName
            )
          );
        }

        return ok(matches[0].id);
      }

      // 3. Default board del config
      const defaultBoardId = config.TRELLO_DEFAULT_BOARD_ID?.trim();
      if (defaultBoardId) {
        return ok(defaultBoardId);
      }

      // 4. Auto-discovery: solo si hay exactamente un board accesible
      const boardsResult = await fetchMemberBoards(config, 'me', fetchImplementation);

      if (!boardsResult.ok) {
        return boardsResult;
      }

      if (boardsResult.value.length === 1) {
        return ok(boardsResult.value[0].id);
      }

      return err(createBoardIdRequiredError());
    },
  };
};

/**
 * Normaliza un nombre de board para comparacion deterministica:
 * trim de espacios externos, colapsar espacios internos multiples, comparar case-insensitive.
 */
const normalizeBoardName = (name: string): string => {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
};

const buildTrelloUrl = (config: Config, pathname: string, query: Record<string, string>): string => {
  const baseUrl = new URL(config.TRELLO_API_BASE_URL.endsWith('/') ? config.TRELLO_API_BASE_URL : `${config.TRELLO_API_BASE_URL}/`);
  const url = new URL(pathname.replace(/^\//, ''), baseUrl);

  url.searchParams.set('key', config.TRELLO_API_KEY);
  url.searchParams.set('token', config.TRELLO_TOKEN);

  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }

  return url.toString();
};

const mapCardSummary = (card: TrelloCardDto, listNames: Map<string, string>): CardSummary => {
  return {
    id: card.id,
    name: card.name,
    idList: card.idList,
    listName: listNames.get(card.idList) ?? 'Unknown list',
    boardId: card.idBoard,
    closed: card.closed,
    shortUrl: card.shortUrl,
    due: card.due ?? null,
  };
};

const mapTrelloError = async (response: Response): Promise<DomainError> => {
  const bodyText = await safeReadBody(response);

  switch (response.status) {
    case 401:
    case 403:
      return createAuthError('Invalid Trello credentials or insufficient permissions');
    case 404:
      return createBoardNotFoundError();
    case 429:
      return createRateLimitedError();
    default:
      return createTrelloApiError(`Unexpected Trello response (${response.status})`, {
        status: response.status,
        body: bodyText,
      });
  }
};

const safeReadBody = async (response: Response): Promise<string | undefined> => {
  try {
    return await response.text();
  } catch {
    return undefined;
  }
};
