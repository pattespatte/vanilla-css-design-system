// Get the current script's location (the location of 'assets/main-menu.js')
const script = document.currentScript;

// Extract the base URL from the script's location, removing 'assets/main-menu.js'
this.scriptBasePath = script.src.replace(/\/assets\/js\/main-menu\.js$/, '');

// Set the examples folder relative to the script's location
const examplesFolder = `${scriptBasePath}/`;

// Update all elements that need the base path
document.querySelector('[data-home-link]')?.setAttribute('href', examplesFolder);

// Get a reference to the navigation menu
const navMenu = document.querySelector('.main-menu');

// Check if navigation menu exists
if (navMenu) {

	// Get the navigation toggle button (hamburger icon)
	const navToggle = document.querySelector('.nav-toggle');

	// Get the main menu element
	const mainMenu = document.querySelector('.main-menu');

	// Add an event listener to the navToggle (hamburger icon)
	if (navToggle && mainMenu) {
		navToggle.addEventListener('click', () => {
			// Toggle the 'active' class on the main menu to show or hide it
			mainMenu.classList.toggle('active');
		});
	} else {
		console.error('Navigation toggle or main menu element not found');
	}

	// Dynamically fetch and build the menu
	fetch(examplesFolder)
		.then(response => response.text())
		.then(html => {
			const htmlFiles = html.match(/<a href="([^"]+\.html)"/g);
			if (htmlFiles) {
				const menuGroups = {}; // Object to group the items by category

				// Group files by their folder names
				htmlFiles.forEach(file => {
					const filePath = file.match(/<a href="([^"]+\.html)"/)[1]; // Extract file path
					const parts = filePath.split('/'); // Split into parts
					const category = parts[0]; // Get the first part (e.g., 'base', 'layout')
					const fileName = parts[parts.length - 1].replace('.html', ''); // Get the file name without extension

					// Initialize group if it doesn't exist
					if (!menuGroups[category]) {
						menuGroups[category] = [];
					}

					// Add the file to the correct group with a readable label
					menuGroups[category].push({
						href: `${examplesFolder}${filePath}`,
						label: formatFileName(fileName)
					});
				});

				// Build the grouped menu structure
				Object.keys(menuGroups).forEach(category => {
					const parentLi = document.createElement('li');
					parentLi.setAttribute('role', 'menuitem');

					// Create a link for the category (level 1 button)
					const categoryLink = document.createElement('a');
					categoryLink.href = menuGroups[category][0].href; // Link to the first submenu item
					categoryLink.textContent = formatCategoryName(category);
					categoryLink.setAttribute('aria-haspopup', 'true'); // Indicates a submenu is available
					categoryLink.setAttribute('aria-expanded', 'false'); // Initially collapsed
					categoryLink.classList.add('category-button');
					parentLi.appendChild(categoryLink);

					// Create a submenu for the category
					const submenu = document.createElement('ul');
					submenu.classList.add('submenu');
					submenu.setAttribute('role', 'menu');
					submenu.hidden = true; // Hide submenu by default

					// Add submenu items
					menuGroups[category].forEach(item => {
						const subLi = document.createElement('li');
						subLi.setAttribute('role', 'menuitem');

						const subLink = document.createElement('a');
						subLink.href = item.href;
						subLink.textContent = item.label;

						subLi.appendChild(subLink);
						submenu.appendChild(subLi);
					});

					parentLi.appendChild(submenu);
					navMenu.appendChild(parentLi);

					// Add toggle functionality for the submenu
					categoryLink.addEventListener('click', (event) => {
						const isExpanded = categoryLink.getAttribute('aria-expanded') === 'true';

						if (!isExpanded) {
							// If submenu is collapsed, allow navigation to the link's URL
							categoryLink.setAttribute('aria-expanded', true);
							submenu.hidden = false;
						} else {
							// If submenu is expanded, toggle it and prevent navigation
							event.preventDefault();
							categoryLink.setAttribute('aria-expanded', false);
							submenu.hidden = true;
						}
					});
				});

				// Once the menu is built, initialize accessibility
				initializeMenuAccessibility();

				// Initialize the active menu item functionality
				initializeActiveMenuItem();
			}
		})
		.catch(error => console.error('Error loading navigation:', error));
} else {
	console.error('Navigation menu element not found');
}

// Accessibility for the menu
function initializeMenuAccessibility() {
	const categoryLinks = document.querySelectorAll('.main-menu > li > a');

	categoryLinks.forEach(link => {
		link.addEventListener('keydown', (e) => {
			const submenu = link.nextElementSibling;

			if (e.key === 'Enter' || e.key === ' ') {
				// Toggle submenu visibility on Enter or Space
				e.preventDefault();
				const isExpanded = link.getAttribute('aria-expanded') === 'true';
				link.setAttribute('aria-expanded', !isExpanded);
				submenu.hidden = isExpanded;
			} else if (e.key === 'ArrowDown') {
				// Focus first submenu item
				e.preventDefault();
				if (submenu) {
					const firstSubmenuItem = submenu.querySelector('a');
					firstSubmenuItem && firstSubmenuItem.focus();
				}
			}
		});

		const submenuLinks = link.nextElementSibling?.querySelectorAll('a');

		submenuLinks?.forEach(link => {
			link.addEventListener('keydown', (e) => {
				if (e.key === 'ArrowDown') {
					// Move focus to the next item in the submenu
					e.preventDefault();
					const next = link.parentElement.nextElementSibling?.querySelector('a');
					next ? next.focus() : submenuLinks[0].focus();
				} else if (e.key === 'ArrowUp') {
					// Move focus to the previous item in the submenu
					e.preventDefault();
					const prev = link.parentElement.previousElementSibling?.querySelector('a');
					prev ? prev.focus() : submenuLinks[submenuLinks.length - 1].focus();
				} else if (e.key === 'Escape') {
					// Close the submenu and return focus to the parent
					e.preventDefault();
					link.setAttribute('aria-expanded', 'false');
					submenu.hidden = true;
					link.focus();
				}
			});
		});
	});
}

// Add active class to clicked menu item
function initializeActiveMenuItem() {
	// Get all submenu links
	const menuLinks = document.querySelectorAll('.main-menu [role="menuitem"] > a');

	menuLinks.forEach(link => {
		link.addEventListener('click', (event) => {
			// Remove the active class from all links
			menuLinks.forEach(link => link.classList.remove('active'));

			// Add the active class to the clicked link
			event.currentTarget.classList.add('active');

			// Optional: Save the active link to localStorage for persistence
			localStorage.setItem('activeMenuItem', event.currentTarget.getAttribute('href'));
		});
	});

	// Optional: Restore the active link from localStorage on page load
	const activeMenuItem = localStorage.getItem('activeMenuItem');
	if (activeMenuItem) {
		const activeLink = document.querySelector(`.main-menu [role="menuitem"] > a[href="${activeMenuItem}"]`);
		if (activeLink) {
			activeLink.classList.add('active');
		}
	}
}

// Helper function to format file names into readable labels
function formatFileName(fileName) {
	return fileName.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

// Helper function to format category names
function formatCategoryName(category) {
	return category.charAt(0).toUpperCase() + category.slice(1);
}