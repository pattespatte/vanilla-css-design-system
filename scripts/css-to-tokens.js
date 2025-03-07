const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const postcssJs = require('postcss-js');

const SOURCE_DIR = './styles/variables';
const OUTPUT_DIR = './tokens';

// Helper function to create nested object structure
function createNestedObject(obj, path, value) {
	const keys = path.split('.');
	let current = obj;

	for (let i = 0; i < keys.length - 1; i++) {
		if (!(keys[i] in current)) {
			current[keys[i]] = {};
		}
		current = current[keys[i]];
	}

	current[keys[keys.length - 1]] = value;
}

// Convert token name to nested path
function convertTokenNameToPath(tokenName) {
	// Split by hyphen
	const parts = tokenName.split('-');

	// Handle special cases for 'default'
	if (parts.length === 3 && parts[2] === 'default') {
		return `${parts[0]}.${parts[1]}.default`;
	}

	// Handle numbered variations (like 100, 200, etc.)
	if (parts.length === 3 && /^\d+$/.test(parts[2])) {
		return `${parts[0]}.${parts[1]}.${parts[2]}`;
	}

	return parts.join('.');
}

// Helper function to convert var() to token references
function convertVarToTokenReference(value) {
	if (typeof value === 'string' && value.startsWith('var(--')) {
		// Extract the variable name without 'var(--' and ')'
		const varName = value.slice(6, -1);
		// Return as a token reference
		return `{${varName}}`;
	}
	return value;
}

// Helper function to determine token type
function getTokenType(name, value) {
	// If the value is a token reference, try to determine type from the name
	if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
		// Use the name to determine type since the value is a reference
		if (name.includes('shadow')) return 'shadow';
		if (name.includes('font-family')) return 'fontFamily';
		if (name.includes('font-size')) return 'dimension';
		if (name.includes('font-weight')) return 'number';
		if (name.includes('line-height')) return 'number';
		if (name.includes('transition')) return 'duration';
		if (name.includes('color')) return 'color';
		return 'string';
	}

	// Font weights - check if it's a numeric value
	if ((name.includes('font-weight') || name.includes('text.weight')) && !isNaN(value)) {
		return 'number';
	}

	// Shadows
	if (name.includes('shadow')) {
		return 'shadow';
	}

	// Font families
	if (name.includes('font-family') || name.includes('font.family')) {
		return 'fontFamily';
	}

	// Font sizes
	if (name.includes('font-size')) {
		return 'dimension';
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
	if (name.includes('color') || value.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/) || value.match(/^rgb|hsl/)) {
		return 'color';
	}

	// Dimensions (px, rem, em, etc.)
	if (value.match(/px|rem|em|%|vw|vh|vh/)) {
		return 'dimension';
	}

	return 'string';
}

// Helper function to expand short hex codes to long hex codes
function expandShortHex(value) {
	if (typeof value === 'string' && /^#[0-9a-fA-F]{3}$/.test(value)) {
		// Expand short hex by doubling each character
		return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
	}
	return value; // Return the value as-is if it's not a short hex
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
	// If the value is already a token reference, return it as-is
	if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
		return value;
	}

	switch (type) {
		case 'shadow':
			return parseShadowValue(value);
		case 'number':
			// Ensure we're returning an actual number, not a string
			return Number(value);
		case 'duration':
			if (value.endsWith('ms')) {
				return value;
			} else if (value.endsWith('s')) {
				const seconds = parseFloat(value.match(/[\d.]+/)[0]);
				return `${seconds * 1000}ms`;
			}
			return value;
		case 'color':
			return expandShortHex(value);
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
			const resolvedValue = convertVarToTokenReference(value);
			const type = getTokenType(tokenName, resolvedValue);
			const processedValue = processValue(tokenName, resolvedValue, type);

			// Convert the flat token name to a nested path
			const tokenPath = convertTokenNameToPath(tokenName);

			// Update token references to use dot notation
			let finalValue = processedValue;
			if (typeof processedValue === 'string' && processedValue.startsWith('{') && processedValue.endsWith('}')) {
				const refName = processedValue.slice(1, -1);
				finalValue = '{' + refName.replace(/-/g, '.') + '}';
			}

			// Create the token object
			const tokenObject = {
				"$value": finalValue,
				"$type": type
			};

			// Create nested structure
			createNestedObject(tokens, tokenPath, tokenObject);
		}
	});

	return tokens;
}

// Custom JSON stringifier that doesn't quote numbers
function customStringify(obj, indent = 2) {
	return JSON.stringify(obj, (key, value) => {
		// If the value is a number and we're not dealing with a string representation
		if (typeof value === 'number' && !isNaN(value)) {
			// Return the number as is (without quotes)
			return Number(value);
		}
		return value;
	}, indent);
}

// Process each CSS file
fs.readdirSync(SOURCE_DIR).forEach(file => {
	if (file.endsWith('.css')) {
		const cssContent = fs.readFileSync(path.join(SOURCE_DIR, file), 'utf8');
		const root = postcss.parse(cssContent);
		const cssObj = postcssJs.objectify(root);

		// Convert to tokens
		const tokens = cssToTokens(cssObj[':root'] || {});

		// Write JSON file using custom stringification
		const outputFile = path.join(OUTPUT_DIR, file.replace('.css', '.json'));
		fs.writeFileSync(outputFile, customStringify(tokens));

		console.log(`Converted ${file} to ${path.basename(outputFile)}`);
	}
});