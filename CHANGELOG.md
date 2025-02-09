# Changelog

## [1.0.2] - 2025-02-09

### What's New in 1.0.2

#### Tooling & Build Process

- **Enhanced Theming and Customization:** Improved CSS variable handling for easier theming, leveraging the `css2tokens` and `tokens2css` scripts for better design token management.
- **Optimized CSS:**  Purged unused CSS rules using PurgeCSS, resulting in a smaller `vanilla-combined.min.css` file and faster load times.
- **Improved Accessibility:** Addressed potential accessibility issues based on best practices.
- **Bug Fixes:** Resolved minor layout issues and inconsistencies across different browsers.

#### Build System Improvements

- Improved CSS post-processing with better `:root` declaration merging
- Enhanced PurgeCSS configuration with safer defaults for dynamic classes
- Added support for switching between development and production modes

#### Developer Experience

- Added comprehensive documentation for build scripts and tooling
- Improved token conversion error handling and logging
- Enhanced support for CSS variable references in design tokens

## [1.0.1] - Previous Release Date

### What's New in 1.0.1

- Fixed menu item overlap issue with the dark mode toggle button.
- Improved layout and alignment with flexbox.
