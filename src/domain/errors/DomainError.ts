/**
 * Codigos de error canonicos usados por la capa de dominio para clasificar fallos esperables.
 */
export enum ErrorCode {
  NotFound = 'NOT_FOUND',
  RateLimit = 'RATE_LIMIT',
  Auth = 'AUTH',
  Validation = 'VALIDATION',
  Ambiguous = 'AMBIGUOUS',
  Internal = 'INTERNAL',
  Configuration = 'CONFIGURATION',
  BoardIdRequired = 'BOARD_ID_REQUIRED',
  CardAmbiguous = 'CARD_AMBIGUOUS',
  CardNotFound = 'CARD_NOT_FOUND',
  CommentEmpty = 'COMMENT_EMPTY',
  BoardNotFound = 'BOARD_NOT_FOUND',
  RateLimited = 'RATE_LIMITED',
  TrelloApiError = 'TRELLO_API_ERROR',
}

/**
 * Contexto adicional serializable para enriquecer errores de dominio sin perder tipado.
 */
export interface DomainErrorContext {
  [key: string]: unknown;
}

/**
 * Error base del dominio con codigo tipado y contexto opcional para diagnostico.
 */
export class DomainError extends Error {
  public readonly code: ErrorCode;
  public readonly context?: DomainErrorContext;

  constructor(code: ErrorCode, message: string, context?: DomainErrorContext) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.context = context;
  }
}

/**
 * Informa si un valor desconocido corresponde a un error propio del dominio.
 */
export const isDomainError = (value: unknown): value is DomainError => {
  return value instanceof DomainError;
};

/**
 * Crea un error de recurso inexistente para una entidad del dominio.
 */
export const createNotFoundError = (resource: string, identifier: string): DomainError => {
  return new DomainError(ErrorCode.NotFound, `${resource} not found: ${identifier}`);
};

/**
 * Crea un error de limite de tasa cuando Trello o un proveedor externo rechaza la operacion.
 */
export const createRateLimitError = (retryAfter?: number): DomainError => {
  return new DomainError(
    ErrorCode.RateLimit,
    retryAfter ? `Rate limited by Trello API. Retry after ${retryAfter}s` : 'Rate limited by Trello API'
  );
};

/**
 * Crea un error de autenticacion para credenciales invalidas o acceso denegado.
 */
export const createAuthError = (message = 'Authentication failed'): DomainError => {
  return new DomainError(ErrorCode.Auth, message);
};

/**
 * Crea un error de validacion con contexto opcional para describir la entrada invalida.
 */
export const createValidationError = (message: string, context?: DomainErrorContext): DomainError => {
  return new DomainError(ErrorCode.Validation, message, context);
};

/**
 * Crea un error de ambiguedad cuando una busqueda devuelve multiples coincidencias validas.
 */
export const createAmbiguousError = (
  resource: string,
  matches: { id: string; name: string }[],
  searchTerm: string
): DomainError => {
  return new DomainError(
    ErrorCode.Ambiguous,
    `Ambiguous ${resource} name: multiple matches found for "${searchTerm}"`,
    { matches, searchTerm }
  );
};

/**
 * Crea un error interno del dominio para fallos inesperados no clasificados.
 */
export const createInternalError = (message: string, context?: DomainErrorContext): DomainError => {
  return new DomainError(ErrorCode.Internal, message, context);
};

/**
 * Crea un error de configuracion cuando falta el board por defecto y no se provee uno explicito.
 */
export const createBoardIdRequiredError = (): DomainError => {
  return new DomainError(
    ErrorCode.BoardIdRequired,
    'Board ID required. Set TRELLO_DEFAULT_BOARD_ID or provide boardId parameter.'
  );
};

/**
 * Crea un error especifico para tarjetas ambiguas cuando varias coinciden con la misma consulta.
 */
export const createCardAmbiguousError = (
  matches: { id: string; name: string; idList: string }[],
  searchTerm: string
): DomainError => {
  return new DomainError(
    ErrorCode.CardAmbiguous,
    'Ambiguous card name. Multiple cards match. Provide cardId for disambiguation.',
    { matches, searchTerm }
  );
};

/**
 * Crea un error especifico para tarjetas no encontradas a partir de una consulta.
 */
export const createCardNotFoundError = (searchTerm: string): DomainError => {
  return new DomainError(ErrorCode.CardNotFound, `Card not found: ${searchTerm}`, { searchTerm });
};

/**
 * Crea un error cuando el comentario requerido llega vacio.
 */
export const createCommentEmptyError = (): DomainError => {
  return new DomainError(ErrorCode.CommentEmpty, 'Comment text cannot be empty');
};

/**
 * Crea un error cuando el board no existe o no puede ser accedido.
 */
export const createBoardNotFoundError = (): DomainError => {
  return new DomainError(ErrorCode.BoardNotFound, 'Board not found or inaccessible');
};

/**
 * Crea un error de limite de tasa enriquecido con `retryAfter` cuando esa informacion existe.
 */
export const createRateLimitedError = (retryAfter?: number): DomainError => {
  return new DomainError(
    ErrorCode.RateLimited,
    retryAfter ? `Rate limited by Trello API. Retry after ${retryAfter}s` : 'Rate limited by Trello API',
    retryAfter ? { retryAfter } : undefined
  );
};

/**
 * Crea un error para encapsular respuestas fallidas provenientes de la API de Trello.
 */
export const createTrelloApiError = (message: string, context?: DomainErrorContext): DomainError => {
  return new DomainError(ErrorCode.TrelloApiError, `Trello API error: ${message}`, context);
};
