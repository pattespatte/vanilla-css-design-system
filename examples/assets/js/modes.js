/**
 * modes.js — orthogonal theme × mode controller.
 *
 * Two independent attributes on <html>:
 *   data-theme = "purple-yellow" | "darkblue-beige"   (palette)
 *   data-mode  = "light" | "dark" | "auto"             (mode; "auto" follows
 *                                                       the OS prefers-color-scheme)
 *
 * Defaults (no saved preference): purple-yellow theme + auto mode.
 * Selections persist across reloads via localStorage (best-effort — storage may
 * be disabled in private mode, in which case we silently fall back).
 *
 * Listens for the `header:ready` event (dispatched by header.js) before
 * binding, so this works regardless of whether the header was injected or is
 * already present in the document.
 */
(function () {
  'use strict';

  const DEFAULT_THEME = 'legacy';
  const DEFAULT_MODE = 'auto';
  const THEME_KEY = 'theme';
  const MODE_KEY = 'mode';

  // One-time migration: prior versions used 'purple-yellow' and
  // 'darkblue-beige' as the theme attribute values. They were renamed to
  // 'legacy' and 'helix' respectively. Silently rewrite stored values so
  // existing users keep their chosen theme; the [data-theme] alias in
  // helix/theme.css covers the same rewrite at the CSS layer.
  const THEME_MIGRATION = {
    'purple-yellow': 'legacy',
    'darkblue-beige': 'helix',
  };

  // Safe localStorage helpers — access throws in private/incognito mode or
  // when storage is disabled, so wrap reads/writes and degrade gracefully.
  const storage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        /* ignore quota / disabled storage */
      }
    },
  };

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  // Resolve the effective light/dark mode. "auto" → check the OS preference.
  function resolveMode(mode) {
    if (mode === 'auto') return prefersDark.matches ? 'dark' : 'light';
    return mode;
  }

  // Apply the chosen theme + mode to <html>. The theme attribute is the
  // user's palette pick. The mode attribute is set to the RESOLVED light/dark
  // value (so CSS rules keyed on [data-mode="light"|"dark"] apply correctly
  // even when the user picked "auto"); the user's choice is tracked separately
  // on data-mode-choice so syncControls can show which button is pressed.
  function applyState(theme, mode) {
    const root = document.documentElement;
    const resolved = resolveMode(mode);
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-mode', resolved);
    root.setAttribute('data-mode-choice', mode);
    updateStylesheet(resolved);
    syncControls(theme, mode);
  }

  // Swap the highlight.js stylesheet to match the resolved light/dark mode.
  function updateStylesheet(resolved) {
    const link = document.querySelector('link[rel="stylesheet"][href*="styles/a11y"]');
    if (!link) return;
    const newHref = resolved === 'dark'
      ? 'https://unpkg.com/@highlightjs/cdn-assets@11.4.0/styles/a11y-dark.min.css'
      : 'https://unpkg.com/@highlightjs/cdn-assets@11.4.0/styles/a11y-light.min.css';
    // Swap href in place so the browser reuses the <link> element.
    link.href = newHref;
  }

  // Update the segmented controls to reflect the current state.
  function syncControls(theme, mode) {
    const resolved = resolveMode(mode);

    document.querySelectorAll('.segmented--theme .segmented-btn').forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.dataset.themeValue === theme ? 'true' : 'false');
    });

    document.querySelectorAll('.segmented--mode .segmented-btn').forEach((btn) => {
      const pressed = btn.dataset.modeValue === mode;
      btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      // Auto button keeps its system icon; the small "A" badge is the only
      // signal that it is set to automatic. We do NOT swap to sun/moon even
      // when we know the resolved mode, so the user can always tell the
      // button apart from explicit Light/Dark picks.
    });
  }

  // Wire up click handlers on the segmented controls. Safe to call repeatedly —
  // listeners are attached to each button exactly once via data-hook flag.
  function bindControls() {
    document.querySelectorAll('.segmented--theme .segmented-btn').forEach((btn) => {
      if (btn.dataset.hooked) return;
      btn.dataset.hooked = '1';
      btn.addEventListener('click', () => {
        const theme = btn.dataset.themeValue;
        storage.set(THEME_KEY, theme);
        applyState(theme, currentMode());
      });
    });

    document.querySelectorAll('.segmented--mode .segmented-btn').forEach((btn) => {
      if (btn.dataset.hooked) return;
      btn.dataset.hooked = '1';
      btn.addEventListener('click', () => {
        const mode = btn.dataset.modeValue;
        storage.set(MODE_KEY, mode);
        applyState(currentTheme(), mode);
      });
    });
  }

  function currentTheme() {
    let stored = storage.get(THEME_KEY) || DEFAULT_THEME;
    if (THEME_MIGRATION[stored]) {
      stored = THEME_MIGRATION[stored];
      storage.set(THEME_KEY, stored);
    }
    return stored;
  }

  function currentMode() {
    return storage.get(MODE_KEY) || DEFAULT_MODE;
  }

  // When the OS color-scheme changes, only re-resolve if the user is on auto.
  // An explicit Light/Dark pick must not be overridden by the OS.
  prefersDark.addEventListener('change', () => {
    if (currentMode() === 'auto') {
      applyState(currentTheme(), 'auto');
    }
  });

  // Initialise. Wait for header:ready so the controls exist before we bind.
  function init() {
    bindControls();
    applyState(currentTheme(), currentMode());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  document.addEventListener('header:ready', init);
})();
