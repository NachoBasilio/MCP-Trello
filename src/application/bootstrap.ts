import type { Config } from '../config/index.js';

export interface BootstrapDiagnosticSnapshot {
  scope: 'bootstrap';
  transport: 'stdio';
  capabilityPolicy: 'diagnostic-only';
  toolName: 'bootstrap.status';
  trelloRuntimeAvailable: false;
  trelloCredentialsConfigured: boolean;
  defaultBoardConfigured: boolean;
}

export interface ApplicationDependencies {
  config: Config;
  getBootstrapStatus: () => BootstrapDiagnosticSnapshot;
}

/**
 * Crea el contenedor minimo de dependencias para el bootstrap inicial sin acoplarlo todavia al runtime de Trello.
 */
export const createApplicationDependencies = (config: Config): ApplicationDependencies => {
  return {
    config,
    getBootstrapStatus: () => ({
      scope: 'bootstrap',
      transport: 'stdio',
      capabilityPolicy: 'diagnostic-only',
      toolName: 'bootstrap.status',
      trelloRuntimeAvailable: false,
      trelloCredentialsConfigured: config.TRELLO_API_KEY.length > 0 && config.TRELLO_TOKEN.length > 0,
      defaultBoardConfigured: typeof config.TRELLO_DEFAULT_BOARD_ID === 'string' && config.TRELLO_DEFAULT_BOARD_ID.length > 0,
    }),
  };
};
