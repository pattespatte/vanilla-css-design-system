const fs = require('fs');
const path = require('path');

// Helper function to format shadow objects to CSS-compatible strings
function formatShadowValue(value) {
	if (Array.isArray(value)) {
		// Handle arrays of shadow values
		return value
			.map(
				v =>
					`${v.x} ${v.y} ${v.blur} ${v.spread} ${v.color}`
			)
			.join(', '); // If multiple shadows, separate them with commas
	}
	return value; // Return the value directly if it's not an array
}

// Helper function to flatten token objects
function flattenObject(obj, prefix = '') {
	return Object.keys(obj).reduce((acc, key) => {
		const pre = prefix.length ? `${prefix}-` : '';
		if (typeof obj[key] === 'object' && obj[key] !== null) {
			if ('$value' in obj[key]) {
				// Handle special cases for shadow values
				if (typeof obj[key]['$value'] === 'object') {
					acc[`${pre}${key}`] = formatShadowValue(obj[key]['$value']);
				} else {
					// For normal values
					acc[`${pre}${key}`] = obj[key]['$value'];
				}
			} else {
				// Continue flattening nested objects
				Object.assign(acc, flattenObject(obj[key], `${pre}${key}`));
			}
		} else {
			acc[`${pre}${key}`] = obj[key];
		}
		return acc;
	}, {});
}

// Function to convert tokens to CSS variables
function convertTokensToCSS(tokens) {
	const flatTokens = flattenObject(tokens);
	let css = ':root {\n';

	Object.entries(flatTokens).forEach(([key, value]) => {
		css += `  --${key}: ${value};\n`;
	});

	css += '}\n';
	return css;
}

// Function to process a token file
function processTokenFile(filePath) {
	const content = fs.readFileSync(filePath, 'utf8');
	const tokens = JSON.parse(content);
	return convertTokensToCSS(tokens);
}

// Main function to process tokens and convert them to CSS
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