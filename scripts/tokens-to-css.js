const fs = require('fs');
const path = require('path');

// Helper function to format shadow objects to CSS-compatible strings
function formatShadowValue(value) {
	if (Array.isArray(value)) {
		return value
			.map(v => `${v.x} ${v.y} ${v.blur} ${v.spread} ${v.color}`)
			.join(', ');
	}
	return value;
}

// Helper function to convert dot notation to hyphen notation
function dotToHyphen(str) {
	return str.replace(/\./g, '-');
}

// Helper function to flatten token objects
function flattenObject(obj, prefix = '') {
	return Object.keys(obj).reduce((acc, key) => {
		const pre = prefix.length ? `${prefix}-` : '';

		// Handle the case where an object has both $value and other properties
		if (typeof obj[key] === 'object' && obj[key] !== null) {
			// If the object has a $value, add it to accumulator
			if ('$value' in obj[key]) {
				if (typeof obj[key]['$value'] === 'object') {
					acc[`${pre}${key}`] = formatShadowValue(obj[key]['$value']);
				} else {
					acc[`${pre}${key}`] = obj[key]['$value'];
				}
			}

			// Continue flattening the object (for nested properties)
			// Only process properties that aren't $value or $type
			const nestedObj = Object.keys(obj[key])
				.filter(k => k !== '$value' && k !== '$type')
				.reduce((o, k) => ({ ...o, [k]: obj[key][k] }), {});

			if (Object.keys(nestedObj).length > 0) {
				Object.assign(acc, flattenObject(nestedObj, `${pre}${key}`));
			}
		} else {
			acc[`${pre}${key}`] = obj[key];
		}
		return acc;
	}, {});
}

// Helper function to process token references
function processReferences(value) {
	if (typeof value !== 'string') return value;

	// Match references in the format {color.primary.500}
	const referenceRegex = /\{([\w.-]+)\}/g;
	return value.replace(referenceRegex, (_, refName) => {
		// Convert dot notation to hyphen notation
		const hyphenRef = dotToHyphen(refName);
		return `var(--${hyphenRef})`;
	});
}

// Function to convert tokens to CSS variables
function convertTokensToCSS(tokens) {
	const flatTokens = flattenObject(tokens);
	let css = ':root {\n';

	Object.entries(flatTokens).forEach(([key, value]) => {
		const processedValue = processReferences(value);
		css += `  --${key}: ${processedValue};\n`;
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
			fs.writeFileSync(path.join(variablesDir, `${baseName}.css`), css);
		}
	});

	console.log('Successfully converted tokens to CSS variables!');
}

// Run the conversion
tokensToCSS();