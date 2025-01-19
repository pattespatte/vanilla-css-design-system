const fs = require('fs');

// File paths
const filePath = 'styles/vanilla-combined.min.css';

// Read the minified CSS file
let css = fs.readFileSync(filePath, 'utf8');

// Merge `:root` declarations
css = css.replace(/}:root{/g, ';');

// Write the updated CSS back to the file
fs.writeFileSync(filePath, css, 'utf8');