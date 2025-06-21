import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize build settings
    target: 'es2015', // Target modern browsers
    minify: 'esbuild', // Use esbuild for faster minification
    cssMinify: true, // Minify CSS
    reportCompressedSize: false, // Skip reporting compressed size for faster builds
    rollupOptions: {
      output: {
        // Chunk files by type for better caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          tanstack: ['@tanstack/react-query'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000, // Increase warning limit
  },
  optimizeDeps: {
    // Include dependencies that should be pre-bundled
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
  },
}));
