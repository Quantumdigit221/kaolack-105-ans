import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Plugin pour gérer les requêtes PWA qui n'existent pas
const pwaPlugin = () => {
  const virtualModuleId = '/@vite-plugin-pwa/pwa-entry-point-loaded';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;
  
  return {
    name: 'pwa-entry-point-handler',
    resolveId(id) {
      if (id === virtualModuleId || id.includes('@vite-plugin-pwa/pwa-entry-point-loaded')) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        // Exporte un module vide par défaut
        return 'export default {};';
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.includes('@vite-plugin-pwa/pwa-entry-point-loaded')) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/javascript');
          res.end('export default {};');
          return;
        }
        next();
      });
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    pwaPlugin(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Configuration pour PWA
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  }
}));
