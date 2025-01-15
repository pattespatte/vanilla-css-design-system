// Get the current script's location (the location of 'assets/main.js')
const script = document.currentScript;

// Extract the base URL from the script's location, removing 'assets/main.js'
const scriptBasePath = script.src.replace(/\/assets\/main\.js$/, '');

// Set the examples folder relative to the script's location
const examplesFolder = `${scriptBasePath}/`;

// Update all elements that need the base path
document.querySelector('[data-home-link]').href = examplesFolder;

// Get a reference to the navigation menu
const navMenu = document.querySelector('.nav-menu');

// Check if navigation menu exists
if (navMenu) {
	fetch(examplesFolder)
		.then(response => response.text())
		.then(html => {
			const htmlFiles = html.match(/<a href="([^"]+\.html)"/g);
			if (htmlFiles) {
				htmlFiles.forEach(file => {
					const fileName = file.replace(/<a href="|\.html"/g, '');
					const link = document.createElement('a');
					link.href = `${examplesFolder}${fileName}.html`;

					// Split the fileName into parts
					const parts = fileName.split('/');
					let linkText = '';

					if (parts.length > 1) {
						// If there's a subdirectory, format as "Directory/filename"
						linkText = `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)}/`;
						const currentPage = parts[parts.length - 1];

						// Check if this is the current page
						if (window.location.pathname.endsWith(fileName + '.html')) {
							linkText += `<strong>${currentPage}</strong>`;
						} else {
							linkText += currentPage;
						}
					} else {
						// If no subdirectory, just capitalize the filename
						linkText = fileName.charAt(0).toUpperCase() + fileName.slice(1);

						// Check if this is the current page
						if (window.location.pathname.endsWith(fileName + '.html')) {
							linkText = `<strong>${linkText}</strong>`;
						}
					}

					link.innerHTML = linkText;

					const listItem = document.createElement('li');
					listItem.appendChild(link);
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