const fs = require('fs');
const { transform } = require('lightningcss');

// File paths
const inputFile = 'styles/vanilla-combined.purged.css';
const outputFile = 'styles/vanilla-combined.min.css';

// Read the purged CSS
const inputCSS = fs.readFileSync(inputFile);

// Transform (minify) using Lightning CSS
const { code } = transform({
	filename: inputFile,
	code: inputCSS,
	minify: true
});

// Write the minified CSS to file
fs.writeFileSync(outputFile, code);
console.log('CSS minified with Lightning CSS successfully!');