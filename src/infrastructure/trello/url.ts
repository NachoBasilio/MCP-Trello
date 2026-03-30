import type { Config } from '../../config/index.js';

/**
 * Crea la URL completa para un endpoint de Trello con autenticacion por query params.
 *
 * @param config - Configuracion tipada con credenciales Trello.
 * @param pathname - Path relativo del endpoint (ej: `/boards/{id}/lists`).
 * @param query - Parametros de consulta adicionales.
 * @returns URL absoluta con key y token incluidos.
 */
export const buildTrelloUrl = (
  config: Config,
  pathname: string,
  query: Record<string, string> = {}
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
