import tsPath from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['__tests__/**/*.(spec|test).tsx'],
    environment: 'jsdom',
    setupFiles: './__tests__/setup.ts',
  },
  plugins: [tsPath()],
  optimizeDeps: {
    needsInterop: ['react'],
  },
})
