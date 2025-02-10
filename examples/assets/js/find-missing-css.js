// This script will help you to find undefined classes in your HTML document.

// In Chrome DevTools Console
const allElements = document.getElementsByTagName('*');
const definedClasses = new Set();
const undefinedClasses = new Set();

// Function to extract classes from stylesheets (handles @import)
function extractClassesFromStylesheet(stylesheet) {
	if (!stylesheet || !stylesheet.cssRules) {
		return;
	}

	for (const rule of stylesheet.cssRules) {
		try {
			// If the rule is an @import, resolve it recursively
			if (rule instanceof CSSImportRule) {
				extractClassesFromStylesheet(rule.styleSheet);
			}
			// If the rule is a style rule, extract the classes
			if (rule.selectorText) {
				const classes = rule.selectorText.match(/\.[a-zA-Z0-9_-]+/g);
				if (classes) {
					classes.forEach(c => definedClasses.add(c.substring(1)));
				}
			}
			if (rule instanceof CSSMediaRule) {
				for (const nestedRule of rule.cssRules) {
					if (nestedRule.selectorText) {
						const classes = nestedRule.selectorText.match(/\.[a-zA-Z0-9_-]+/g);
						if (classes) {
							classes.forEach(c => definedClasses.add(c.substring(1)));
						}
					}
				}
			}
		} catch (e) {
			console.log('Error processing rule:', e);
		}
	}
}

// Process all stylesheets
for (const stylesheet of document.styleSheets) {
	try {
		extractClassesFromStylesheet(stylesheet);
	} catch (e) {
		console.log('Cannot read stylesheet:', e);
	}
}

// Check used classes in the document
for (const element of allElements) {
	const classes = element.classList;
	classes.forEach(className => {
		if (!definedClasses.has(className)) {
			undefinedClasses.add(className);
		}
	});
}

// Display any undefined classes in the console
if (undefinedClasses.size > 0) {
	console.log('Undefined classes:', Array.from(undefinedClasses));
}