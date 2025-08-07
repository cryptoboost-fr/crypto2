import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Optimiser React Fast Refresh
      fastRefresh: true,
      // Optimiser les imports
      babel: {
        plugins: [
          // Suppression automatique des console.log en production
          process.env.NODE_ENV === 'production' ? ['transform-remove-console'] : null,
        ].filter(Boolean),
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
    // Optimisations serveur dev
    hmr: {
      overlay: false,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: 'terser',
    // Optimisations du build
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Code splitting optimisé
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-avatar', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          charts: ['recharts'],
          animations: ['framer-motion'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
    // Seuil de warning pour les chunks
    chunkSizeWarningLimit: 1000,
  },
  // Optimisations générales
  esbuild: {
    // Suppression automatique des debugger
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  // Préchargement des modules
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'zustand',
      'framer-motion',
      'lucide-react',
    ],
  },
}) 