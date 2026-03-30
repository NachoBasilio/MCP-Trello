import type { Board, DomainError } from '../domain/index.js';
import type { Result } from '../shared/index.js';

import type { TrelloBoardPort } from './ports.js';

export interface ListBoardsUseCase {
  execute(): Promise<Result<Board[], DomainError>>;
}

/**
 * Caso de uso para listar todos los boards accesibles del miembro autenticado.
 */
export const createListBoardsUseCase = (port: TrelloBoardPort): ListBoardsUseCase => {
  return {
    execute: async (): Promise<Result<Board[], DomainError>> => {
      return port.listBoards();
    },
  };
};
