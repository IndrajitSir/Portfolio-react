import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          // framer-motion is the only animation library the app actually imports;
          // gsap is a leftover dependency and is not referenced anywhere, so it is
          // intentionally absent from this split (a chunk for an unimported module
          // would only ever be empty).
          'motion-vendor': ['framer-motion'],
        },
      },
    },
  },
})
