import type { DomainError, Label } from '../domain/index.js';
import { isErr, type Result } from '../shared/index.js';

import type { TrelloGateway } from './ports.js';

export interface AddLabelsInput {
  cardId: string;
  labels: string[];
  boardId?: string;
  boardName?: string;
  createIfMissing?: boolean;
}

export interface AddLabelsUseCase {
  execute(input: AddLabelsInput): Promise<Result<Label[], DomainError>>;
}

/**
 * Agrega labels a una tarjeta, creandolas si no existen y createIfMissing es true.
 */
export const createAddLabelsUseCase = (gateway: TrelloGateway): AddLabelsUseCase => {
  return {
    execute: async (input: AddLabelsInput): Promise<Result<Label[], DomainError>> => {
      const boardIdResult = await gateway.resolveBoard({
        boardId: input.boardId,
        boardName: input.boardName,
      });

      if (isErr(boardIdResult)) {
        return boardIdResult;
      }

      const existingLabelsResult = await gateway.listBoardLabels(boardIdResult.value);

      if (isErr(existingLabelsResult)) {
        return existingLabelsResult;
      }

      const addedLabels: Label[] = [];

      for (const labelName of input.labels) {
        let label = existingLabelsResult.value.find(
          (l) => l.name.toLowerCase() === labelName.toLowerCase()
        );

        if (!label && input.createIfMissing) {
          const createResult = await gateway.createLabel(boardIdResult.value, labelName, 'blue');

          if (isErr(createResult)) {
            return createResult;
          }

          label = createResult.value;
        }

        if (label) {
          const addResult = await gateway.addLabel(input.cardId, label.id);

          if (isErr(addResult)) {
            return addResult;
          }

          addedLabels.push(label);
        }
      }

      return { ok: true, value: addedLabels };
    },
  };
};
