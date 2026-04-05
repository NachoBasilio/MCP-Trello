import {
  createAmbiguousError,
  createNotFoundError,
  createValidationError,
  LabelNameVO,
  type DomainError,
  type Label,
} from '../domain/index.js';
import { isErr, ok, type Result } from '../shared/index.js';

import type { TrelloLabelPort } from './ports.js';

export interface ResolveLabelInput {
  labelId?: string;
  labelName?: string;
  boardId?: string;
  boardName?: string;
}

export interface ResolveLabelOutput {
  boardId: string;
  label: Label;
}

export interface ResolveLabelUseCase {
  execute(input: ResolveLabelInput): Promise<Result<ResolveLabelOutput, DomainError>>;
}

/**
 * Resuelve una etiqueta del board validando nombre o id y detectando ambiguedad.
 */
export const createResolveLabelUseCase = (port: TrelloLabelPort): ResolveLabelUseCase => {
  return {
    execute: async (input: ResolveLabelInput): Promise<Result<ResolveLabelOutput, DomainError>> => {
      if (!hasLabelSelector(input)) {
        return {
          ok: false,
          error: createValidationError('labelId or labelName is required'),
        };
      }

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

      const targetLabel = selectLabel(labelsResult.value, input);

      if (isErr(targetLabel)) {
        return targetLabel;
      }

      return ok({
        boardId: boardIdResult.value,
        label: targetLabel.value,
      });
    },
  };
};

const hasLabelSelector = (input: ResolveLabelInput): boolean => {
  return typeof input.labelId === 'string' || typeof input.labelName === 'string';
};

const selectLabel = (
  labels: Label[],
  input: ResolveLabelInput
): Result<Label, DomainError> => {
  if (input.labelId) {
    const normalizedId = input.labelId.trim();
    const labelById = labels.find((label) => label.id === normalizedId);

    if (!labelById) {
      return {
        ok: false,
        error: createNotFoundError('label', normalizedId),
      };
    }

    return ok(labelById);
  }

  if (!input.labelName) {
    return {
      ok: false,
      error: createValidationError('labelName is required when labelId is absent'),
    };
  }

  const searchName = LabelNameVO.create(input.labelName);
  const matches = labels.filter((label) => searchName.matches(label.name));

  if (matches.length === 0) {
    return {
      ok: false,
      error: createNotFoundError('label', input.labelName),
    };
  }

  if (matches.length > 1) {
    return {
      ok: false,
      error: createAmbiguousError(
        'label',
        matches.map((label) => ({ id: label.id, name: label.name })),
        input.labelName
      ),
    };
  }

  return ok(matches[0]);
};
