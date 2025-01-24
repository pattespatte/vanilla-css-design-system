const fs = require('fs');
const path = require('path');

const SOURCE_DIR = './styles/variables';
const OUTPUT_DIR = './figma';

// Helper function to determine collection type based on variable name
function getCollectionType(name) {
	if (name.includes('color')) return 'color';
	if (name.includes('shadow')) return 'effect';
	if (name.includes('font')) return 'typography';
	if (name.includes('spacing')) return 'spacing';
	if (name.includes('size')) return 'dimension';
	return 'other'; // Default collection
}

// Helper function to parse color values
function parseColor(value) {
	// Handle hex colors
	if (value.startsWith('#')) {
		return {
			type: 'color',
			value: value.toLowerCase()
		};
	}
	// Handle rgb/rgba colors
	if (value.startsWith('rgb')) {
		return {
			type: 'color',
			value: value
		};
	}
	// Handle hsl/hsla colors
	if (value.startsWith('hsl')) {
		return {
			type: 'color',
			value: value
		};
	}
	return null;
}

// Helper function to parse shadow values
function parseShadow(value) {
	const shadowRegex = /^([\d.]+px|[\d.]+em|[\d.]+rem|0) +([\d.]+px|[\d.]+em|[\d.]+rem|0) +([\d.]+px|[\d.]+em|[\d.]+rem|0) +([\d.]+px|[\d.]+em|[\d.]+rem|0) +(.*)$/;
	const match = value.match(shadowRegex);

	if (match) {
		const [, x, y, blur, spread, color] = match;
		return {
			type: 'effect',
			value: {
				type: 'DROP_SHADOW',
				color: color,
				offset: { x: parseFloat(x), y: parseFloat(y) },
				blur: parseFloat(blur),
				spread: parseFloat(spread)
			}
		};
	}
	return null;
}

// Helper function to convert CSS value to Figma variable value
function convertToFigmaValue(name, value) {
	// Handle var() references
	if (typeof value === 'string' && value.startsWith('var(--')) {
		const varName = value.slice(6, -1);
		return {
			type: 'variable_alias',
			value: varName
		};
	}

	// Try parsing as color
	const colorValue = parseColor(value);
	if (colorValue) return colorValue;

	// Try parsing as shadow
	const shadowValue = parseShadow(value);
	if (shadowValue) return shadowValue;

	// Handle numeric values with units
	if (typeof value === 'string' && /^[\d.]+(%|px|rem|em)$/.test(value)) {
		return {
			type: 'dimension',
			value: value
		};
	}

	// Handle plain numbers
	if (!isNaN(value)) {
		return {
			type: 'number',
			value: parseFloat(value)
		};
	}

	// Default to string
	return {
		type: 'string',
		value: value
	};
}

// Convert CSS variables to Figma variables format
function cssToFigmaVariables(cssContent) {
	const collections = {};
	const variables = {};

	// Initialize collections
	['color', 'effect', 'typography', 'spacing', 'dimension', 'other'].forEach(type => {
		collections[type] = {
			name: type.charAt(0).toUpperCase() + type.slice(1),
			type: type,
			variables: {}
		};
	});

	// Parse CSS content
	const variableRegex = /--([^:]+):\s*([^;]+);/g;
	let match;
	while ((match = variableRegex.exec(cssContent)) !== null) {
		const name = match[1];
		const value = match[2].trim();
		variables[name] = value;
	}

	// Process each CSS variable
	Object.entries(variables).forEach(([name, value]) => {
		const collectionType = getCollectionType(name);
		const figmaValue = convertToFigmaValue(name, value);

		collections[collectionType].variables[name] = {
			name: name,
			type: figmaValue.type,
			value: figmaValue.value
		};
	});

	// Remove empty collections
	Object.keys(collections).forEach(key => {
		if (Object.keys(collections[key].variables).length === 0) {
			delete collections[key];
		}
	});

	return {
		version: '1.0',
		collections: Object.values(collections)
	};
}

// Main function to process CSS files
function processCSSFiles() {
	// Create output directory if it doesn't exist
	if (!fs.existsSync(OUTPUT_DIR)) {
		fs.mkdirSync(OUTPUT_DIR, { recursive: true });
	}

	// Read all CSS files from source directory
	fs.readdirSync(SOURCE_DIR).forEach(file => {
		if (file.endsWith('.css')) {
			const cssPath = path.join(SOURCE_DIR, file);
			const cssContent = fs.readFileSync(cssPath, 'utf8');

			// Convert to Figma variables
			const figmaVariables = cssToFigmaVariables(cssContent);

			// Write JSON file
			const outputFile = path.join(OUTPUT_DIR, file.replace('.css', '.json'));
			fs.writeFileSync(outputFile, JSON.stringify(figmaVariables, null, 2));

			console.log(`Converted ${file} to Figma variables format: ${path.basename(outputFile)}`);
		}
	});
}

// Run the conversion
processCSSFiles();