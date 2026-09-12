import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    target: 'es2019',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Stable vendor chunks: React/router change rarely, so returning visitors
        // keep them cached even when page code changes.
        manualChunks(id) {
          if (/[\\/]src[\\/]data[\\/]volumes[\\/]volume_\d+\.ts$/.test(id)) return 'volumes-data';
          if (!id.includes('node_modules')) return;
          if (/[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return 'vendor-react';
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (/[\\/](react-markdown|remark|rehype|micromark|mdast|hast|unified|unist|vfile|bail|trough|zwitch|property-information|space-separated-tokens|comma-separated-tokens|decode-named-character-reference|character-entities|devlop|estree|is-plain-obj|style-to-object|inline-style-parser|html-url-attributes|trim-lines|ccount|escape-string-regexp|markdown-table|longest-streak)/.test(id)) return 'vendor-markdown';
          if (id.includes('firebase')) return 'vendor-firebase';
          if (id.includes('@google/genai')) return 'vendor-genai';
        },
      },
    },
  },
});
