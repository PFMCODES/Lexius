import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',          // project root
  publicDir: 'public',
  server: {
    port: 5173
  }
});