// Select the theme buttons
const themePurpleYellow = document.getElementById('theme-purple-yellow');
const themeDarkblueBeige = document.getElementById('theme-darkblue-beige');
const themeDark = document.getElementById('theme-dark');

// Get the user's saved theme from localStorage (if any)
const savedTheme = localStorage.getItem('theme');

// Function to update the active state of theme buttons
function updateActiveButton(theme) {
	// Remove active class from all buttons
	document.querySelectorAll('.theme-btn').forEach(btn => {
		btn.classList.remove('active');
	});
	
	// Add active class to the current theme button
	let activeButton;
	switch(theme) {
		case 'light':
			activeButton = themePurpleYellow;
			break;
		case 'helix':
			activeButton = themeDarkblueBeige;
			break;
		case 'dark':
			activeButton = themeDark;
			break;
		default:
			activeButton = themePurpleYellow;
	}
	
	if (activeButton) {
		activeButton.classList.add('active');
	}
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
	updateActiveButton(theme);
	updateStylesheet(theme);
}

// Check if the user has a system-level color scheme preference
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Function to handle system-level color scheme changes
function handleColorSchemeChange(e) {
	const systemTheme = e.matches ? 'dark' : 'light';
	applyTheme(systemTheme);
}

// Check the initial color scheme preference and apply the theme accordingly
if (savedTheme) {
	applyTheme(savedTheme);
} else {
	applyTheme('light'); // Default to light theme
}

// Listen for system-level color scheme changes
prefersDarkScheme.addListener(handleColorSchemeChange);

// Listen for theme button clicks
themePurpleYellow.addEventListener('click', () => {
	applyTheme('light');
	localStorage.setItem('theme', 'light');
});

themeDarkblueBeige.addEventListener('click', () => {
	applyTheme('helix');
	localStorage.setItem('theme', 'helix');
});

themeDark.addEventListener('click', () => {
	applyTheme('dark');
	localStorage.setItem('theme', 'dark');
});