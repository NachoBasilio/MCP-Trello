import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    globals: false,
  },
  resolve: {
    alias: {
      '@domain': path.resolve('./src/domain'),
      '@entities': path.resolve('./src/domain/entities'),
      '@value-objects': path.resolve('./src/domain/value-objects'),
      '@errors': path.resolve('./src/domain/errors'),
      '@shared': path.resolve('./src/shared'),
    },
  },
});
