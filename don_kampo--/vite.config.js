import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Actualización automática del SW
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'], // Archivos a precachear
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // Límite de tamaño 5 MB
        globIgnores: ['assets/index-DUDElYX9.js', 'images/33.png'], // Archivos grandes excluidos
      },
      manifest: {
        name: 'Don Kampo', // Nombre completo de la app
        short_name: 'DK', // Nombre corto para pantallas pequeñas
        description: 'Bienvenido a Don Kampo', // Descripción breve
        theme_color: '#ffffff', // Color de tema de la aplicación
        icons: [
          {
            src: 'images/icon.png', // Ícono de 192x192
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'images/icon.png', // Ícono de 512x512
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  server: {
    https: false, // Servidor sin HTTPS para evitar conflictos
    host: '0.0.0.0', // Permite acceso desde otros dispositivos en la red
    port: 3000, // Puerto del servidor
    proxy: {
      '/api': {
        target: 'https://don-kampo-api.onrender.com', // Redirige las solicitudes al backend
        changeOrigin: true, // Cambia el origen del host al backend
        secure: false, // Permite conexiones no seguras al backend
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1500, // Aumenta el límite de advertencia de tamaño de chunk
    outDir: 'dist', // Asegura que la salida esté en la carpeta dist
    sourcemap: true, // Incluye mapas de fuente para depuración en producción
  },
});
