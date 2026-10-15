import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  // Chemins relatifs : le build fonctionne aussi dans un sous-dossier (GitHub Pages, etc.)
  base: './',
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        jeu: resolve(import.meta.dirname, 'index.html'),
        banc: resolve(import.meta.dirname, 'banc.html'),
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
