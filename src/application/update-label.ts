import {
  LabelNameVO,
  TRELLO_LABEL_COLORS,
  createValidationError,
  type DomainError,
  type Label,
} from '../domain/index.js';
import { isErr, ok, type Result } from '../shared/index.js';

import type { TrelloLabelPort } from './ports.js';
import type { ResolveLabelUseCase } from './resolve-label.js';

export interface UpdateLabelInput {
  labelId?: string;
  labelName?: string;
  boardId?: string;
  boardName?: string;
  newName?: string;
  newColor?: string;
}

export interface UpdateLabelOutput {
  label: Label;
}

export interface UpdateLabelUseCase {
  execute(input: UpdateLabelInput): Promise<Result<UpdateLabelOutput, DomainError>>;
}

const allowedColors = new Set(TRELLO_LABEL_COLORS);

/**
 * Actualiza nombre y color de labels reutilizando la resolucion consistente.
 */
export const createUpdateLabelUseCase = (
  port: TrelloLabelPort,
  resolveLabel: ResolveLabelUseCase
): UpdateLabelUseCase => {
  return {
    execute: async (input: UpdateLabelInput): Promise<Result<UpdateLabelOutput, DomainError>> => {
      const normalizedUpdates = normalizeUpdates(input);

      if (isErr(normalizedUpdates)) {
        return normalizedUpdates;
      }

      const resolvedLabel = await resolveLabel.execute({
        labelId: input.labelId,
        labelName: input.labelName,
        boardId: input.boardId,
        boardName: input.boardName,
      });

      if (isErr(resolvedLabel)) {
        return resolvedLabel;
      }

      const updateResult = await port.updateLabel(resolvedLabel.value.label.id, {
        name: normalizedUpdates.value.name,
        color: normalizedUpdates.value.color,
      });

      if (isErr(updateResult)) {
        return updateResult;
      }

      return ok({
        label: updateResult.value,
      });
    },
  };
};

const normalizeUpdates = (
  input: UpdateLabelInput
): Result<{ name?: string; color?: string }, DomainError> => {
  const updates: { name?: string; color?: string } = {};

  if (typeof input.newName === 'string') {
    updates.name = LabelNameVO.create(input.newName).value;
  }

  if (typeof input.newColor === 'string') {
    const normalizedColor = input.newColor.trim().toLowerCase();
    if (!allowedColors.has(normalizedColor as (typeof TRELLO_LABEL_COLORS)[number])) {
      return {
        ok: false,
        error: createValidationError('Invalid label color', {
          color: input.newColor,
          allowed: [...allowedColors],
        }),
      };
    }
    updates.color = normalizedColor;
  }

  if (!updates.name && !updates.color) {
    return {
      ok: false,
      error: createValidationError('newName or newColor is required'),
    };
  }

  return ok(updates);
};
