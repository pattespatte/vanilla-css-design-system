/**
 * build-theme.js — concat + minify a single theme's tokens + rules into a
 * self-contained, distributable <theme>.min.css.
 *
 * Usage: `node scripts/build-theme.js <theme-name>`
 * Output: `styles/themes/<theme-name>.min.css`
 *
 * The output is drop-in: load it alongside the base components bundle and
 * set <html data-theme="<theme-name>"> and the theme activates. Tokens are
 * defined on :root (always available) and the alias mapping lives under
 * [data-theme="<theme-name>"]. Not purged — themes are intentionally small
 * and self-contained, every selector is needed.
 */
const fs = require('fs');
const path = require('path');
const { transform } = require('lightningcss');

const themeName = process.argv[2];

if (!themeName) {
  console.error('Usage: node scripts/build-theme.js <theme-name>');
  console.error('Example: node scripts/build-theme.js helix');
  process.exit(1);
}

const PROJECT_ROOT = path.join(__dirname, '..');
const themeDir = path.join(PROJECT_ROOT, 'styles', 'themes', themeName);
const tokensFile = path.join(themeDir, 'tokens.css');
const themeFile = path.join(themeDir, 'theme.css');
const outputFile = path.join(PROJECT_ROOT, 'styles', 'themes', `${themeName}.min.css`);

if (!fs.existsSync(tokensFile) || !fs.existsSync(themeFile)) {
  console.error(`Theme "${themeName}" not found.`);
  console.error(`Expected: ${tokensFile} and ${themeFile}`);
  process.exit(1);
}

// Concat tokens + rules. tokens first so the [data-theme] alias mapping in
// theme.css can reference them.
const combined = [
  fs.readFileSync(tokensFile, 'utf8'),
  fs.readFileSync(themeFile, 'utf8'),
].join('\n\n');

// Minify with Lightning CSS (same tool as the main bundle).
const { code } = transform({
  filename: outputFile,
  code: Buffer.from(combined, 'utf8'),
  minify: true,
});

fs.writeFileSync(outputFile, code);
console.log(`Theme "${themeName}" built → ${path.relative(PROJECT_ROOT, outputFile)}`);
