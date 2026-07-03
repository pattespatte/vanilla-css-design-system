const fs = require('fs');
const path = require('path');
const { PurgeCSS } = require('purgecss');

const PROJECT_ROOT = path.join(__dirname, '..');
const inputFile = path.join(PROJECT_ROOT, 'styles/vanilla-combined.css');
const outputFile = path.join(PROJECT_ROOT, 'styles/vanilla-combined.purged.css');

async function purgeCSS() {
  try {
    const result = await new PurgeCSS().purge({
      content: [path.join(PROJECT_ROOT, 'examples/**/*.html')],
      css: [inputFile],
      safelist: {
        standard: [/\.is-/, /\.has-/, /\.js-/, /helix/, /\[data-theme="helix"\]/],
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
