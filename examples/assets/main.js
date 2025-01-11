const examplesFolder = './';
const navMenu = document.querySelector('.nav-menu');

// Check if navigation menu exists
if (navMenu) {
	// Get a list of all HTML files in the examples folder
	fetch(examplesFolder)
		.then(response => response.text())
		.then(html => {
			const htmlFiles = html.match(/<a href="([^"]+\.html)"/g);
			if (htmlFiles) {
				htmlFiles.forEach(file => {
					const fileName = file.replace(/<a href="|\.html"/g, '');
					const link = document.createElement('a');
					link.href = `${examplesFolder}${fileName}.html`;
					link.textContent = fileName.charAt(0).toUpperCase() + fileName.slice(1);
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