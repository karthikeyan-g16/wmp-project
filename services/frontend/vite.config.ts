import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api/v1/auth': 'http://localhost:8081',
      '/api/v1/users': 'http://localhost:8080',
      '/api/v1/portfolios': 'http://localhost:8080',
      '/api/v1/holdings': 'http://localhost:8080',
      '/api/v1/market-data': 'http://localhost:8000',
      '/api/v1/valuations': 'http://localhost:8000',
      '/api/v1/analytics': 'http://localhost:8000',
    },
  },
});
