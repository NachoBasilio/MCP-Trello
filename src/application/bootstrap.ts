import type { Config } from '../config/index.js';
import type { AddCommentUseCase } from './add-comment.js';
import type { ListBoardsUseCase } from './list-boards.js';
import type { SearchCardsUseCase } from './search-cards.js';

export interface BootstrapDiagnosticSnapshot {
  scope: 'bootstrap';
  transport: 'stdio';
  capabilityPolicy: 'diagnostic-plus-search-and-comment';
  toolNames: ['bootstrap.status', 'trello_search_cards', 'trello_add_comment', 'trello_list_boards'];
  trelloRuntimeAvailable: true;
  trelloWriteRuntimeAvailable: true;
  trelloCredentialsConfigured: boolean;
  defaultBoardConfigured: boolean;
}

export interface ApplicationRuntime {
  searchCards: SearchCardsUseCase;
  addComment: AddCommentUseCase;
  listBoards: ListBoardsUseCase;
}

export interface ApplicationDependencies {
  config: Config;
  searchCards: SearchCardsUseCase;
  addComment: AddCommentUseCase;
  listBoards: ListBoardsUseCase;
  getBootstrapStatus: () => BootstrapDiagnosticSnapshot;
}

/**
 * Crea el contenedor de dependencias del bootstrap manteniendo separado el diagnostico del slice read-only realmente disponible.
 */
export const createApplicationDependencies = (config: Config, runtime: ApplicationRuntime): ApplicationDependencies => {
  return {
    config,
    searchCards: runtime.searchCards,
    addComment: runtime.addComment,
    listBoards: runtime.listBoards,
    getBootstrapStatus: () => ({
      scope: 'bootstrap',
      transport: 'stdio',
      capabilityPolicy: 'diagnostic-plus-search-and-comment',
      toolNames: ['bootstrap.status', 'trello_search_cards', 'trello_add_comment', 'trello_list_boards'],
      trelloRuntimeAvailable: true,
      trelloWriteRuntimeAvailable: true,
      trelloCredentialsConfigured: config.TRELLO_API_KEY.length > 0 && config.TRELLO_TOKEN.length > 0,
      defaultBoardConfigured: typeof config.TRELLO_DEFAULT_BOARD_ID === 'string' && config.TRELLO_DEFAULT_BOARD_ID.length > 0,
    }),
  };
};
