const fs = require('fs');
const path = require('path');
const { PurgeCSS } = require('purgecss');

const PROJECT_ROOT = path.join(__dirname, '..');
const inputFile = path.join(PROJECT_ROOT, 'styles/vanilla-combined.css');
const outputFile = path.join(PROJECT_ROOT, 'styles/vanilla-combined.purged.css');

async function purgeCSS() {
  try {
    const result = await new PurgeCSS().purge({
      // Scan both HTML and the example JS: header.js injects DOM at runtime
      // (brand link, page-title h1, sr-only h1 on home, nav-toggle), and any
      // class applied only from JS would otherwise be stripped from the
      // published bundle.
      content: [
        path.join(PROJECT_ROOT, 'examples/**/*.html'),
        path.join(PROJECT_ROOT, 'examples/**/*.js'),
      ],
      css: [inputFile],
      safelist: {
        // sr-only + text-size-* are applied to runtime-injected DOM and must
        // survive the purge even if a future refactor moves them out of the
        // scanned JS files.
        standard: [/\.is-/, /\.has-/, /\.js-/, /helix/, /\[data-theme="helix"\]/, /\.sr-only$/, /\.text-size-/],
        deep: [/:hover/, /:focus/, /:active/],
        greedy: [/\.modal/, /\.tooltip/],
        keyframes: true,
      }
    });

    if (!result.length) {
      throw new Error('PurgeCSS returned no output documents');
    }

    fs.writeFileSync(outputFile, result[0].css);
    console.log('CSS purged successfully!');
  } catch (error) {
    console.error('Error purging CSS:', error);
    process.exit(1);
  }
}

purgeCSS();
