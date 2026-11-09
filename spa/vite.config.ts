import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import symfonyPlugin from 'vite-plugin-symfony'
import * as path from "node:path";

// Bootstrap Icons subset (scripts/icons-subset.mjs): generated at dev server start and at build (not committed).
// It scans ../templates and ../src, the docker build copies them next to /spa
const iconsSubset: Plugin = {
  name: 'icons-subset',
  async buildStart() {
    const { sourcesAvailable, generate } = await import('./scripts/icons-subset.mjs');

    if (!sourcesAvailable()) {
      this.error('../templates not found: the bootstrap icons subset can\'t be generated (see tools/docker/www/Dockerfile)');
    }

    await generate({ log: message => this.info(message) });
  },
};

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
    symfonyPlugin(),
    iconsSubset,
  ],
  define: {
    // vue-i18n features not used by the app, removed from the bundle
    // (composition api only, no <i18n-t> component or v-t directive)
    __VUE_I18N_FULL_INSTALL__: 'false',
    __VUE_I18N_LEGACY_API__: 'false',
    __INTLIFY_PROD_DEVTOOLS__: 'false',
  },
  build: {
    // generate .vite/manifest.json in outDir
    manifest: true,
    // outDir: '../assets',
    outDir: './public/build',
    rollupOptions: {
      input: {
        /* relative to the root option */
        app: './src/app.ts',

        /* petite-vue mini player of the twig pages (_partials/mini_player.html.twig) */
        player: './src/mini_player.ts',

        /* you can also provide [s]css files */
        theme: './sass/main_global.scss'
      },
    },
  },
  server: {
    host: true,
    port: 8000,
    // host: true makes the resolved origin http://[::]:8000, which the browser can't load css url() assets from
    origin: 'http://localhost:8000',
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      { find: '_', replacement: path.resolve(__dirname, "src") },
      // a CommonJS dependency doing require('vue') would get the full build with the template compiler (~85 kB),
      // the single file components only need the runtime
      { find: /^vue$/, replacement: 'vue/dist/vue.runtime.esm-bundler.js' },
    ],
  },
})
