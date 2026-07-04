/**
 * header.js — injects a single, consistent header into every example page.
 *
 * Why: the 20 example HTML files hand-rolled their own <header> markup, which
 * drifted (home vs inner pages used different layouts, the site title moved
 * around, theme/mode controls were duplicated per file). This script is the
 * single source of truth — every page provides a mount point with data
 * attributes, and this script builds identical chrome on top of it.
 *
 * Mount API (place this where the header should appear in each HTML file):
 *   <div id="header-mount"
 *        data-page-title="Typography"
 *        data-home-url="../index.html"
 *        data-logo-url="../assets/images/vanilla-logo.svg"></div>
 *
 * On no-JS, the static fallback inside #header-mount remains visible (a plain
 * brand link + page-title <h1>). With JS, this script replaces that content
 * with the full header (brand + nav slot + theme + mode segmented controls),
 * then dispatches a `header:ready` CustomEvent so modes.js and main-menu.js
 * know the DOM they bind to exists.
 */
(function () {
  'use strict';

  const mount = document.getElementById('header-mount');
  if (!mount) {
    console.warn('header.js: #header-mount not found, skipping injection');
    return;
  }

  const pageTitle = mount.dataset.pageTitle || '';
  const homeUrl = mount.dataset.homeUrl || 'index.html';
  const logoUrl = mount.dataset.logoUrl || 'assets/images/vanilla-logo.svg';

  // Build the header DOM tree. Using createElement (not innerHTML) so attribute
  // values are safely escaped by the DOM and we never inject untrusted markup.
  const header = document.createElement('header');
  header.className = 'docs-nav';

  const inner = document.createElement('div');
  inner.className = 'docs-nav-inner';
  header.appendChild(inner);

  // --- Brand (left) ---
  const brand = document.createElement('a');
  brand.className = 'brand';
  brand.href = homeUrl;
  const logo = document.createElement('img');
  logo.id = 'header-logo';
  logo.src = logoUrl;
  logo.alt = '';
  brand.appendChild(logo);
  brand.appendChild(document.createTextNode('Vanilla CSS Design System'));
  inner.appendChild(brand);

  // --- Nav slot (center) — main-menu.js populates .main-menu at runtime ---
  const navSlot = document.createElement('div');
  navSlot.className = 'nav-slot';
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Main menu');
  const navToggle = document.createElement('button');
  navToggle.type = 'button';
  navToggle.className = 'nav-toggle text-size-lg';
  navToggle.setAttribute('aria-label', 'Toggle navigation');
  navToggle.textContent = '☰';
  nav.appendChild(navToggle);
  const menuList = document.createElement('ul');
  menuList.className = 'main-menu';
  menuList.setAttribute('role', 'menubar');
  nav.appendChild(menuList);
  navSlot.appendChild(nav);
  inner.appendChild(navSlot);

  // --- Controls (right): theme + mode segmented controls ---
  const controls = document.createElement('div');
  controls.className = 'controls';

  // Theme segmented control (palette). Built data-driven so adding a third
  // theme later only requires extending this array (plus its CSS rules).
  const themeControl = document.createElement('div');
  themeControl.className = 'segmented segmented--theme';
  themeControl.setAttribute('role', 'group');
  themeControl.setAttribute('aria-label', 'Color theme');
  const themes = [
    { value: 'purple-yellow', label: 'Purple/Yellow' },
    { value: 'darkblue-beige', label: 'Dark Blue/Beige' },
  ];
  themes.forEach((t) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'segmented-btn';
    btn.dataset.themeValue = t.value;
    btn.setAttribute('aria-pressed', 'false');
    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.setAttribute('aria-hidden', 'true');
    btn.appendChild(swatch);
    btn.appendChild(document.createTextNode(t.label));
    themeControl.appendChild(btn);
  });
  controls.appendChild(themeControl);

  // Mode segmented control (light/dark/auto). Icons live in <span class="icon">
  // and are swapped by modes.js based on the resolved mode.
  const modeControl = document.createElement('div');
  modeControl.className = 'segmented segmented--mode';
  modeControl.setAttribute('role', 'group');
  modeControl.setAttribute('aria-label', 'Light, dark, or automatic mode');
  const modes = [
    { value: 'light', icon: '☀️', label: 'Light' },
    { value: 'dark', icon: '🌙', label: 'Dark' },
    { value: 'auto', icon: '🖥️', label: 'Automatic' },
  ];
  modes.forEach((m) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'segmented-btn';
    btn.dataset.modeValue = m.value;
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', m.label);
    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = m.icon;
    btn.appendChild(icon);
    modeControl.appendChild(btn);
  });
  controls.appendChild(modeControl);

  inner.appendChild(controls);

  // Replace the mount's static fallback content with the built header.
  mount.replaceWith(header);

  // Page title is the first child of <main>, as the page's <h1>.
  // Home has no explicit title (the brand link IS the home identity), so emit
  // a visually-hidden h1 for assistive tech. The visible title is wrapped in
  // .container so it matches page content width; the sr-only h1 is inserted
  // bare so it does NOT become a visible grid item in <main class="grid ...">
  // (which would steal a grid cell and break the home layout).
  const main = document.querySelector('main');
  if (pageTitle) {
    const wrap = document.createElement('div');
    wrap.className = 'container';
    const h1 = document.createElement('h1');
    h1.className = 'page-title';
    h1.textContent = pageTitle;
    wrap.appendChild(h1);
    main ? main.insertAdjacentElement('afterbegin', wrap)
         : header.insertAdjacentElement('afterend', wrap);
  } else {
    const h1 = document.createElement('h1');
    h1.className = 'sr-only';
    h1.textContent = 'Vanilla CSS Design System documentation';
    main ? main.insertAdjacentElement('afterbegin', h1)
         : header.insertAdjacentElement('afterend', h1);
  }

  // Notify dependent scripts that the header DOM exists.
  document.dispatchEvent(new CustomEvent('header:ready'));
})();
