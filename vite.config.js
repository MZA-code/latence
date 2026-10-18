import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  // Le site vit à la racine de https://latence-game.com : chemins absolus, pour que la page 404
  // trouve ses feuilles de style quelle que soit l'adresse demandée.
  base: '/',
  build: {
    target: 'es2020',
    // Aucune police incrustée en data: : la politique de sécurité du site (public/.htaccess) n'admet que 'self'
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        // Le banc d'essai (banc.html) reste un outil de développement : npm run dev le sert, il n'est pas mis en ligne.
        jeu: resolve(import.meta.dirname, 'index.html'),
        mentions: resolve(import.meta.dirname, 'mentions-legales.html'),
        introuvable: resolve(import.meta.dirname, '404.html'),
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
