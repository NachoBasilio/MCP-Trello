import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z as zod } from 'zod';

import type { ChangeLabelColorUseCase } from '../../application/change-label-color.js';
import { TRELLO_LABEL_COLORS } from '../../domain/index.js';
import { isErr } from '../../shared/index.js';

const labelColorEnum = zod.enum(TRELLO_LABEL_COLORS);

const changeLabelColorSchemaBase = zod.object({
  labelId: zod.string().trim().min(1).optional(),
  labelName: zod.string().trim().min(1).optional(),
  boardId: zod.string().trim().min(1).optional(),
  boardName: zod.string().trim().min(1).optional(),
  color: labelColorEnum,
});

export const changeLabelColorInputSchema = changeLabelColorSchemaBase
  .refine((value) => typeof value.labelId === 'string' || typeof value.labelName === 'string', {
    message: 'labelId or labelName is required',
    path: ['labelId'],
  })
  .refine((value) => {
    if (typeof value.labelId === 'string') {
      return true;
    }

    if (typeof value.labelName === 'string') {
      return typeof value.boardId === 'string' || typeof value.boardName === 'string';
    }

    return true;
  }, {
    message: 'boardId or boardName is required when using labelName without labelId',
    path: ['boardId'],
  });

export const changeLabelColorOutputSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  color: zod.string(),
});

export interface ChangeLabelColorToolHandler {
  name: 'trello_change_label_color';
  title: string;
  description: string;
  inputSchema: typeof changeLabelColorSchemaBase.shape;
  outputSchema: typeof changeLabelColorOutputSchema.shape;
  execute: (arguments_: unknown) => Promise<CallToolResult>;
}

/**
 * Handler MCP para cambiar el color de labels existentes en Trello.
 */
export const createChangeLabelColorTool = (
  useCase: ChangeLabelColorUseCase
): ChangeLabelColorToolHandler => {
  return {
    name: 'trello_change_label_color',
    title: 'Cambiar color de label',
    description:
      'Cambia el color de una label por labelId o por nombre resolviendo dentro de un board.',
    inputSchema: changeLabelColorSchemaBase.shape,
    outputSchema: changeLabelColorOutputSchema.shape,
    execute: async (arguments_: unknown): Promise<CallToolResult> => {
      const input = changeLabelColorInputSchema.parse(arguments_);
      const result = await useCase.execute(input);

      if (isErr(result)) {
        throw result.error;
      }

      const output = {
        id: result.value.id,
        name: result.value.name,
        color: result.value.color,
      };

      return {
        content: [
          {
            type: 'text',
            text: `Label actualizada: ${output.name} -> ${output.color}`,
          },
        ],
        structuredContent: output,
      };
    },
  };
};
