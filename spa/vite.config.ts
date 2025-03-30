import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import symfonyPlugin from 'vite-plugin-symfony'
import * as path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      // This is needed, or else Vite will try to find image paths (which it wont be able to find because this will be called on the web, not directly)
      // For example <img src="/images/logo.png"> will not work without the code below
      template: {
        transformAssetUrls: {
          includeAbsolute: false,
        },
      },
    }),
    symfonyPlugin()
  ],
  build: {
    // generate .vite/manifest.json in outDir
    manifest: true,
    // outDir: '../assets',
    outDir: './public/build',
    rollupOptions: {
      input: {
        /* relative to the root option */
        app: './src/app.ts',

        /* you can also provide [s]css files */
        theme: './sass/main_global.scss'
      },
    },
  },
  server: {
    host: true,
    port: 8000,
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      _: path.resolve(__dirname, "src")
    },
  },
})
