// Get the current script's location and extract the base URL
const scriptBasePath = document.currentScript.src.replace(/\/assets\/js\/main-menu\.js$/, '');
const examplesFolder = `${scriptBasePath}/`;

// Update elements that need the base path
document.querySelector('[data-home-link]')?.setAttribute('href', examplesFolder);

// Get references to navigation elements
const navMenu = document.querySelector('.main-menu');
const navToggle = document.querySelector('.nav-toggle');

// Toggle the main menu visibility
navToggle?.addEventListener('click', () => navMenu.classList.toggle('active'));

// Fetch and build the menu
if (navMenu) {
	fetch(examplesFolder)
		.then(response => response.text())
		.then(html => {
			const htmlFiles = html.match(/<a href="([^"]+\.html)"/g);
			if (!htmlFiles) return;

			const menuGroups = htmlFiles.reduce((groups, file) => {
				const filePath = file.match(/<a href="([^"]+\.html)"/)[1];
				const [category, fileName] = [filePath.split('/')[0], filePath.split('/').pop().replace('.html', '')];
				if (!groups[category]) groups[category] = [];
				groups[category].push({ href: `${examplesFolder}${filePath}`, label: formatFileName(fileName) });
				return groups;
			}, {});

			Object.entries(menuGroups).forEach(([category, items]) => {
				const parentLi = createMenuItem(formatCategoryName(category), items[0].href, true);
				const submenu = document.createElement('ul');
				submenu.classList.add('submenu');
				submenu.setAttribute('role', 'menu');
				submenu.hidden = true;

				items.forEach(item => submenu.appendChild(createMenuItem(item.label, item.href)));
				parentLi.appendChild(submenu);
				navMenu.appendChild(parentLi);

				parentLi.querySelector('a').addEventListener('click', (event) => {
					const isExpanded = event.target.getAttribute('aria-expanded') === 'true';
					event.target.setAttribute('aria-expanded', !isExpanded);
					submenu.hidden = isExpanded;
					if (isExpanded) event.preventDefault();
				});
			});

			initializeMenuAccessibility();
			initializeActiveMenuItem();
		})
		.catch(error => console.error('Error loading navigation:', error));
} else {
	console.error('Navigation menu element not found');
}

// Create a menu item
function createMenuItem(label, href, isCategory = false) {
	const li = document.createElement('li');
	li.setAttribute('role', 'menuitem');
	const a = document.createElement('a');
	a.href = href;
	a.textContent = label;
	if (isCategory) {
		a.setAttribute('aria-haspopup', 'true');
		a.setAttribute('aria-expanded', 'false');
		a.classList.add('category-button');
	}
	li.appendChild(a);
	return li;
}

// Initialize menu accessibility
function initializeMenuAccessibility() {
	document.querySelectorAll('.main-menu > li > a').forEach(link => {
		link.addEventListener('keydown', (e) => handleKeydown(e, link));
		const submenuLinks = link.nextElementSibling?.querySelectorAll('a');
		submenuLinks?.forEach(subLink => subLink.addEventListener('keydown', (e) => handleSubmenuKeydown(e, subLink, submenuLinks)));
	});
}

// Handle keydown events for category links
function handleKeydown(e, link) {
	const submenu = link.nextElementSibling;
	if (['Enter', ' '].includes(e.key)) {
		e.preventDefault();
		const isExpanded = link.getAttribute('aria-expanded') === 'true';
		link.setAttribute('aria-expanded', !isExpanded);
		submenu.hidden = isExpanded;
	} else if (e.key === 'ArrowDown' && submenu) {
		e.preventDefault();
		submenu.querySelector('a')?.focus();
	}
}

// Handle keydown events for submenu links
function handleSubmenuKeydown(e, link, submenuLinks) {
	const next = link.parentElement.nextElementSibling?.querySelector('a');
	const prev = link.parentElement.previousElementSibling?.querySelector('a');
	if (e.key === 'ArrowDown') {
		e.preventDefault();
		(next || submenuLinks[0]).focus();
	} else if (e.key === 'ArrowUp') {
		e.preventDefault();
		(prev || submenuLinks[submenuLinks.length - 1]).focus();
	} else if (e.key === 'Escape') {
		e.preventDefault();
		link.closest('.submenu').previousElementSibling.focus();
	}
}

// Initialize active menu item functionality
function initializeActiveMenuItem() {
	const menuLinks = document.querySelectorAll('.main-menu [role="menuitem"] > a');
	menuLinks.forEach(link => {
		link.addEventListener('click', (event) => {
			menuLinks.forEach(link => link.classList.remove('active'));
			event.currentTarget.classList.add('active');
			localStorage.setItem('activeMenuItem', event.currentTarget.getAttribute('href'));
		});
	});
	const activeMenuItem = localStorage.getItem('activeMenuItem');
	if (activeMenuItem) {
		document.querySelector(`.main-menu [role="menuitem"] > a[href="${activeMenuItem}"]`)?.classList.add('active');
	}
}

// Helper functions
function formatFileName(fileName) {
	return fileName.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function formatCategoryName(category) {
	return category.charAt(0).toUpperCase() + category.slice(1);
}