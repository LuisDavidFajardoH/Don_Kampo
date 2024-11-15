import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globIgnores: ['assets/index-DUDElYX9.js', 'images/33.png'],
      },
      manifest: {
        name: 'Don Kampo',
        short_name: 'DK',
        description: 'Bienvenido a Don Kampo',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'images/icon.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'images/icon.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  server: {
    https: false, // Si deseas habilitar HTTPS localmente también
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://don-kampo-api.onrender.com', // URL de tu backend con HTTPS
        changeOrigin: true, // Cambia el origen del host al backend
        secure: true, // Ahora la conexión con el backend usa HTTPS
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    outDir: 'dist',
    sourcemap: true,
  },
});
