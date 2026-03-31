import type { Config } from '../config/index.js';
import type { AddCommentUseCase } from './add-comment.js';
import type { AddLabelsUseCase } from './add-labels.js';
import type { BoardByLabelUseCase } from './board-by-label.js';
import type { BoardOverdueUseCase } from './board-overdue.js';
import type { BoardSummaryUseCase } from './board-summary.js';
import type { CreateCardUseCase } from './create-card.js';
import type { ListBoardsUseCase } from './list-boards.js';
import type { MoveCardUseCase } from './move-card.js';
import type { SearchCardsUseCase } from './search-cards.js';

export interface BootstrapDiagnosticSnapshot {
  scope: 'bootstrap';
  transport: 'stdio';
  capabilityPolicy: 'diagnostic-plus-full-trello';
  toolNames: [
    'bootstrap.status',
    'trello_search_cards',
    'trello_add_comment',
    'trello_list_boards',
    'trello_create_card',
    'trello_move_card',
    'trello_add_labels'
  ];
  trelloRuntimeAvailable: true;
  trelloWriteRuntimeAvailable: true;
  trelloCredentialsConfigured: boolean;
  defaultBoardConfigured: boolean;
}

export interface ApplicationRuntime {
  searchCards: SearchCardsUseCase;
  addComment: AddCommentUseCase;
  listBoards: ListBoardsUseCase;
  createCard: CreateCardUseCase;
  moveCard: MoveCardUseCase;
  addLabels: AddLabelsUseCase;
  boardSummary: BoardSummaryUseCase;
  boardOverdue: BoardOverdueUseCase;
  boardByLabel: BoardByLabelUseCase;
}

export interface ApplicationDependencies {
  config: Config;
  searchCards: SearchCardsUseCase;
  addComment: AddCommentUseCase;
  listBoards: ListBoardsUseCase;
  createCard: CreateCardUseCase;
  moveCard: MoveCardUseCase;
  addLabels: AddLabelsUseCase;
  boardSummary: BoardSummaryUseCase;
  boardOverdue: BoardOverdueUseCase;
  boardByLabel: BoardByLabelUseCase;
  getBootstrapStatus: () => BootstrapDiagnosticSnapshot;
}

/**
 * Crea el contenedor de dependencias con todas las tools Trello activas.
 */
export const createApplicationDependencies = (config: Config, runtime: ApplicationRuntime): ApplicationDependencies => {
  return {
    config,
    searchCards: runtime.searchCards,
    addComment: runtime.addComment,
    listBoards: runtime.listBoards,
    createCard: runtime.createCard,
    moveCard: runtime.moveCard,
    addLabels: runtime.addLabels,
    boardSummary: runtime.boardSummary,
    boardOverdue: runtime.boardOverdue,
    boardByLabel: runtime.boardByLabel,
    getBootstrapStatus: () => ({
      scope: 'bootstrap',
      transport: 'stdio',
      capabilityPolicy: 'diagnostic-plus-full-trello',
      toolNames: [
        'bootstrap.status',
        'trello_search_cards',
        'trello_add_comment',
        'trello_list_boards',
        'trello_create_card',
        'trello_move_card',
        'trello_add_labels',
      ],
      trelloRuntimeAvailable: true,
      trelloWriteRuntimeAvailable: true,
      trelloCredentialsConfigured: config.TRELLO_API_KEY.length > 0 && config.TRELLO_TOKEN.length > 0,
      defaultBoardConfigured: typeof config.TRELLO_DEFAULT_BOARD_ID === 'string' && config.TRELLO_DEFAULT_BOARD_ID.length > 0,
    }),
  };
};
