import { z as zod } from 'zod';

import type { Board } from '../../domain/index.js';
import type { Config } from '../../config/index.js';
import { err, ok, type Result } from '../../shared/index.js';
import { type DomainError, createTrelloApiError } from '../../domain/index.js';

import { buildTrelloUrl } from './url.js';

const trelloBoardSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
});

/**
 * Obtiene todos los boards accesibles del miembro autenticado via `GET /1/members/{id}/boards`.
 *
 * @param config - Configuracion tipada con credenciales Trello.
 * @param memberId - Identificador del miembro Trello (o "me" para el autenticado).
 * @param fetchImpl - Implementacion de fetch inyectable para pruebas.
 * @returns Lista de boards con id y name.
 */
export const fetchMemberBoards = async (
  config: Config,
  memberId: string = 'me',
  fetchImpl: typeof fetch = fetch
): Promise<Result<Board[], DomainError>> => {
  const url = buildTrelloUrl(config, `/members/${memberId}/boards`, {
    fields: 'id,name',
    filter: 'open',
  });

  const response = await fetchImpl(url);

  if (!response.ok) {
    const bodyText = await safeReadBody(response);
    return err(
      createTrelloApiError(`Failed to fetch member boards (${response.status})`, {
        status: response.status,
        body: bodyText,
      })
    );
  }

  const rawBoards = zod.array(trelloBoardSchema).parse(await response.json());
  const boards: Board[] = rawBoards.map((board) => ({
    id: board.id,
    name: board.name,
    description: '',
    closed: false,
  }));

  return ok(boards);
};

const safeReadBody = async (response: Response): Promise<string | undefined> => {
  try {
    return await response.text();
  } catch {
    return undefined;
  }
};
