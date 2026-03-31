import { z as zod } from 'zod';

import type { Config } from '../../config/index.js';
import type { Card, CardSummary, DomainError } from '../../domain/index.js';
import { err, ok, type Result } from '../../shared/index.js';

import { buildTrelloUrl } from './url.js';
import { mapToCard, mapToCardSummary } from './mappers.js';
import { mapTrelloHttpError } from './http-errors.js';

const trelloCardSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  idList: zod.string(),
  idBoard: zod.string(),
  desc: zod.string().optional().default(''),
  closed: zod.boolean(),
  shortUrl: zod.string().url(),
  due: zod.string().nullable().optional(),
  idLabels: zod.array(zod.string()).optional().default([]),
  pos: zod.number().optional(),
});

const trelloListSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
});

/**
 * Obtiene todas las tarjetas de un board via `GET /1/boards/{id}/cards`.
 * Incluye resolucion de nombres de lista.
 *
 * @param config - Configuracion tipada con credenciales Trello.
 * @param boardId - Identificador del board.
 * @param fetchImpl - Implementacion de fetch inyectable para pruebas.
 * @returns Lista de CardSummary con nombres de lista resueltos.
 */
export const fetchBoardCards = async (
  config: Config,
  boardId: string,
  fetchImpl: typeof fetch = fetch
): Promise<Result<CardSummary[], DomainError>> => {
  const listsResponse = await fetchImpl(
    buildTrelloUrl(config, `/boards/${boardId}/lists`, { fields: 'name' })
  );

  if (!listsResponse.ok) {
    return err(await mapTrelloHttpError(listsResponse));
  }

  const cardsResponse = await fetchImpl(
    buildTrelloUrl(config, `/boards/${boardId}/cards`, {
      fields: 'id,name,idList,idBoard,closed,shortUrl,due',
      filter: 'all',
    })
  );

  if (!cardsResponse.ok) {
    return err(await mapTrelloHttpError(cardsResponse));
  }

  const lists = zod.array(trelloListSchema).parse(await listsResponse.json());
  const cards = zod.array(trelloCardSchema).parse(await cardsResponse.json());
  const listNames = new Map<string, string>(lists.map((list) => [list.id, list.name]));

  return ok(cards.map((card) => mapToCardSummary(card, listNames)));
};

/**
 * Crea una nueva tarjeta en Trello via `POST /1/cards`.
 *
 * @param config - Configuracion tipada con credenciales Trello.
 * @param input - Datos de la tarjeta a crear.
 * @param fetchImpl - Implementacion de fetch inyectable para pruebas.
 * @returns Card creada.
 */
export const createTrelloCard = async (
  config: Config,
  input: {
    name: string;
    idList: string;
    description?: string;
    pos?: string;
    due?: string;
  },
  fetchImpl: typeof fetch = fetch
): Promise<Result<Card, DomainError>> => {
  const queryParams: Record<string, string> = {
    idList: input.idList,
    name: input.name,
  };

  if (input.description) queryParams.desc = input.description;
  if (input.pos) queryParams.pos = input.pos;
  if (input.due) queryParams.due = input.due;

  const url = buildTrelloUrl(config, '/cards', queryParams);
  const response = await fetchImpl(url, { method: 'POST' });

  if (!response.ok) {
    return err(await mapTrelloHttpError(response));
  }

  const rawCard = trelloCardSchema.parse(await response.json());
  return ok(mapToCard(rawCard));
};

/**
 * Actualiza una tarjeta existente via `PUT /1/cards/{id}`.
 *
 * @param config - Configuracion tipada con credenciales Trello.
 * @param cardId - Identificador de la tarjeta.
 * @param input - Campos a actualizar.
 * @param fetchImpl - Implementacion de fetch inyectable para pruebas.
 * @returns Card actualizada.
 */
export const updateTrelloCard = async (
  config: Config,
  cardId: string,
  input: {
    name?: string;
    desc?: string;
    due?: string | null;
    dueComplete?: boolean;
    idList?: string;
    pos?: string;
    closed?: boolean;
  },
  fetchImpl: typeof fetch = fetch
): Promise<Result<Card, DomainError>> => {
  const queryParams: Record<string, string> = {};

  if (input.name !== undefined) queryParams.name = input.name;
  if (input.desc !== undefined) queryParams.desc = input.desc;
  if (input.due !== undefined) queryParams.due = input.due ?? '';
  if (input.dueComplete !== undefined) queryParams.dueComplete = String(input.dueComplete);
  if (input.idList !== undefined) queryParams.idList = input.idList;
  if (input.pos !== undefined) queryParams.pos = input.pos;
  if (input.closed !== undefined) queryParams.closed = String(input.closed);

  const url = buildTrelloUrl(config, `/cards/${cardId}`, queryParams);
  const response = await fetchImpl(url, { method: 'PUT' });

  if (!response.ok) {
    return err(await mapTrelloHttpError(response));
  }

  const rawCard = trelloCardSchema.parse(await response.json());
  return ok(mapToCard(rawCard));
};

/**
 * Elimina una tarjeta de Trello via `DELETE /1/cards/{id}`.
 *
 * @param config - Configuracion tipada con credenciales Trello.
 * @param cardId - Identificador de la tarjeta a eliminar.
 * @param fetchImpl - Implementacion de fetch inyectable para pruebas.
 * @returns Resultado vacio en caso de exito.
 */
export const deleteTrelloCard = async (
  config: Config,
  cardId: string,
  fetchImpl: typeof fetch = fetch
): Promise<Result<void, DomainError>> => {
  const url = buildTrelloUrl(config, `/cards/${cardId}`);

  const response = await fetchImpl(url, { method: 'DELETE' });

  if (!response.ok) {
    return err(await mapTrelloHttpError(response));
  }

  return ok(undefined);
};

/**
 * Obtiene una tarjeta individual via `GET /1/cards/{id}`.
 */
export const fetchTrelloCard = async (
  config: Config,
  cardId: string,
  fetchImpl: typeof fetch = fetch
): Promise<Result<Card, DomainError>> => {
  const url = buildTrelloUrl(config, `/cards/${cardId}`, {
    fields: 'id,name,idList,idBoard,desc,closed,shortUrl,due,idLabels,pos',
  });
  const response = await fetchImpl(url);

  if (!response.ok) {
    return err(await mapTrelloHttpError(response));
  }

  const rawCard = trelloCardSchema.parse(await response.json());
  return ok(mapToCard(rawCard));
};
