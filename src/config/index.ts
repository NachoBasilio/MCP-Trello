import 'dotenv/config';

import { z as zod } from 'zod';

import { DomainError, ErrorCode } from '../domain/index.js';

const environmentSchema = zod.object({
  TRELLO_API_KEY: zod.string().trim().min(1, 'TRELLO_API_KEY is required'),
  TRELLO_TOKEN: zod.string().trim().min(1, 'TRELLO_TOKEN is required'),
  TRELLO_DEFAULT_BOARD_ID: zod.string().trim().min(1, 'TRELLO_DEFAULT_BOARD_ID cannot be empty').optional(),
  TRELLO_API_BASE_URL: zod.string().trim().url('TRELLO_API_BASE_URL must be a valid URL').default('https://api.trello.com/1'),
});

export type Config = zod.infer<typeof environmentSchema>;

/**
 * Expone el schema de entorno para reutilizar la misma validacion en entrypoints y pruebas.
 */
export const configSchema = environmentSchema;

/**
 * Valida el entorno del proceso y devuelve una configuracion tipada lista para inyectar.
 */
export const loadConfig = (environment: NodeJS.ProcessEnv = process.env): Config => {
  const parsedEnvironment = environmentSchema.safeParse(environment);

  if (!parsedEnvironment.success) {
    const details = parsedEnvironment.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('; ');

    throw new DomainError(ErrorCode.Configuration, `Invalid environment configuration: ${details}`);
  }

  return parsedEnvironment.data;
};
