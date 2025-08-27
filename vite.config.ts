import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Use port 3000 instead of default 5173
  },
  resolve: {
    alias: {
      "@": "/src",
      "@/components": "/src/components",
      "@/api": "/src/api",
      "@/types": "/src/types",
      "@/utils": "/src/utils",
      "@/hooks": "/src/hooks",
      "@/context": "/src/context",
      "@/config": "/src/config",
      "@/constants": "/src/constants",
      "@/services": "/src/services",
      "@/lib": "/src/lib",
      "@/pages": "/src/pages",
      "@/assets": "/src/assets",
    },
  },
});
