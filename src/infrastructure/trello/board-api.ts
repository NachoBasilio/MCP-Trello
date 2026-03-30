import { z as zod } from 'zod';

import type { Board } from '../../domain/index.js';
import type { Config } from '../../config/index.js';
import { err, ok, type Result } from '../../shared/index.js';
import { type DomainError, createTrelloApiError } from '../../domain/index.js';

const trelloBoardSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
});

export type TrelloBoardDto = zod.infer<typeof trelloBoardSchema>;

/**
 * Crea la URL completa para un endpoint de Trello con autenticacion por query params.
 */
export const buildTrelloBoardApiUrl = (
  config: Config,
  pathname: string,
  query: Record<string, string>
): string => {
  const baseUrl = new URL(
    config.TRELLO_API_BASE_URL.endsWith('/')
      ? config.TRELLO_API_BASE_URL
      : `${config.TRELLO_API_BASE_URL}/`
  );
  const url = new URL(pathname.replace(/^\//, ''), baseUrl);

  url.searchParams.set('key', config.TRELLO_API_KEY);
  url.searchParams.set('token', config.TRELLO_TOKEN);

  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }

  return url.toString();
};

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
  const url = buildTrelloBoardApiUrl(config, `/members/${memberId}/boards`, {
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
