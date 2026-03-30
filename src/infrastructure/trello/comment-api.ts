import { z as zod } from 'zod';

import type { Config } from '../../config/index.js';
import type { Comment, DomainError } from '../../domain/index.js';
import { createTrelloApiError } from '../../domain/index.js';
import { err, ok, type Result } from '../../shared/index.js';

import { buildTrelloUrl } from './url.js';
import { mapToComment } from './mappers.js';

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

/**
 * Publica un comentario en una tarjeta via `POST /1/cards/{id}/actions/comments`.
 *
 * @param config - Configuracion tipada con credenciales Trello.
 * @param cardId - Identificador de la tarjeta.
 * @param text - Texto del comentario.
 * @param fetchImpl - Implementacion de fetch inyectable para pruebas.
 * @returns Comentario creado.
 */
export const postCardComment = async (
  config: Config,
  cardId: string,
  text: string,
  fetchImpl: typeof fetch = fetch
): Promise<Result<Comment, DomainError>> => {
  const url = buildTrelloUrl(config, `/cards/${cardId}/actions/comments`, {
    text,
  });

  const response = await fetchImpl(url, { method: 'POST' });

  if (!response.ok) {
    const bodyText = await safeReadBody(response);
    return err(
      createTrelloApiError(`Failed to post comment (${response.status})`, {
        status: response.status,
        body: bodyText,
      })
    );
  }

  const action = trelloCommentActionSchema.parse(await response.json());
  return ok(mapToComment(action));
};

/**
 * Obtiene los comentarios de una tarjeta via `GET /1/cards/{id}/actions`.
 *
 * @param config - Configuracion tipada con credenciales Trello.
 * @param cardId - Identificador de la tarjeta.
 * @param fetchImpl - Implementacion de fetch inyectable para pruebas.
 * @returns Lista de comentarios.
 */
export const fetchCardComments = async (
  config: Config,
  cardId: string,
  fetchImpl: typeof fetch = fetch
): Promise<Result<Comment[], DomainError>> => {
  const url = buildTrelloUrl(config, `/cards/${cardId}/actions`, {
    filter: 'commentCard',
    limit: '50',
  });

  const response = await fetchImpl(url);

  if (!response.ok) {
    const bodyText = await safeReadBody(response);
    return err(
      createTrelloApiError(`Failed to fetch comments (${response.status})`, {
        status: response.status,
        body: bodyText,
      })
    );
  }

  const rawActions = zod.array(trelloCommentActionSchema).parse(await response.json());
  const comments = rawActions.map((action) => mapToComment(action));

  return ok(comments);
};

const safeReadBody = async (response: Response): Promise<string | undefined> => {
  try {
    return await response.text();
  } catch {
    return undefined;
  }
};
