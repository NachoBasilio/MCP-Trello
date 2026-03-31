import { describe, expect, it, vi } from 'vitest';

import { createFetchWithRetry } from '../../../../src/infrastructure/trello/retry.js';

/**
 * Protege el helper de reintentos exponenciales ante respuestas 429 y errores de red.
 */
describe('createFetchWithRetry', () => {
  it('debe reintentar respuestas 429 segun la escala configurada', async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('rate-1', { status: 429 }))
      .mockResolvedValueOnce(new Response('rate-2', { status: 429 }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));
    const fetchWithRetry = createFetchWithRetry(fetchMock as typeof fetch, {
      delays: [10, 20, 40],
    });

    const responsePromise = fetchWithRetry('https://api.trello.com/1/test');

    await vi.advanceTimersByTimeAsync(10);
    await vi.advanceTimersByTimeAsync(20);
    await vi.advanceTimersByTimeAsync(40);

    const response = await responsePromise;

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(response.status).toBe(200);
    vi.useRealTimers();
  });

  it('debe propagar la ultima respuesta 429 cuando se agotan los intentos', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue(new Response('rate', { status: 429 }));
    const fetchWithRetry = createFetchWithRetry(fetchMock as typeof fetch, {
      delays: [5, 5, 5],
    });

    const responsePromise = fetchWithRetry('https://api.trello.com/1/test');

    await vi.runAllTimersAsync();
    const response = await responsePromise;

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(response.status).toBe(429);
    vi.useRealTimers();
  });

  it('debe reintentar errores de red lanzados por fetch antes de fallar', async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Network error'))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));
    const fetchWithRetry = createFetchWithRetry(fetchMock as typeof fetch, {
      delays: [15],
    });

    const responsePromise = fetchWithRetry('https://api.trello.com/1/test');

    await vi.advanceTimersByTimeAsync(15);
    const response = await responsePromise;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(200);
    vi.useRealTimers();
  });
});
