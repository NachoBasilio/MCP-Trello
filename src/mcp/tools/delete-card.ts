import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z as zod } from 'zod';

import type { DeleteCardUseCase } from '../../application/delete-card.js';
import { isErr } from '../../shared/index.js';

export const deleteCardInputSchemaShape = zod.object({
  cardId: zod.string().trim().min(1).optional(),
  cardName: zod.string().trim().min(1).optional(),
  boardId: zod.string().trim().min(1).optional(),
  boardName: zod.string().trim().min(1).optional(),
});

export const deleteCardInputSchema = deleteCardInputSchemaShape
  // Require at least one identifier for the card: either cardId or cardName.
  .refine(
    (data) => !!data.cardId || !!data.cardName,
    {
      message: 'Debes proporcionar cardId o cardName para eliminar una tarjeta.',
      path: ['cardId'],
    },
  )
  // When deleting by name (without cardId), require boardId or boardName to disambiguate.
  .refine(
    (data) => {
      if (data.cardId) {
        return true;
      }
      if (!data.cardName) {
        return true;
      }
      return !!data.boardId || !!data.boardName;
    },
    {
      message:
        'Cuando eliminas por cardName debes proporcionar también boardId o boardName para identificar el tablero.',
      path: ['boardId'],
    },
  );

export const deleteCardOutputSchema = zod.object({
  id: zod.string(),
  name: zod.string().optional(),
});

export interface DeleteCardToolHandler {
  name: 'trello_delete_card';
  title: string;
  description: string;
  inputSchema: typeof deleteCardInputSchemaShape.shape;
  outputSchema: typeof deleteCardOutputSchema.shape;
  execute: (arguments_: unknown) => Promise<CallToolResult>;
}

/**
 * Handler MCP para eliminar tarjetas de Trello.
 */
export const createDeleteCardTool = (useCase: DeleteCardUseCase): DeleteCardToolHandler => {
  return {
    name: 'trello_delete_card',
    title: 'Eliminar tarjeta de Trello',
    description:
      'Elimina una tarjeta de Trello usando cardId directo o resolviendo por nombre con la misma semantica de busqueda.',
    inputSchema: deleteCardInputSchemaShape.shape,
    outputSchema: deleteCardOutputSchema.shape,
    execute: async (arguments_: unknown): Promise<CallToolResult> => {
      const input = deleteCardInputSchema.parse(arguments_);
      const result = await useCase.execute(input);

      if (isErr(result)) {
        throw result.error;
      }

      const output = deleteCardOutputSchema.parse(result.value);

      return {
        content: [
          {
            type: 'text',
            text: `Tarjeta eliminada: ${output.name ? output.name + ' ' : ''}(${output.id})`,
          },
        ],
        structuredContent: output,
      };
    },
  };
};
