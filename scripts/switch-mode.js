const fs = require('fs');
const path = require('path');

const EXAMPLES_DIR = path.join(__dirname, '../examples');

// Source CSS filenames for each mode. switchMode rewrites every example's
// stylesheet <link> href between these, matching the href suffix so links with
// extra attributes (media=, integrity=, self-closing />) are still caught.
const MODE_TARGETS = {
  dev: { from: '/styles/vanilla-combined.min.css', to: '/styles/main.css' },
  prod: { from: '/styles/main.css', to: '/styles/vanilla-combined.min.css' },
};

// Recursively get all HTML files in a directory
function getAllHtmlFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllHtmlFiles(fullPath, arrayOfFiles);
    } else if (path.extname(file) === '.html') {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// Switch between dev and prod modes
function switchMode(mode) {
  const target = MODE_TARGETS[mode];
  const htmlFiles = getAllHtmlFiles(EXAMPLES_DIR);
  let changedCount = 0;

  htmlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Match the href followed by any quote/self-close whitespace so the rewrite
    // works regardless of trailing attributes or `/>`.
    const re = new RegExp(`${target.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`, 'g');
    if (re.test(content)) {
      const updated = content.replace(re, `${target.to}$1`);
      fs.writeFileSync(file, updated);
      changedCount++;
    }
  });

  if (changedCount === 0) {
    console.warn(`⚠️  No example files referenced ${target.from}; already in ${mode} mode?`);
  }
  console.log(`Switched ${changedCount}/${htmlFiles.length} file(s) to ${mode} mode`);
}

// Get mode from command line argument
const mode = process.argv[2];
if (mode !== 'dev' && mode !== 'prod') {
  console.error('Please specify mode: dev or prod');
  process.exit(1);
}

switchMode(mode);
