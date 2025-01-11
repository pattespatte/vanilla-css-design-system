// Get the current script's location (the location of 'assets/main.js')
const script = document.currentScript;

// Extract the base URL from the script's location, removing 'assets/main.js'
const scriptBasePath = script.src.replace(/\/assets\/main\.js$/, '');

// Set the examples folder relative to the script's location
const examplesFolder = `${scriptBasePath}/`;

// Get a reference to the navigation menu
const navMenu = document.querySelector('.nav-menu');

// Check if navigation menu exists
if (navMenu) {
	// Fetch the directory listing of the examples folder
	fetch(examplesFolder)
		.then(response => response.text())
		.then(html => {
			// Match all HTML file links in the directory listing
			const htmlFiles = html.match(/<a href="([^"]+\.html)"/g);
			if (htmlFiles) {
				htmlFiles.forEach(file => {
					// Extract the file name from the match
					const fileName = file.replace(/<a href="|\.html"/g, '');

					// Create a new link element for each file
					const link = document.createElement('a');
					link.href = `${examplesFolder}${fileName}.html`;
					link.textContent = fileName.charAt(0).toUpperCase() + fileName.slice(1);

					// Create a list item to hold the link
					const listItem = document.createElement('li');
					listItem.appendChild(link);

					// Append the list item to the navigation menu
					navMenu.appendChild(listItem);
				});
			}
		})
		.catch(error => console.error('Error loading navigation:', error));
} else {
	console.error('Navigation menu element not found');
}

// Add hamburger menu functionality
const navToggle = document.querySelector('.nav-toggle');

if (navToggle) {
	navToggle.addEventListener('click', () => {
		const navMenu = document.querySelector('.nav-menu');
		navToggle.classList.toggle('active');
		navMenu.classList.toggle('active');

		// Optional: Prevent body scrolling when menu is open
		document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
	});
}