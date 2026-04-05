import { z as zod } from 'zod';

import type { Config } from '../../config/index.js';
import type { CardSummary, Label, DomainError } from '../../domain/index.js';
import { createTrelloApiError } from '../../domain/index.js';
import { err, ok, type Result } from '../../shared/index.js';

import { buildTrelloUrl } from './url.js';
import { mapToCardSummary, mapToLabel } from './mappers.js';
import { mapTrelloHttpError } from './http-errors.js';

const trelloLabelSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  color: zod.string(),
});

const trelloLabelCardSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  idList: zod.string(),
  idBoard: zod.string(),
  closed: zod.boolean(),
  shortUrl: zod.string().url(),
  due: zod.string().nullable().optional(),
});

const trelloBoardListSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
});

/**
 * Obtiene todas las labels de un board via `GET /1/boards/{id}/labels`.
 *
 * @param config - Configuracion tipada con credenciales Trello.
 * @param boardId - Identificador del board.
 * @param fetchImpl - Implementacion de fetch inyectable para pruebas.
 * @returns Lista de labels del board.
 */
export const fetchBoardLabels = async (
  config: Config,
  boardId: string,
  fetchImpl: typeof fetch = fetch
): Promise<Result<Label[], DomainError>> => {
  const url = buildTrelloUrl(config, `/boards/${boardId}/labels`, {
    fields: 'id,name,color',
    limit: '1000',
  });

  const response = await fetchImpl(url);

  if (!response.ok) {
    const bodyText = await safeReadBody(response);
    return err(
      createTrelloApiError(`Failed to fetch board labels (${response.status})`, {
        status: response.status,
        body: bodyText,
      })
    );
  }

  const rawLabels = zod.array(trelloLabelSchema).parse(await response.json());
  const labels = rawLabels.map((label) => mapToLabel(label));

  return ok(labels);
};

/**
 * Agrega una label a una tarjeta via `POST /1/cards/{id}/idLabels`.
 *
 * @param config - Configuracion tipada con credenciales Trello.
 * @param cardId - Identificador de la tarjeta.
 * @param labelId - Identificador de la label a agregar.
 * @param fetchImpl - Implementacion de fetch inyectable para pruebas.
 */
export const addLabelToCard = async (
  config: Config,
  cardId: string,
  labelId: string,
  fetchImpl: typeof fetch = fetch
): Promise<Result<void, DomainError>> => {
  const url = buildTrelloUrl(config, `/cards/${cardId}/idLabels`, {
    value: labelId,
  });

  const response = await fetchImpl(url, { method: 'POST' });

  if (!response.ok) {
    const bodyText = await safeReadBody(response);
    return err(
      createTrelloApiError(`Failed to add label to card (${response.status})`, {
        status: response.status,
        body: bodyText,
      })
    );
  }

  return ok(undefined);
};

/**
 * Crea una nueva label en un board via `POST /1/boards/{id}/labels`.
 *
 * @param config - Configuracion tipada con credenciales Trello.
 * @param boardId - Identificador del board.
 * @param name - Nombre de la nueva label.
 * @param color - Color de la label.
 * @param fetchImpl - Implementacion de fetch inyectable para pruebas.
 */
export const createBoardLabel = async (
  config: Config,
  boardId: string,
  name: string,
  color: string,
  fetchImpl: typeof fetch = fetch
): Promise<Result<Label, DomainError>> => {
  const url = buildTrelloUrl(config, `/boards/${boardId}/labels`, {
    name,
    color,
  });

  const response = await fetchImpl(url, { method: 'POST' });

  if (!response.ok) {
    const bodyText = await safeReadBody(response);
    return err(
      createTrelloApiError(`Failed to create label (${response.status})`, {
        status: response.status,
        body: bodyText,
      })
    );
  }

  const rawLabel = trelloLabelSchema.parse(await response.json());
  return ok(mapToLabel(rawLabel));
};

/**
 * Actualiza el color de una label existente via `PUT /1/labels/{id}`.
 *
 * @param config - Configuracion tipada con credenciales Trello.
 * @param labelId - Identificador de la label a actualizar.
 * @param color - Nuevo color de la label.
 * @param fetchImpl - Implementacion de fetch inyectable para pruebas.
 */
export const updateBoardLabelColor = async (
  config: Config,
  labelId: string,
  color: string,
  fetchImpl: typeof fetch = fetch
): Promise<Result<Label, DomainError>> => {
  return updateBoardLabel(
    config,
    {
      labelId,
      color,
    },
    fetchImpl
  );
};

export const fetchLabelCards = async (
  config: Config,
  input: { boardId: string; labelId: string; limit: number },
  fetchImpl: typeof fetch = fetch
): Promise<Result<CardSummary[], DomainError>> => {
  const listsResponse = await fetchImpl(
    buildTrelloUrl(config, `/boards/${input.boardId}/lists`, { fields: 'name' })
  );

  if (!listsResponse.ok) {
    return err(await mapTrelloHttpError(listsResponse));
  }

  const cardsResponse = await fetchImpl(
    buildTrelloUrl(config, `/labels/${input.labelId}/cards`, {
      fields: 'id,name,idList,idBoard,closed,shortUrl,due',
      limit: String(input.limit),
      filter: 'all',
    })
  );

  if (!cardsResponse.ok) {
    return err(await mapTrelloHttpError(cardsResponse));
  }

  const lists = zod.array(trelloBoardListSchema).parse(await listsResponse.json());
  const cards = zod.array(trelloLabelCardSchema).parse(await cardsResponse.json());
  const listNames = new Map<string, string>(lists.map((list) => [list.id, list.name]));

  return ok(cards.map((card) => mapToCardSummary(card, listNames)));
};

export const updateBoardLabel = async (
  config: Config,
  input: { labelId: string; name?: string; color?: string },
  fetchImpl: typeof fetch = fetch
): Promise<Result<Label, DomainError>> => {
  const queryParams: Record<string, string> = {};

  if (typeof input.name === 'string') {
    queryParams.name = input.name;
  }

  if (typeof input.color === 'string') {
    queryParams.color = input.color;
  }

  const url = buildTrelloUrl(config, `/labels/${input.labelId}`, queryParams);
  const response = await fetchImpl(url, { method: 'PUT' });

  if (!response.ok) {
    return err(await mapTrelloHttpError(response));
  }

  const rawLabel = trelloLabelSchema.parse(await response.json());
  return ok(mapToLabel(rawLabel));
};

const safeReadBody = async (response: Response): Promise<string | undefined> => {
  try {
    return await response.text();
  } catch {
    return undefined;
  }
};
