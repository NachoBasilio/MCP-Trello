import { z as zod } from 'zod';

import type { Config } from '../../config/index.js';
import type { List, DomainError } from '../../domain/index.js';
import { createTrelloApiError } from '../../domain/index.js';
import { err, ok, type Result } from '../../shared/index.js';

import { buildTrelloUrl } from './url.js';
import { mapToList } from './mappers.js';

const trelloListSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  idBoard: zod.string().optional(),
});

/**
 * Obtiene todas las listas abiertas de un board via `GET /1/boards/{id}/lists`.
 *
 * @param config - Configuracion tipada con credenciales Trello.
 * @param boardId - Identificador del board.
 * @param fetchImpl - Implementacion de fetch inyectable para pruebas.
 * @returns Lista de listas del board.
 */
export const fetchBoardLists = async (
  config: Config,
  boardId: string,
  fetchImpl: typeof fetch = fetch
): Promise<Result<List[], DomainError>> => {
  const url = buildTrelloUrl(config, `/boards/${boardId}/lists`, {
    fields: 'id,name,idBoard',
    filter: 'open',
  });

  const response = await fetchImpl(url);

  if (!response.ok) {
    const bodyText = await safeReadBody(response);
    return err(
      createTrelloApiError(`Failed to fetch board lists (${response.status})`, {
        status: response.status,
        body: bodyText,
      })
    );
  }

  const rawLists = zod.array(trelloListSchema).parse(await response.json());
  const lists = rawLists.map((list) => mapToList(list, boardId));

  return ok(lists);
};

/**
 * Crea una nueva lista en un board via `POST /1/lists`.
 *
 * @param config - Configuracion tipada con credenciales Trello.
 * @param boardId - Identificador del board donde crear la lista.
 * @param name - Nombre de la nueva lista.
 * @param fetchImpl - Implementacion de fetch inyectable para pruebas.
 * @returns Lista creada.
 */
export const createBoardList = async (
  config: Config,
  boardId: string,
  name: string,
  fetchImpl: typeof fetch = fetch
): Promise<Result<List, DomainError>> => {
  const url = buildTrelloUrl(config, '/lists', {
    idBoard: boardId,
    name,
  });

  const response = await fetchImpl(url, { method: 'POST' });

  if (!response.ok) {
    const bodyText = await safeReadBody(response);
    return err(
      createTrelloApiError(`Failed to create list (${response.status})`, {
        status: response.status,
        body: bodyText,
      })
    );
  }

  const rawList = trelloListSchema.parse(await response.json());
  return ok(mapToList(rawList, boardId));
};

const safeReadBody = async (response: Response): Promise<string | undefined> => {
  try {
    return await response.text();
  } catch {
    return undefined;
  }
};
