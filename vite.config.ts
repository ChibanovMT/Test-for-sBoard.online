import { defineConfig } from 'vite';

// GitHub Pages: https://chibanovmt.github.io/Test-for-sBoard.online/
const repoBase = '/Test-for-sBoard.online/';

export default defineConfig(({ mode }) => ({
  // Локально — корень; production-сборка — подпапка репозитория на GitHub Pages
  base: mode === 'development' ? '/' : repoBase,
  server: {
    port: 3000,
    open: true,
  },
  assetsInclude: ['**/*.wasm'],
}));
