const RETRY_DELAYS_MS = [1000, 2000, 4000];

export interface FetchRetryOptions {
  delays?: number[];
}

const isRetryableStatus = (status: number): boolean => {
  if (status === 429) {
    return true;
  }

  return status >= 500 && status < 600;
};

const isRetryableError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  const normalizedName = error.name?.toLowerCase() ?? '';
  const retryableNames = ['typeerror', 'fetcherror', 'aborterror', 'networkerror'];
  return retryableNames.includes(normalizedName);
};

const wait = (delayMs: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
};

/**
 * Envuelve una implementacion de fetch aplicando backoff exponencial para errores recuperables.
 *
 * @param fetchImpl - Implementacion base de fetch (real o mockeada en tests).
 * @returns Implementacion decorada con reintentos 1s/2s/4s ante 429 o fallos de red.
 */
type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Parameters<typeof fetch>[1];

export const createFetchWithRetry = (
  fetchImpl: typeof fetch,
  options?: FetchRetryOptions
): typeof fetch => {
  const schedule = options?.delays ?? RETRY_DELAYS_MS;

  return async (input: FetchInput, init?: FetchInit): Promise<Response> => {
    let attempt = 0;

    while (attempt < schedule.length + 1) {
      try {
        const response = await fetchImpl(input, init);

        if (isRetryableStatus(response.status) && attempt < schedule.length) {
          await wait(schedule[attempt]);
          attempt += 1;
          continue;
        }

        return response;
      } catch (error) {
        if (!isRetryableError(error) || attempt >= schedule.length) {
          throw error;
        }

        await wait(schedule[attempt]);
        attempt += 1;
      }
    }

    throw new Error('Max retries exceeded');
  };
};

export const RETRY_SCHEDULE_MS = [...RETRY_DELAYS_MS];
