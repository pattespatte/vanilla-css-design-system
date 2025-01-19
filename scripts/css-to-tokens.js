const fs = require('fs');
const css = require('css');

// Function to load all existing tokens
function loadAllTokens() {
	const tokens = {};
	const tokenFiles = fs.readdirSync('./tokens/');
	tokenFiles.forEach(file => {
		if (file.endsWith('.json')) {
			const content = fs.readFileSync(`./tokens/${file}`, 'utf8');
			tokens[file.replace('.json', '')] = JSON.parse(content);
		}
	});
	return tokens;
}

// Function to resolve variable reference
function resolveVariableReference(value, allTokens) {
	if (typeof value !== 'string') return value;

	const varMatch = value.match(/var\(--([^)]+)\)/);
	if (!varMatch) return value;

	const varPath = varMatch[1].split('-');

	// Special handling for color-gray-{number} pattern
	if (varPath[0] === 'color' && varPath[1] === 'gray' && /^\d+$/.test(varPath[2])) {
		try {
			return allTokens.colors.color.gray[varPath[2]];
		} catch (e) {
			console.warn(`Could not resolve variable: ${value}`);
			return value;
		}
	}

	// Normal handling for other variables
	let currentValue = allTokens;
	try {
		varPath.forEach(segment => {
			currentValue = currentValue[segment];
		});
		return currentValue;
	} catch (e) {
		console.warn(`Could not resolve variable: ${value}`);
		return value;
	}
}

// Read CSS files from variables directory
const variablesDir = './styles/variables/';
const files = fs.readdirSync(variablesDir);

// First pass: generate all token files
files.forEach(file => {
	if (file.endsWith('.css')) {
		const cssContent = fs.readFileSync(variablesDir + file, 'utf8');
		const tokenName = file.replace('.css', '');

		// Parse CSS
		const parsedCss = css.parse(cssContent);

		// Extract CSS variables
		const variables = {};
		parsedCss.stylesheet.rules.forEach(rule => {
			if (rule.type === 'rule' && rule.selectors.includes(':root')) {
				rule.declarations.forEach(declaration => {
					if (declaration.type === 'declaration' && declaration.property.startsWith('--')) {
						// Remove the -- prefix and split by -
						const parts = declaration.property.substring(2).split('-');

						// Special handling for color-gray-{number} pattern
						if (parts[0] === 'color' && parts[1] === 'gray' && /^\d+$/.test(parts[2])) {
							variables.color = variables.color || {};
							variables.color.gray = variables.color.gray || {};
							variables.color.gray[parts[2]] = declaration.value;
						} else {
							// Normal handling for other variables
							let current = variables;

							parts.forEach((part, index) => {
								if (index === parts.length - 1) {
									current[part] = declaration.value;
								} else {
									current[part] = current[part] || {};
									current = current[part];
								}
							});
						}
					}
				});
			}
		});

		// Write to JSON file
		fs.writeFileSync(
			`./tokens/${tokenName}.json`,
			JSON.stringify(variables, null, 2)
		);
	}
});

// Second pass: resolve variable references
const allTokens = loadAllTokens();

Object.keys(allTokens).forEach(tokenName => {
	const resolveNestedReferences = (obj) => {
		for (let key in obj) {
			if (typeof obj[key] === 'object') {
				resolveNestedReferences(obj[key]);
			} else {
				obj[key] = resolveVariableReference(obj[key], allTokens);
			}
		}
		return obj;
	};

	const resolvedTokens = resolveNestedReferences({ ...allTokens[tokenName] });

	fs.writeFileSync(
		`./tokens/${tokenName}.json`,
		JSON.stringify(resolvedTokens, null, 2)
	);
});