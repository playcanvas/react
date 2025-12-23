import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@playcanvas/react': path.resolve(__dirname, '../packages/lib/src'),
      '@': path.resolve(__dirname, 'src'),
    }
  },
  server: {
    port: 3000,
    open: true
  }
})

