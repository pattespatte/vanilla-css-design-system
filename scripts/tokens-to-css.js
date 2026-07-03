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

// Helper function to flatten token objects. $value/$type are token meta keys,
// not nested tokens, so they are skipped at the top of each recursion. This
// avoids rebuilding a filtered shallow copy of every node on the way down.
function flattenObject(obj, prefix = '') {
	return Object.keys(obj).reduce((acc, key) => {
		if (key === '$value' || key === '$type') {
			return acc;
		}
		const pre = prefix.length ? `${prefix}-` : '';
		const child = obj[key];

		// Handle the case where an object has both $value and other properties
		if (typeof child === 'object' && child !== null) {
			// If the object has a $value, add it to accumulator
			if ('$value' in child) {
				acc[`${pre}${key}`] = typeof child.$value === 'object'
					? formatShadowValue(child.$value)
					: child.$value;
			}

			// Continue flattening the object (for nested properties).
			Object.assign(acc, flattenObject(child, `${pre}${key}`));
		} else {
			acc[`${pre}${key}`] = child;
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

// Helper function to shorten HEX values
function shortenHex(value) {
	if (typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)) {
		// Check if the HEX value can be shortened (e.g., #ffffff -> #fff)
		if (
			value[1] === value[2] &&
			value[3] === value[4] &&
			value[5] === value[6]
		) {
			return `#${value[1]}${value[3]}${value[5]}`;
		}
	}
	return value; // Return the original value if it can't be shortened
}

// Function to convert tokens to CSS variables
function convertTokensToCSS(tokens) {
	const flatTokens = flattenObject(tokens);
	let css = ':root {\n';

	Object.entries(flatTokens).forEach(([key, value]) => {
		// Process token references and shorten HEX values
		let processedValue = processReferences(value);
		processedValue = shortenHex(processedValue);

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
			try {
				const css = processTokenFile(tokenPath);
				// Write to CSS file
				fs.writeFileSync(path.join(variablesDir, `${baseName}.css`), css);
			} catch (error) {
				console.error(`Error processing ${file}:`, error.message);
			}
		}
	});

	console.log('Successfully converted tokens to CSS variables!');
}

// Run the conversion
tokensToCSS();