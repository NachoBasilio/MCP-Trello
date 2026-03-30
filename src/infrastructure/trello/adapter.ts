import { z as zod } from 'zod';

import type { Config } from '../../config/index.js';
import {
  createAuthError,
  createBoardIdRequiredError,
  createBoardNotFoundError,
  createComment,
  createRateLimitedError,
  createTrelloApiError,
  type CardSummary,
  type DomainError,
} from '../../domain/index.js';
import { err, ok, type Result } from '../../shared/index.js';

import type { TrelloAddCommentPort } from '../../application/ports.js';

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
): TrelloAddCommentPort => {
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
  };
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
