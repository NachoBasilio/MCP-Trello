import type { DomainError, Label } from '../domain/index.js';
import { isErr, ok, type Result } from '../shared/index.js';

import type { TrelloLabelPort } from './ports.js';

export interface ListBoardLabelsInput {
  boardId?: string;
  boardName?: string;
}

export interface ListBoardLabelsOutput {
  boardId: string;
  labelCount: number;
  labels: Label[];
}

export interface ListBoardLabelsUseCase {
  execute(input: ListBoardLabelsInput): Promise<Result<ListBoardLabelsOutput, DomainError>>;
}

/**
 * Lista todas las labels disponibles en un board soportando resolucion por nombre.
 */
export const createListBoardLabelsUseCase = (port: TrelloLabelPort): ListBoardLabelsUseCase => {
  return {
    execute: async (input: ListBoardLabelsInput): Promise<Result<ListBoardLabelsOutput, DomainError>> => {
      const boardIdResult = await port.resolveBoard({
        boardId: input.boardId,
        boardName: input.boardName,
      });

      if (isErr(boardIdResult)) {
        return boardIdResult;
      }

      const labelsResult = await port.listBoardLabels(boardIdResult.value);

      if (isErr(labelsResult)) {
        return labelsResult;
      }

      return ok({
        boardId: boardIdResult.value,
        labelCount: labelsResult.value.length,
        labels: labelsResult.value,
      });
    },
  };
};
