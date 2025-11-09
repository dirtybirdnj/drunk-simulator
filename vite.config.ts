import { defineConfig } from 'vite';

export default defineConfig({
  // Use relative paths for Electron compatibility, absolute for web
  base: process.env.ELECTRON === 'true' ? './' : '/drunk-simulator/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
