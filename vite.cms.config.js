import { defineConfig } from 'vite';

export default defineConfig({
  root: './cms-admin',
  publicDir: '../public',
  server: {
    port: 3001,
    open: true
  }
});
