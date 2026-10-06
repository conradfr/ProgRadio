import { defineConfig, type Plugin } from 'vite'
import { fileURLToPath, URL } from "node:url";
import { readFileSync, writeFileSync } from "node:fs";

const PLAYER_TEMPLATE = fileURLToPath(new URL('../templates/_partials/mini_player.html.twig', import.meta.url));
const VERBATIM_START = '{% verbatim %}';
const VERBATIM_END = '{% endverbatim %}';

// inline the built player in the twig partial, between the verbatim tags
const inlinePlayerInTemplate = (): Plugin => ({
  name: 'inline-player-in-template',
  writeBundle(_options, bundle) {
    const chunk = Object.values(bundle).find(file => file.type === 'chunk' && file.isEntry);
    if (!chunk || chunk.type !== 'chunk') {
      this.error('Player entry chunk not found');
    }

    const template = readFileSync(PLAYER_TEMPLATE, 'utf8');
    const start = template.indexOf(VERBATIM_START);
    const end = template.lastIndexOf(VERBATIM_END);
    if (start === -1 || end === -1 || end < start) {
      this.error(`Verbatim tags not found in ${PLAYER_TEMPLATE}`);
    }
    if (chunk.code.includes(VERBATIM_END)) {
      this.error('Player build contains a twig endverbatim tag');
    }

    writeFileSync(
      PLAYER_TEMPLATE,
      template.slice(0, start + VERBATIM_START.length) + chunk.code.trimEnd() + '\n' + template.slice(end)
    );
    this.info(`${chunk.fileName} inlined in ${PLAYER_TEMPLATE}`);
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    inlinePlayerInTemplate(),
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
