// scripts/css-to-tokens.js
const fs = require('fs');
const path = require('path');
const css = require('css');

function parseCSSToTokens(cssContent) {
	const ast = css.parse(cssContent);
	const variables = {};

	// First pass: collect all raw variables
	const rawVariables = {};
	const rootRule = ast.stylesheet.rules.find(rule =>
		rule.type === 'rule' && rule.selectors.includes(':root')
	);

	if (!rootRule) return variables;

	// First collect all raw values
	rootRule.declarations.forEach(declaration => {
		if (declaration.type === 'declaration' && declaration.property.startsWith('--')) {
			const name = declaration.property.slice(2);
			rawVariables[name] = declaration.value;
		}
	});

	// Second pass: resolve variables and calc expressions
	rootRule.declarations.forEach(declaration => {
		if (declaration.type === 'declaration' && declaration.property.startsWith('--')) {
			const name = declaration.property.slice(2);
			let value = declaration.value;

			// Resolve var() references
			while (value.includes('var(')) {
				const varMatch = value.match(/var\(--([^)]+)\)/);
				if (varMatch) {
					const varName = varMatch[1];
					value = value.replace(`var(--${varName})`, rawVariables[varName]);
				}
			}

			// Resolve calc expressions
			if (value.startsWith('calc(')) {
				try {
					// Extract the mathematical expression
					const calcExpression = value.match(/calc\((.*)\)/)[1];
					// Evaluate simple multiplication
					const multiply = calcExpression.match(/([\d.]+)\s*\*\s*([\d.]+)/);
					if (multiply) {
						const result = parseFloat(multiply[1]) * parseFloat(multiply[2]);
						value = value.replace(/calc\(.*\)/, `${result}rem`);
					}
				} catch (e) {
					console.warn(`Could not resolve calc expression for ${name}`);
				}
			}

			variables[name] = value;
		}
	});

	return variables;
}

function convertToNestedStructure(variables) {
	const result = {};

	Object.entries(variables).forEach(([key, value]) => {
		const parts = key.split('-');
		let current = result;

		parts.forEach((part, index) => {
			if (index === parts.length - 1) {
				current[part] = value;
			} else {
				current[part] = current[part] || {};
				current = current[part];
			}
		});
	});

	return result;
}

function processCSS(filePath) {
	const cssContent = fs.readFileSync(filePath, 'utf8');
	const variables = parseCSSToTokens(cssContent);
	const nestedTokens = convertToNestedStructure(variables);
	return nestedTokens;
}

// Main function to convert CSS variables to tokens
function cssToTokens() {
	const variablesDir = path.join(__dirname, '../styles/variables');
	const tokensDir = path.join(__dirname, '../tokens');

	// Ensure directories exist
	if (!fs.existsSync(tokensDir)) {
		fs.mkdirSync(tokensDir);
	}

	// Process each CSS file in the variables directory
	fs.readdirSync(variablesDir).forEach(file => {
		if (path.extname(file) === '.css') {
			const baseName = path.basename(file, '.css');
			const cssPath = path.join(variablesDir, file);
			const tokens = processCSS(cssPath);

			// Write to JSON file
			fs.writeFileSync(
				path.join(tokensDir, `${baseName}.json`),
				JSON.stringify({ [baseName]: tokens }, null, 2)
			);
		}
	});
}

// Run the conversion
cssToTokens();