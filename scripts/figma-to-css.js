const fs = require('fs');
const path = require('path');

const SOURCE_DIR = './figma';
const OUTPUT_DIR = './styles/variables';

// Helper function to convert Figma color value to CSS
function formatColorValue(value) {
	// If it's already a valid CSS color format, return as is
	if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl'))) {
		return value;
	}
	// Handle other color formats if needed
	return value;
}

// Helper function to convert Figma effect value to CSS
function formatEffectValue(effect) {
	if (effect.type === 'DROP_SHADOW') {
		const { offset, blur, spread, color } = effect;
		return `${offset.x}px ${offset.y}px ${blur}px ${spread}px ${color}`;
	}
	return JSON.stringify(effect); // Fallback for unknown effect types
}

// Helper function to format Figma variable value to CSS value
function formatValue(variable) {
	if (!variable || !variable.value) return '';

	// Handle variable aliases
	if (variable.type === 'variable_alias') {
		return `var(--${variable.value})`;
	}

	switch (variable.type) {
		case 'color':
			return formatColorValue(variable.value);
		case 'effect':
			return formatEffectValue(variable.value);
		case 'dimension':
			return variable.value;
		case 'number':
			return variable.value.toString();
		case 'string':
			return variable.value;
		default:
			// For unknown types, return the value as is or stringify if it's an object
			return typeof variable.value === 'object'
				? JSON.stringify(variable.value)
				: variable.value;
	}
}

// Convert Figma variables to CSS
function figmaToCss(figmaData) {
	let css = ':root {\n';

	// Process each collection
	figmaData.collections.forEach(collection => {
		// Add comment for collection
		css += `  /* ${collection.name} */\n`;

		// Process variables in this collection
		Object.entries(collection.variables).forEach(([key, variable]) => {
			const value = formatValue(variable);
			if (value) {
				css += `  --${key}: ${value};\n`;
			}
		});

		css += '\n';
	});

	css += '}\n';
	return css;
}

// Main function to process Figma files
function processFigmaFiles() {
	// Create output directory if it doesn't exist
	if (!fs.existsSync(OUTPUT_DIR)) {
		fs.mkdirSync(OUTPUT_DIR, { recursive: true });
	}

	// Read all JSON files from source directory
	fs.readdirSync(SOURCE_DIR).forEach(file => {
		if (file.endsWith('.json')) {
			const figmaPath = path.join(SOURCE_DIR, file);
			const figmaContent = fs.readFileSync(figmaPath, 'utf8');

			try {
				// Parse Figma JSON
				const figmaData = JSON.parse(figmaContent);

				// Convert to CSS
				const css = figmaToCss(figmaData);

				// Write CSS file
				const outputFile = path.join(OUTPUT_DIR, file.replace('.json', '.css'));
				fs.writeFileSync(outputFile, css);

				console.log(`Converted ${file} to CSS variables: ${path.basename(outputFile)}`);
			} catch (error) {
				console.error(`Error processing ${file}:`, error);
			}
		}
	});
}

// Run the conversion
processFigmaFiles();