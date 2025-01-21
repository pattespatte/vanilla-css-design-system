const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const postcssJs = require('postcss-js');

const SOURCE_DIR = './styles/variables';
const OUTPUT_DIR = './tokens';

// Helper function to determine token type
function getTokenType(name, value) {
	// Shadows
	if (name.includes('shadow')) {
		return 'shadow';
	}

	// Font families
	if (name.includes('font-family')) {
		return 'string';
	}

	// Font sizes
	if (name.includes('font-size')) {
		return 'dimension';
	}

	// Font weights
	if (name.includes('font-weight')) {
		return 'number';
	}

	// Line height
	if (name.includes('line-height')) {
		return 'number';
	}

	// Transitions
	if (name.includes('transition')) {
		return 'duration';
	}

	// Colors
	if (name.includes('color') || value.match(/^#|rgb|hsl/)) {
		return 'color';
	}

	// Dimensions (px, rem, em, etc.)
	if (value.match(/px|rem|em|%|vw|vh|vh/)) {
		return 'dimension';
	}

	return 'string';
}

// Helper function to process shadow values
function parseShadowValue(value) {
	const shadowRegex = /^([\d.]+px|[\d.]+em|[\d.]+rem|0) +([\d.]+px|[\d.]+em|[\d.]+rem|0) +([\d.]+px|[\d.]+em|[\d.]+rem|0) +([\d.]+px|[\d.]+em|[\d.]+rem|0) +(.*)$/;

	const match = value.match(shadowRegex);
	if (match) {
		const [, x, y, blur, spread, color] = match;
		return [
			{
				x,
				y,
				blur,
				spread,
				color,
			},
		];
	}

	return value; // Return as-is if it doesn't match the shadow format
}

// Helper function to process values based on type
function processValue(name, value, type) {
	switch (type) {
		case 'shadow':
			// Parse shadow shorthand into structured object
			return parseShadowValue(value);
		case 'number':
			// Convert numeric strings to actual numbers
			return parseFloat(value);
		case 'duration':
			// Convert transition value to milliseconds
			if (value.endsWith('ms')) {
				// Already in milliseconds, just return as is
				return value;
			} else if (value.endsWith('s')) {
				// Convert seconds to milliseconds
				const seconds = parseFloat(value.match(/[\d.]+/)[0]);
				return `${seconds * 1000}ms`;
			}
			return value;
		default:
			return value;
	}
}

// Convert CSS custom properties to Style Dictionary tokens
function cssToTokens(cssObj) {
	const tokens = {};

	Object.entries(cssObj).forEach(([key, value]) => {
		if (key.startsWith('--')) {
			const tokenName = key.substring(2);
			const type = getTokenType(tokenName, value);
			const processedValue = processValue(tokenName, value, type);

			tokens[tokenName] = {
				"$value": processedValue,
				"$type": type,
			};
		}
	});

	return tokens;
}

// Process each CSS file
fs.readdirSync(SOURCE_DIR).forEach(file => {
	if (file.endsWith('.css')) {
		const cssContent = fs.readFileSync(path.join(SOURCE_DIR, file), 'utf8');
		const root = postcss.parse(cssContent);
		const cssObj = postcssJs.objectify(root);

		// Convert to tokens
		const tokens = cssToTokens(cssObj[':root'] || {});

		// Write JSON file
		const outputFile = path.join(OUTPUT_DIR, file.replace('.css', '.json'));
		fs.writeFileSync(outputFile, JSON.stringify(tokens, null, 2));

		console.log(`Converted ${file} to ${path.basename(outputFile)}`);
	}
});