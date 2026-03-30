import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z as zod } from 'zod';

import type { AddCommentUseCase } from '../../application/add-comment.js';
import { isErr } from '../../shared/index.js';
import {
  trelloAddCommentInputSchema,
  trelloAddCommentInputSchemaShape,
  trelloAddCommentOutputSchema,
  type TrelloAddCommentInput,
} from '../../types/tool-contract.js';

export interface AddCommentToolHandler {
  name: 'trello_add_comment';
  title: string;
  description: string;
  inputSchema: typeof trelloAddCommentInputSchemaShape;
  outputSchema: typeof trelloAddCommentOutputSchema.shape;
  execute: (arguments_: unknown) => Promise<CallToolResult>;
}

/**
 * Crea la tool MCP minima para comentar una tarjeta ya existente sin mezclar reglas de resolucion o HTTP.
 */
export const createAddCommentTool = (useCase: AddCommentUseCase): AddCommentToolHandler => {
  return {
    name: 'trello_add_comment',
    title: 'Agregar comentario en Trello',
    description:
      'Agrega un comentario a una tarjeta existente usando `cardId` o resolviendo `cardName` con la misma semantica de busqueda ya implementada.',
    inputSchema: trelloAddCommentInputSchemaShape,
    outputSchema: trelloAddCommentOutputSchema.shape,
    execute: async (arguments_: unknown): Promise<CallToolResult> => {
      const input = parseAddCommentInput(arguments_);
      const result = await useCase.execute(input);

      if (isErr(result)) {
        throw result.error;
      }

      const output = trelloAddCommentOutputSchema.parse(result.value);

      return {
        content: [
          {
            type: 'text',
            text: formatAddCommentText(output),
          },
        ],
        structuredContent: output,
      };
    },
  };
};

const parseAddCommentInput = (arguments_: unknown): TrelloAddCommentInput => {
  const parsed = trelloAddCommentInputSchema.safeParse(arguments_ ?? {});

  if (parsed.success) {
    return parsed.data;
  }

  throw parsed.error;
};

const formatAddCommentText = (output: zod.infer<typeof trelloAddCommentOutputSchema>): string => {
  return [`Comment added: ${output.id}`, `- creator: ${output.creator}`, `- date: ${output.date}`, `- text: ${output.text}`].join(
    '\n'
  );
};
