import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z as zod } from 'zod';

import type { ApplicationDependencies, BootstrapDiagnosticSnapshot } from '../application/bootstrap.js';
import { createAddCommentTool, type AddCommentToolHandler } from './tools/add-comment.js';
import { createAddLabelsTool, type AddLabelsToolHandler } from './tools/add-labels.js';
import {
  createChangeLabelColorTool,
  type ChangeLabelColorToolHandler,
} from './tools/change-label-color.js';
import { createCreateCardTool, type CreateCardToolHandler } from './tools/create-card.js';
import { createListBoardsTool, type ListBoardsToolHandler } from './tools/list-boards.js';
import { createListColumnsTool, type ListColumnsToolHandler } from './tools/list-columns.js';
import { createMoveCardTool, type MoveCardToolHandler } from './tools/move-card.js';
import { createDeleteCardTool, type DeleteCardToolHandler } from './tools/delete-card.js';
import { createSearchCardsTool, type SearchCardsToolHandler } from './tools/search-cards.js';
import { createListBoardLabelsTool, type ListBoardLabelsToolHandler } from './tools/trello_list_board_labels.js';
import { createResolveLabelTool, type ResolveLabelToolHandler } from './tools/trello_resolve_label.js';
import { createListLabelCardsTool, type ListLabelCardsToolHandler } from './tools/trello_list_label_cards.js';
import {
  createSearchCardsByLabelTool,
  type SearchCardsByLabelToolHandler,
} from './tools/trello_search_cards_by_label.js';
import { createUpdateLabelTool, type UpdateLabelToolHandler } from './tools/trello_update_label.js';
import {
  createBoardSummaryResource,
  createBoardOverdueResource,
  createBoardByLabelResource,
} from './resources/index.js';

const allToolNames = [
  'bootstrap.status',
  'trello_search_cards',
  'trello_add_comment',
  'trello_list_boards',
  'trello_list_columns',
  'trello_create_card',
  'trello_move_card',
  'trello_delete_card',
  'trello_add_labels',
  'trello_change_label_color',
  'trello_list_board_labels',
  'trello_resolve_label',
  'trello_list_label_cards',
  'trello_search_cards_by_label',
  'trello_update_label',
] as const;

const bootstrapStatusOutputSchema = {
  scope: zod.literal('bootstrap'),
  transport: zod.literal('stdio'),
  capabilityPolicy: zod.literal('diagnostic-plus-full-trello'),
  toolNames: zod.tuple([
    zod.literal(allToolNames[0]),
    zod.literal(allToolNames[1]),
    zod.literal(allToolNames[2]),
    zod.literal(allToolNames[3]),
    zod.literal(allToolNames[4]),
    zod.literal(allToolNames[5]),
    zod.literal(allToolNames[6]),
    zod.literal(allToolNames[7]),
    zod.literal(allToolNames[8]),
    zod.literal(allToolNames[9]),
    zod.literal(allToolNames[10]),
    zod.literal(allToolNames[11]),
    zod.literal(allToolNames[12]),
    zod.literal(allToolNames[13]),
    zod.literal(allToolNames[14]),
  ]),
  trelloRuntimeAvailable: zod.literal(true),
  trelloWriteRuntimeAvailable: zod.literal(true),
  trelloCredentialsConfigured: zod.boolean(),
  defaultBoardConfigured: zod.boolean(),
};

export interface BootstrapToolHandler {
  name: 'bootstrap.status';
  title: string;
  description: string;
  outputSchema: typeof bootstrapStatusOutputSchema;
  execute: () => Promise<CallToolResult>;
}

export interface BootstrapHandlers {
  diagnosticTool: BootstrapToolHandler;
  searchCardsTool: SearchCardsToolHandler;
  addCommentTool: AddCommentToolHandler;
  listBoardsTool: ListBoardsToolHandler;
  listColumnsTool: ListColumnsToolHandler;
  createCardTool: CreateCardToolHandler;
  moveCardTool: MoveCardToolHandler;
  deleteCardTool: DeleteCardToolHandler;
  addLabelsTool: AddLabelsToolHandler;
  changeLabelColorTool: ChangeLabelColorToolHandler;
  listBoardLabelsTool: ListBoardLabelsToolHandler;
  resolveLabelTool: ResolveLabelToolHandler;
  listLabelCardsTool: ListLabelCardsToolHandler;
  searchCardsByLabelTool: SearchCardsByLabelToolHandler;
  updateLabelTool: UpdateLabelToolHandler;
  boardSummaryResource: ReturnType<typeof createBoardSummaryResource>;
  boardOverdueResource: ReturnType<typeof createBoardOverdueResource>;
  boardByLabelResource: ReturnType<typeof createBoardByLabelResource>;
}

const formatBootstrapStatusText = (status: BootstrapDiagnosticSnapshot): string => {
  return [
    'Bootstrap MCP status',
    `- transport target: ${status.transport}`,
    `- capability policy: ${status.capabilityPolicy}`,
    `- published tools: ${status.toolNames.join(', ')}`,
    `- Trello runtime available: ${status.trelloRuntimeAvailable ? 'yes' : 'no'}`,
    `- Trello write runtime available: ${status.trelloWriteRuntimeAvailable ? 'yes' : 'no'}`,
    `- Trello credentials configured: ${status.trelloCredentialsConfigured ? 'yes' : 'no'}`,
    `- default board configured: ${status.defaultBoardConfigured ? 'yes' : 'no'}`,
  ].join('\n');
};

/**
 * Agrupa todos los handlers MCP del servidor.
 */
export const createBootstrapHandlers = (dependencies: ApplicationDependencies): BootstrapHandlers => {
  return {
    diagnosticTool: {
      name: 'bootstrap.status',
      title: 'Estado de bootstrap',
      description: 'Expone el estado diagnostico del servidor MCP con todas las tools Trello activas.',
      outputSchema: bootstrapStatusOutputSchema,
      execute: async (): Promise<CallToolResult> => {
        const status = dependencies.getBootstrapStatus();

        return {
          content: [
            {
              type: 'text',
              text: formatBootstrapStatusText(status),
            },
          ],
          structuredContent: { ...status },
        };
      },
    },
    searchCardsTool: createSearchCardsTool(dependencies.searchCards),
    addCommentTool: createAddCommentTool(dependencies.addComment),
    listBoardsTool: createListBoardsTool(dependencies.listBoards),
    listColumnsTool: createListColumnsTool(dependencies.listColumns),
    createCardTool: createCreateCardTool(dependencies.createCard),
    moveCardTool: createMoveCardTool(dependencies.moveCard),
    deleteCardTool: createDeleteCardTool(dependencies.deleteCard),
    addLabelsTool: createAddLabelsTool(dependencies.addLabels),
    changeLabelColorTool: createChangeLabelColorTool(dependencies.changeLabelColor),
    listBoardLabelsTool: createListBoardLabelsTool(dependencies.listBoardLabels),
    resolveLabelTool: createResolveLabelTool(dependencies.resolveLabel),
    listLabelCardsTool: createListLabelCardsTool(dependencies.listLabelCards),
    searchCardsByLabelTool: createSearchCardsByLabelTool(dependencies.searchCardsByLabel),
    updateLabelTool: createUpdateLabelTool(dependencies.updateLabel),
    boardSummaryResource: createBoardSummaryResource(dependencies.boardSummary),
    boardOverdueResource: createBoardOverdueResource(dependencies.boardOverdue),
    boardByLabelResource: createBoardByLabelResource(dependencies.boardByLabel),
  };
};
