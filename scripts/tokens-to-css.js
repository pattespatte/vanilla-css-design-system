// scripts/tokens-to-css.js
const fs = require('fs');
const path = require('path');

function flattenObject(obj, prefix = '') {
	return Object.keys(obj).reduce((acc, key) => {
		const pre = prefix.length ? `${prefix}-` : '';
		if (typeof obj[key] === 'object' && obj[key] !== null) {
			Object.assign(acc, flattenObject(obj[key], `${pre}${key}`));
		} else {
			acc[`${pre}${key}`] = obj[key];
		}
		return acc;
	}, {});
}

function convertTokensToCSS(tokens) {
	const flatTokens = flattenObject(tokens);
	let css = ':root {\n';

	Object.entries(flatTokens).forEach(([key, value]) => {
		css += `  --${key}: ${value};\n`;
	});

	css += '}\n';
	return css;
}

function processTokenFile(filePath) {
	const content = fs.readFileSync(filePath, 'utf8');
	const tokens = JSON.parse(content);
	return convertTokensToCSS(tokens);
}

function tokensToCSS() {
	const tokensDir = path.join(__dirname, '../tokens');
	const variablesDir = path.join(__dirname, '../styles/variables');

	// Ensure variables directory exists
	if (!fs.existsSync(variablesDir)) {
		fs.mkdirSync(variablesDir, { recursive: true });
	}

	// Process each JSON file in the tokens directory
	fs.readdirSync(tokensDir).forEach(file => {
		if (path.extname(file) === '.json') {
			const baseName = path.basename(file, '.json');
			const tokenPath = path.join(tokensDir, file);
			const css = processTokenFile(tokenPath);

			// Write to CSS file
			fs.writeFileSync(
				path.join(variablesDir, `${baseName}.css`),
				css
			);
		}
	});

	console.log('Successfully converted tokens to CSS variables!');
}

// Run the conversion
tokensToCSS();