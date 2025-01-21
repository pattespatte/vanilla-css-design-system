const fs = require('fs');
const { PurgeCSS } = require('purgecss');

const inputFile = 'styles/vanilla-combined.css';
const outputFile = 'styles/vanilla-combined.purged.css';

async function purgeCSS() {
  try {
    const result = await new PurgeCSS().purge({
      content: ['./examples/**/*.html'],
      css: [inputFile],
      safelist: {
        standard: [/\.is-/, /\.has-/, /\.js-/],
        deep: [/:hover/, /:focus/, /:active/],
        greedy: [/\.modal/, /\.tooltip/],
        keyframes: true,
      }
    });

    fs.writeFileSync(outputFile, result[0].css);
    console.log('CSS purged successfully!');
  } catch (error) {
    console.error('Error purging CSS:', error);
  }
}

purgeCSS();