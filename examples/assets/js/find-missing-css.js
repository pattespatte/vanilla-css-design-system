// This script will help you to find undefined classes in your HTML document.

const allElements = document.getElementsByTagName('*');
const definedClasses = new Set();
const undefinedClasses = new Set();

// Function to extract classes from stylesheets (handles @import)
function extractClassesFromStylesheet(stylesheet) {
	try {
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
				console.warn('Error processing rule:', e);
			}
		}
	} catch (e) {
		console.warn(`Cannot access rules for stylesheet: ${stylesheet.href}`);
	}
}

// Process all stylesheets
for (const stylesheet of document.styleSheets) {
	try {
		// Only process same-origin stylesheets
		if (stylesheet.href) {
			const stylesheetUrl = new URL(stylesheet.href);
			const currentUrl = new URL(window.location.href);

			if (stylesheetUrl.origin !== currentUrl.origin) {
				// console.warn(`Skipping cross-origin stylesheet: ${stylesheet.href}`);
				continue;
			}
		}

		extractClassesFromStylesheet(stylesheet);
	} catch (e) {
		console.warn(`Error processing stylesheet: ${stylesheet.href}`, e);
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
} else {
	// console.log('No undefined CSS classes found!');
}