import {
  createAuthError,
  createBoardNotFoundError,
  createRateLimitedError,
  createTrelloApiError,
  type DomainError,
} from '../../domain/index.js';

/**
 * Mapea respuestas HTTP de Trello a errores de dominio tipados.
 * Centraliza la logica de traduccion de errores HTTP para todas las API modules.
 *
 * @param response - Respuesta HTTP de Trello.
 * @returns DomainError tipado segun el status code.
 */
export const mapTrelloHttpError = async (response: Response): Promise<DomainError> => {
  const bodyText = await safeReadBody(response);

  switch (response.status) {
    case 401:
    case 403:
      return createAuthError('Invalid Trello credentials or insufficient permissions');
    case 404:
      return createBoardNotFoundError();
    case 429: {
      const retryAfterHeader = response.headers.get('retry-after');
      const retryAfterSeconds = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : undefined;
      return createRateLimitedError(Number.isNaN(retryAfterSeconds) ? undefined : retryAfterSeconds);
    }
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
