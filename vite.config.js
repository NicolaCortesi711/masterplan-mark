import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Prefix all built asset URLs and links with /masterplan/
  base: '/masterplan/',
  server: {
    allowedHosts: ['elementary-nonunified-charline.ngrok-free.dev'],
  },
})
