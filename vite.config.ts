import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// base must match the GitHub Pages repo name. Use '/' for a custom domain.
export default defineConfig({
  base: '/momo/',
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(dirname, './src') } },
})
