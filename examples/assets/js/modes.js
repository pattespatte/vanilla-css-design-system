// Select the toggle button
const themeToggle = document.getElementById('theme-toggle');

// Get the user's saved theme from localStorage (if any)
const savedTheme = localStorage.getItem('theme');

// Function to update the button's emoji based on the theme
function updateToggleIcon(theme) {
	themeToggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
}

// Apply the saved theme (if found) and update the button's emoji
if (savedTheme) {
	document.documentElement.setAttribute('data-theme', savedTheme);
	updateToggleIcon(savedTheme);
}

// Listen for toggle button clicks
themeToggle.addEventListener('click', () => {
	// Get the current theme
	const currentTheme = document.documentElement.getAttribute('data-theme');

	// Toggle between 'dark' and 'light'
	const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
	document.documentElement.setAttribute('data-theme', newTheme);

	// Save the new theme in localStorage
	localStorage.setItem('theme', newTheme);

	// Update the button's emoji
	updateToggleIcon(newTheme);
});