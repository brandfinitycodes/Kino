import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  css: { lightningcss: { errorRecovery: true } },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      'es-toolkit/compat/get': path.resolve(__dirname, 'src/shims/get.js'),
      'es-toolkit/compat/isPlainObject': path.resolve(__dirname, 'src/shims/isPlainObject.js'),
      'es-toolkit/compat/last': path.resolve(__dirname, 'src/shims/last.js'),
      'es-toolkit/compat/maxBy': path.resolve(__dirname, 'src/shims/maxBy.js'),
      'es-toolkit/compat/minBy': path.resolve(__dirname, 'src/shims/minBy.js'),
      'es-toolkit/compat/omit': path.resolve(__dirname, 'src/shims/omit.js'),
      'es-toolkit/compat/range': path.resolve(__dirname, 'src/shims/range.js'),
      'es-toolkit/compat/sortBy': path.resolve(__dirname, 'src/shims/sortBy.js'),
      'es-toolkit/compat/sumBy': path.resolve(__dirname, 'src/shims/sumBy.js'),
      'es-toolkit/compat/throttle': path.resolve(__dirname, 'src/shims/throttle.js'),
      'es-toolkit/compat/uniqBy': path.resolve(__dirname, 'src/shims/uniqBy.js'),
    }
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'vendor';
          }
          if (id.includes('node_modules/recharts/')) {
            return 'charts';
          }
          if (id.includes('node_modules/framer-motion/')) {
            return 'motion';
          }
          if (id.includes('node_modules/@tanstack/react-query/')) {
            return 'query';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'icons';
          }
        }
      }
    }
  }
})
