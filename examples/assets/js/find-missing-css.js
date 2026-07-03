// This script will help you to find undefined classes in your HTML document.
//
// Dev-only diagnostic: it scans every stylesheet rule and every element's
// classList and logs any class used in the HTML that has no matching selector.

const allElements = document.getElementsByTagName('*');
const definedClasses = new Set();
const undefinedClasses = new Set();

// Extract ".classname" from a selector. Anchored to a leading dot and a
// conservative class-name charset; intentionally avoids capturing pseudo-class
// fragments like the leading dot of `.0` in `@keyframe` percentages.
const CLASS_REGEX = /\.([a-zA-Z][a-zA-Z0-9_-]*)/g;

function addClassesFromSelector(selectorText) {
  if (!selectorText) return;
  const classes = selectorText.match(CLASS_REGEX);
  if (classes) {
    classes.forEach(c => definedClasses.add(c.substring(1)));
  }
}

// Function to extract classes from a stylesheet, recursing through any
// rule that nests child rules (@import, @media, @supports, @container, and
// native CSS nesting via parentRule).
function extractClassesFromStylesheet(stylesheet) {
  try {
    if (!stylesheet || !stylesheet.cssRules) {
      return;
    }
    extractClassesFromRules(stylesheet.cssRules);
  } catch (e) {
    console.warn(`Cannot access rules for stylesheet: ${stylesheet.href}`);
  }
}

function extractClassesFromRules(rules) {
  for (const rule of rules) {
    try {
      // @import points at another stylesheet — resolve it recursively.
      if (rule instanceof CSSImportRule) {
        extractClassesFromStylesheet(rule.styleSheet);
        continue;
      }

      // Any rule with child rules (@media, @supports, @container, layer…)
      // recurses so nested selectors are not missed.
      if (rule.cssRules) {
        extractClassesFromRules(rule.cssRules);
      }

      if (rule.selectorText) {
        addClassesFromSelector(rule.selectorText);
      }
    } catch (e) {
      console.warn('Error processing rule:', e);
    }
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
}
