import { defineConfig } from 'vite'
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [

  ],
  build: {
    // generate .vite/manifest.json in outDir
    manifest: false,
    // outDir: '../assets',
    outDir: './public/build',
    rollupOptions: {
      input: {
        /* relative to the root option */
        player: './src/mini_player.js',
      },
    },
  },
  resolve: {
    alias: {
      // @ts-ignore
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
