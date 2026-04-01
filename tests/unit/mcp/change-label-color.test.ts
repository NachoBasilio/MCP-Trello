import { describe, expect, it } from 'vitest';

import { changeLabelColorInputSchema } from '../../../src/mcp/tools/change-label-color.js';

/**
 * Protege validaciones del contrato MCP para cambio de color de labels.
 */
describe('Tool change-label-color', () => {
  /**
   * Verifica que por labelName exija contexto de board para evitar ambiguedad.
   */
  it('debe requerir boardId o boardName cuando se usa labelName sin labelId', () => {
    const result = changeLabelColorInputSchema.safeParse({
      labelName: 'Backend',
      color: 'red',
    });

    expect(result.success).toBe(false);
  });

  /**
   * Verifica que por labelId no requiera contexto de board.
   */
  it('debe permitir labelId sin boardId ni boardName', () => {
    const result = changeLabelColorInputSchema.safeParse({
      labelId: 'label-1',
      color: 'green',
    });

    expect(result.success).toBe(true);
  });
});
