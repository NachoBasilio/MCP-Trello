import type { Config } from '../config/index.js';
import type { AddCommentUseCase } from './add-comment.js';
import type { AddLabelsUseCase } from './add-labels.js';
import type { ChangeLabelColorUseCase } from './change-label-color.js';
import type { BoardByLabelUseCase } from './board-by-label.js';
import type { BoardOverdueUseCase } from './board-overdue.js';
import type { BoardSummaryUseCase } from './board-summary.js';
import type { CreateCardUseCase } from './create-card.js';
import type { DeleteCardUseCase } from './delete-card.js';
import type { ListBoardsUseCase } from './list-boards.js';
import type { ListBoardLabelsUseCase } from './list-board-labels.js';
import type { ListLabelCardsUseCase } from './list-label-cards.js';
import type { ListColumnsUseCase } from './list-columns.js';
import type { MoveCardUseCase } from './move-card.js';
import type { SearchCardsUseCase } from './search-cards.js';
import type { SearchCardsByLabelUseCase } from './search-cards-by-label.js';
import type { ResolveLabelUseCase } from './resolve-label.js';
import type { UpdateLabelUseCase } from './update-label.js';

export interface BootstrapDiagnosticSnapshot {
  scope: 'bootstrap';
  transport: 'stdio';
  capabilityPolicy: 'diagnostic-plus-full-trello';
  toolNames: [
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
    'trello_update_label'
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
  listColumns: ListColumnsUseCase;
  createCard: CreateCardUseCase;
  moveCard: MoveCardUseCase;
  deleteCard: DeleteCardUseCase;
  addLabels: AddLabelsUseCase;
  changeLabelColor: ChangeLabelColorUseCase;
  boardSummary: BoardSummaryUseCase;
  boardOverdue: BoardOverdueUseCase;
  boardByLabel: BoardByLabelUseCase;
  listBoardLabels: ListBoardLabelsUseCase;
  resolveLabel: ResolveLabelUseCase;
  listLabelCards: ListLabelCardsUseCase;
  searchCardsByLabel: SearchCardsByLabelUseCase;
  updateLabel: UpdateLabelUseCase;
}

export interface ApplicationDependencies {
  config: Config;
  searchCards: SearchCardsUseCase;
  addComment: AddCommentUseCase;
  listBoards: ListBoardsUseCase;
  listColumns: ListColumnsUseCase;
  createCard: CreateCardUseCase;
  moveCard: MoveCardUseCase;
  deleteCard: DeleteCardUseCase;
  addLabels: AddLabelsUseCase;
  changeLabelColor: ChangeLabelColorUseCase;
  boardSummary: BoardSummaryUseCase;
  boardOverdue: BoardOverdueUseCase;
  boardByLabel: BoardByLabelUseCase;
  listBoardLabels: ListBoardLabelsUseCase;
  resolveLabel: ResolveLabelUseCase;
  listLabelCards: ListLabelCardsUseCase;
  searchCardsByLabel: SearchCardsByLabelUseCase;
  updateLabel: UpdateLabelUseCase;
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
    listColumns: runtime.listColumns,
    createCard: runtime.createCard,
    moveCard: runtime.moveCard,
    deleteCard: runtime.deleteCard,
    addLabels: runtime.addLabels,
    changeLabelColor: runtime.changeLabelColor,
    boardSummary: runtime.boardSummary,
    boardOverdue: runtime.boardOverdue,
    boardByLabel: runtime.boardByLabel,
    listBoardLabels: runtime.listBoardLabels,
    resolveLabel: runtime.resolveLabel,
    listLabelCards: runtime.listLabelCards,
    searchCardsByLabel: runtime.searchCardsByLabel,
    updateLabel: runtime.updateLabel,
    getBootstrapStatus: () => ({
      scope: 'bootstrap',
      transport: 'stdio',
      capabilityPolicy: 'diagnostic-plus-full-trello',
      toolNames: [
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
      ],
      trelloRuntimeAvailable: true,
      trelloWriteRuntimeAvailable: true,
      trelloCredentialsConfigured: config.TRELLO_API_KEY.length > 0 && config.TRELLO_TOKEN.length > 0,
      defaultBoardConfigured: typeof config.TRELLO_DEFAULT_BOARD_ID === 'string' && config.TRELLO_DEFAULT_BOARD_ID.length > 0,
    }),
  };
};
