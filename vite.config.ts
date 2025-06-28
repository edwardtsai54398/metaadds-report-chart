import path from 'path'
import tailwindcss from '@tailwindcss/vite' /*add from shad-cn guide*/
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/metaads-report-chart-generator' : '/',
  plugins: [
    react(), 
    tailwindcss(), 
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
