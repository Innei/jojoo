import tsPath from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['src/__tests__/**/*.(spec|test).tsx'],
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
  plugins: [tsPath()],
  optimizeDeps: {
    needsInterop: ['react'],
  },
})
