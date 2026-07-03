// Select the theme buttons
const themePurpleYellow = document.getElementById('theme-purple-yellow');
const themeDarkblueBeige = document.getElementById('theme-darkblue-beige');
const themeDark = document.getElementById('theme-dark');

// Safe localStorage helpers — access throws in private/incognito mode or when
// storage is disabled, so wrap reads/writes and degrade gracefully.
const themeStorage = {
  get() {
    try {
      return localStorage.getItem('theme');
    } catch (e) {
      return null;
    }
  },
  set(theme) {
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      /* ignore quota / disabled storage */
    }
  },
};

// Get the user's saved theme from localStorage (if any)
const savedTheme = themeStorage.get();

// Function to update the active state of theme buttons
function updateActiveButton(theme) {
  // Remove active class from all buttons
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Add active class to the current theme button
  let activeButton;
  switch (theme) {
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
    // Swap the href in place rather than cloning+replacing the <link>, so the
    // browser can reuse the element instead of refetching + reparsing.
    stylesheetLink.href = newHref;
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

// Track whether the user has made an explicit theme choice. Once they have,
// stop letting OS color-scheme changes override their selection.
let userHasChosen = Boolean(savedTheme);

// Function to handle system-level color scheme changes
function handleColorSchemeChange(e) {
  if (userHasChosen) {
    return; // Respect the user's explicit selection.
  }
  const systemTheme = e.matches ? 'dark' : 'light';
  applyTheme(systemTheme);
}

// Check the initial color scheme preference and apply the theme accordingly
if (savedTheme) {
  applyTheme(savedTheme);
} else {
  applyTheme('light'); // Default to light theme
}

// Listen for system-level color scheme changes (addEventListener is the
// current standard; addListener is the deprecated alias).
prefersDarkScheme.addEventListener('change', handleColorSchemeChange);

// Listen for theme button clicks
themePurpleYellow.addEventListener('click', () => {
  userHasChosen = true;
  applyTheme('light');
  themeStorage.set('light');
});

themeDarkblueBeige.addEventListener('click', () => {
  userHasChosen = true;
  applyTheme('helix');
  themeStorage.set('helix');
});

themeDark.addEventListener('click', () => {
  userHasChosen = true;
  applyTheme('dark');
  themeStorage.set('dark');
});
