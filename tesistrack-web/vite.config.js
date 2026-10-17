import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // El backend solo acepta CORS desde el 5173. Con `strictPort`, si el puerto
    // está ocupado Vite falla en vez de saltar a otro y romper el login en silencio.
    port: 5173,
    strictPort: true,
    // En desarrollo el navegador le habla solo a Vite (mismo origen) y Vite reenvía
    // /api al backend: es lo mismo que hace nginx en Docker, así que desarrollo y
    // contenedores se comportan igual y no hay CORS de por medio.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
