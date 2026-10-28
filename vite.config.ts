import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'non-blocking-built-css',
      apply: 'build',
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          return html
            .replace(
              /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
              (_match, href: string) =>
                `<link rel="preload" as="style" crossorigin href="${href}" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" crossorigin href="${href}"></noscript>`,
            )
            .replace(
              '</head>',
              '<style>html,body,#root{min-height:100%;margin:0}html,body{background:#08090d;color:#e8eaf0}body{font-family:system-ui,sans-serif}</style></head>',
            )
        },
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
})
