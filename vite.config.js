import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative base so the built site works whether it's served from
  // username.github.io (root) or username.github.io/repo (subpath).
  base: './',
  plugins: [react()],
})
