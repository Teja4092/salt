import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This is crucial for Docker - allows external connections
    port: 5173, // Default Vite port
    watch: {
      usePolling: true, // Needed for file changes in Docker
    },
  },
  preview: {
    host: true,
    port: 5173,
  }
})
