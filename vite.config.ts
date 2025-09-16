import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    // Incluir reflect-metadata en la optimización de dependencias
    include: ['inversify']
  },
  build: {
    // Usar el compilador de TypeScript para el build
    target: 'esnext',
    
  },
  define: {
    // Asegurar que los decoradores funcionen
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})
