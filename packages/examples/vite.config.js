import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@pc-react': path.resolve(__dirname, '../lib/src'),
      '@pc-react/*': path.resolve(__dirname, '../lib/src/*')
    }
  }
})
