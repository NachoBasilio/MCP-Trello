import type { DomainError } from '../domain/index.js';
import { isErr, ok, type Result } from '../shared/index.js';

import type { ListLabelCardsOutput, ListLabelCardsUseCase } from './list-label-cards.js';

export interface BoardByLabelInput {
  boardId?: string;
  boardName?: string;
  labelName: string;
  limit?: number;
}

export type BoardByLabelOutput = ListLabelCardsOutput;

export interface BoardByLabelUseCase {
  execute(input: BoardByLabelInput): Promise<Result<BoardByLabelOutput, DomainError>>;
}

/**
 * Reutiliza la logica de ListLabelCards para exponer recursos MCP por label.
 */
export const createBoardByLabelUseCase = (useCase: ListLabelCardsUseCase): BoardByLabelUseCase => {
  return {
    execute: async (input: BoardByLabelInput): Promise<Result<BoardByLabelOutput, DomainError>> => {
      const result = await useCase.execute({
        boardId: input.boardId,
        boardName: input.boardName,
        labelName: input.labelName,
        limit: input.limit,
      });

      if (isErr(result)) {
        return result;
      }

      return ok(result.value);
    },
  };
};
