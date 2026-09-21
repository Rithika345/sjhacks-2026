import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Two real HTML entry points: the app, and the print/export-as-PDF view.
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        print: resolve(import.meta.dirname, 'print.html'),
      },
    },
  },
})
