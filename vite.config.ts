import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    'import.meta.env.REACT_APP_RAZORPAY_KEY_ID': JSON.stringify(process.env.REACT_APP_RAZORPAY_KEY_ID)
  },
  resolve: {
    alias: {
      'date-fns': resolve(__dirname, 'node_modules/date-fns')
    }
  },
  optimizeDeps: {
    include: ['date-fns']
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    watch: {
      usePolling: true
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    },
    cors: true
  }
});
