const fs = require('fs');
const css = require('css');
const path = require('path');

// Updated mapping of token types to their associated keywords
const tokenTypeMapping = {
	color: ['color', 'background-color', 'border-color'],
	spacing: ['margin', 'padding', 'gap'],
	dimension: ['width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'border-radius', 'border-width', 'size', 'breakpoint'],
	typography: ['font-weight', 'font-size', 'line-height', 'letter-spacing'],
	other: ['z-index', 'opacity'],
};

// Helper function to determine $type based on variable name
function determineTokenType(variableName) {
	// Iterate over the mapping object
	for (const [type, keywords] of Object.entries(tokenTypeMapping)) {
		// Check if any keyword matches the variable name
		if (keywords.some(keyword => variableName.includes(keyword))) {
			return type; // Return the matching token type
		}
	}

	// Default token type if no match is found
	return 'other';
}

// Helper function to format tokens with $type and $value
function formatToken(value, type) {
	return {
		$type: type,
		$value: value,
	};
}

// Function to recursively build JSON structure for variables
function buildTokenStructure(variableName, value, root) {
	const parts = variableName.split('-');
	let current = root;

	parts.forEach((part, index) => {
		if (index === parts.length - 1) {
			// Assign the final value with $type and $value
			const type = determineTokenType(variableName);
			current[part] = formatToken(value, type);
		} else {
			// Create nested objects as needed
			current[part] = current[part] || {};
			current = current[part];
		}
	});

	return root;
}

// Function to resolve variable references
function resolveVariableReference(value, allTokens) {
	if (typeof value !== 'string') return value;

	const varMatch = value.match(/var\(--([^)]+)\)/);
	if (!varMatch) return value;

	const varPath = varMatch[1].split('-');
	let currentValue = allTokens;

	try {
		varPath.forEach(segment => {
			currentValue = currentValue[segment];
		});
		return currentValue?.$value || value; // Return resolved value or fallback
	} catch (e) {
		console.warn(`Could not resolve variable: ${value}`);
		return value;
	}
}

// Function to process a single CSS file and extract tokens
function processCssFile(filePath) {
	const cssContent = fs.readFileSync(filePath, 'utf8');
	const parsedCss = css.parse(cssContent);
	const variables = {};

	parsedCss.stylesheet.rules.forEach(rule => {
		if (rule.type === 'rule' && rule.selectors.includes(':root')) {
			rule.declarations.forEach(declaration => {
				if (declaration.type === 'declaration' && declaration.property.startsWith('--')) {
					const variableName = declaration.property.substring(2); // Remove -- prefix
					const variableValue = declaration.value;
					buildTokenStructure(variableName, variableValue, variables);
				}
			});
		}
	});

	return variables;
}

// Function to resolve all variable references in the token files
function resolveAllReferences(allTokens) {
	const resolveNestedReferences = obj => {
		for (let key in obj) {
			if (typeof obj[key] === 'object' && obj[key].$value) {
				obj[key].$value = resolveVariableReference(obj[key].$value, allTokens);
			} else if (typeof obj[key] === 'object') {
				resolveNestedReferences(obj[key]);
			}
		}
		return obj;
	};

	Object.keys(allTokens).forEach(tokenName => {
		allTokens[tokenName] = resolveNestedReferences(allTokens[tokenName]);
	});

	return allTokens;
}

// Main function to process all CSS files and generate tokens
function generateTokens() {
	const variablesDir = './styles/variables/';
	const tokenFiles = fs.readdirSync(variablesDir).filter(file => file.endsWith('.css'));
	const allTokens = {};

	// First pass: Process each CSS file and generate raw tokens
	tokenFiles.forEach(file => {
		const filePath = path.join(variablesDir, file);
		const tokenName = file.replace('.css', '');
		const tokens = processCssFile(filePath);
		allTokens[tokenName] = tokens;

		// Write the raw token file
		fs.writeFileSync(
			`./tokens/${tokenName}.json`,
			JSON.stringify(tokens, null, 2)
		);
	});

	// Second pass: Resolve variable references
	const resolvedTokens = resolveAllReferences(allTokens);

	// Write resolved tokens back to the files
	Object.keys(resolvedTokens).forEach(tokenName => {
		fs.writeFileSync(
			`./tokens/${tokenName}.json`,
			JSON.stringify(resolvedTokens[tokenName], null, 2)
		);
	});

	console.log('Tokens generated successfully!');
}

// Run the script
generateTokens();