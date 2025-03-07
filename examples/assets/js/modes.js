// Select the toggle button
const themeToggle = document.getElementById('theme-toggle');

// Get the user's saved theme from localStorage (if any)
const savedTheme = localStorage.getItem('theme');

// Function to update the button's text based on the theme
function updateToggleText(theme) {
	themeToggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
}

// Function to update the stylesheet based on the theme
function updateStylesheet(theme) {
	const stylesheetLink = document.querySelector('link[rel="stylesheet"][href*="styles/a11y"]');
	if (stylesheetLink) {
		const newHref = theme === 'dark' 
			? 'https://unpkg.com/@highlightjs/cdn-assets@11.4.0/styles/a11y-dark.min.css' 
			: 'https://unpkg.com/@highlightjs/cdn-assets@11.4.0/styles/a11y-light.min.css';
		const newStylesheetLink = stylesheetLink.cloneNode();
		newStylesheetLink.href = newHref;
		stylesheetLink.parentNode.replaceChild(newStylesheetLink, stylesheetLink);
	}
}

// Function to apply the theme based on the user's preference or saved theme
function applyTheme(theme) {
	document.documentElement.setAttribute('data-theme', theme);
	updateToggleText(theme);
	updateStylesheet(theme);
}

// Check if the user has a system-level color scheme preference
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Function to handle system-level color scheme changes
function handleColorSchemeChange(e) {
	const systemTheme = e.matches ? 'dark' : 'light';
	applyTheme(systemTheme);

	if (systemTheme === 'dark') {
		themeToggle.style.display = 'none';
	} else {
		themeToggle.style.display = 'inline-block';
	}
}

// Check the initial color scheme preference and apply the theme accordingly
if (prefersDarkScheme.matches) {
	applyTheme('dark');
	themeToggle.style.display = 'none';
} else if (savedTheme) {
	applyTheme(savedTheme);
}

// Listen for system-level color scheme changes
prefersDarkScheme.addListener(handleColorSchemeChange);

// Listen for toggle button clicks
themeToggle.addEventListener('click', () => {
	// Get the current theme
	const currentTheme = document.documentElement.getAttribute('data-theme');

	// Toggle between 'dark' and 'light'
	const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
	applyTheme(newTheme);

	// Save the new theme in localStorage
	localStorage.setItem('theme', newTheme);
});