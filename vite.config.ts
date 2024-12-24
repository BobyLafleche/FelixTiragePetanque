import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    // Cette option vide le dossier de build avant de remplir avec la nouvelle build
    emptyOutDir: true,
    outDir: 'dist',  // Assurez-vous que le dossier de build est bien spécifié
    cache: false,  // Désactive le cache
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['petanque.svg'],
      manifest: {
        name: 'Tirage Équipes',
        short_name: 'Tirage',
        description: 'Application de tirage au sort d\'équipes de pétanque',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: false, // désactiver le service worker
      },
    })
  ]
});
