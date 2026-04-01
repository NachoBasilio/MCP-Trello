import {
  createAmbiguousError,
  createNotFoundError,
  type DomainError,
  type Label,
  TRELLO_LABEL_COLORS,
} from '../domain/index.js';
import { createValidationError } from '../domain/index.js';
import { isErr, type Result } from '../shared/index.js';

import type { TrelloGateway } from './ports.js';

export interface ChangeLabelColorInput {
  labelId?: string;
  labelName?: string;
  boardId?: string;
  boardName?: string;
  color: string;
}

export interface ChangeLabelColorUseCase {
  execute(input: ChangeLabelColorInput): Promise<Result<Label, DomainError>>;
}

/**
 * Cambia el color de una label por ID directo o resolviendola por nombre dentro de un board.
 */
export const createChangeLabelColorUseCase = (gateway: TrelloGateway): ChangeLabelColorUseCase => {
  return {
    execute: async (input: ChangeLabelColorInput): Promise<Result<Label, DomainError>> => {
      const normalizedColor = input.color.trim().toLowerCase();
      if (!TRELLO_LABEL_COLORS.includes(normalizedColor as (typeof TRELLO_LABEL_COLORS)[number])) {
        return createValidationResult('Invalid label color', {
          color: input.color,
          allowed: TRELLO_LABEL_COLORS,
        });
      }

      if (input.labelId && input.labelId.trim().length > 0) {
        return gateway.updateLabelColor(input.labelId.trim(), normalizedColor);
      }

      const boardIdResult = await gateway.resolveBoard({
        boardId: input.boardId,
        boardName: input.boardName,
      });

      if (isErr(boardIdResult)) {
        return boardIdResult;
      }

      const labelsResult = await gateway.listBoardLabels(boardIdResult.value);

      if (isErr(labelsResult)) {
        return labelsResult;
      }

      const searchName = input.labelName?.trim().toLowerCase() ?? '';
      const matches = labelsResult.value.filter((label) => label.name.trim().toLowerCase() === searchName);

      if (matches.length === 0) {
        return { ok: false, error: createNotFoundError('label', input.labelName ?? '') };
      }

      if (matches.length > 1) {
        return {
          ok: false,
          error: createAmbiguousError(
            'label',
            matches.map((label) => ({ id: label.id, name: label.name })),
            input.labelName ?? ''
          ),
        };
      }

      return gateway.updateLabelColor(matches[0].id, normalizedColor);
    },
  };
};

const createValidationResult = (
  message: string,
  context: Record<string, unknown>
): Result<never, DomainError> => {
  return {
    ok: false,
    error: createValidationError(message, context),
  };
};
