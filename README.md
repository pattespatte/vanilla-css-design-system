# 🎨 Vanilla CSS Design System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CSS: 100%](https://img.shields.io/badge/css-100%25-blue.svg)](https://github.com/pattespatte/vanilla-css-design-system)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/pattespatte/vanilla-css-design-system/graphs/commit-activity)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](https://github.com/pattespatte/vanilla-css-design-system/issues)
[![Website Status](https://img.shields.io/website-up-down-green-red/http/pattespatte.github.io/vanilla-css-design-system.svg)](https://pattespatte.github.io/vanilla-css-design-system/examples/)

A lightweight, modular, and highly customizable design system built with vanilla CSS. Perfect for creating consistent and responsive web applications.

***

## 🌟 Features

- ✅ **Lightweight**: No unnecessary dependencies, just pure CSS.
- 📦 **Modular**: Easily include only what you need.
- 🎨 **Customizable**: Designed with CSS variables for easy theming.
- 📐 **Responsive**: Built with mobile-first principles.
- ✨ **Accessible**: Follows accessibility standards and best practices.

***

## 📚 Documentation

Explore the full documentation and examples here:
➡️ **[Design System Documentation](https://pattespatte.github.io/vanilla-css-design-system/examples/)**

***

## 🚀 Quick Start

1. Clone the repository:

   ```bash
   git clone https://github.com/pattespatte/vanilla-css-design-system.git
   ```

2. Install dependencies (optional):

   ```bash
   npm install
   ```

3. Start the development server (recommended for development):

   ```bash
   npm run dev
   ```

   This will:
   - Automatically switch to development mode
   - Start a local server at http://localhost:3000
   - Watch for changes in CSS and token files
   - Automatically rebuild and refresh your browser

4. Include the generated CSS in your project:

   ```html
   <link rel="stylesheet" href="styles/vanilla-combined.min.css">
   ```

### Build CSS

Combine, purge, and minify CSS:

```bash
npm run build:css
```

### Convert Between Formats

**CSS ↔ Tokens**:

  ```bash
  npm run css2tokens
  npm run tokens2css
  ```

### Development Workflow

This design system supports two modes: development and production.

#### Development Mode
In development mode, the examples use the unbuilt CSS files (`main.css`) which imports all individual CSS files. This allows for faster development and debugging.

#### Production Mode
In production mode, the examples use the optimized and minified CSS file (`vanilla-combined.min.css`) which contains only the CSS that is actually used.

#### Development Server with Hot Reload

Start a development server with automatic hot reload:

```bash
npm run dev
```

This command will:
- Switch to development mode automatically
- Start a server at http://localhost:3000
- Watch for changes in CSS and token files
- Rebuild CSS when changes are detected
- Automatically refresh your browser

#### Watch for Changes (Manual)

If you prefer to watch files without the development server:

```bash
npm run watch
```

This will watch for changes in the `styles/` and `tokens/` directories and rebuild the CSS when changes are detected.

### Lint CSS

Check and fix CSS styles:

```bash
npm run lint:css
npm run lint:css:fix
```

## Scripts Overview

| Script | Description |
|--------|-------------|
| `dev` | Start development server with hot reload. |
| `dev:build` | Build CSS and start development server. |
| `build:css` | Combine, purge, and minify CSS. |
| `css2tokens` | Convert CSS to design tokens. |
| `tokens2css` | Convert design tokens to CSS. |
| `watch` | Watch for changes and rebuild/convert files. |
| `lint:css` | Lint CSS files. |
| `lint:css:fix` | Lint and fix CSS files. |
| `switch:dev` | Switch examples to use development CSS files. |
| `switch:prod` | Switch examples to use production CSS files. |

## CDN Link

Simple usage &ndash; skip the installation steps and just include the ready-to-use combined CSS file with a CDN link to you own site:

[https://rawcdn.githack.com/pattespatte/vanilla-css-design-system/refs/tags/v1.0.2/styles/vanilla-combined.min.css](https://rawcdn.githack.com/pattespatte/vanilla-css-design-system/refs/tags/v1.0.2/styles/vanilla-combined.min.css)

Example:

```html
<link rel="stylesheet" href="https://rawcdn.githack.com/pattespatte/vanilla-css-design-system/refs/tags/v1.0.2/styles/vanilla-combined.min.css">
```

***

## 📂 Folder Structure

```plaintext
vanilla-css-design-system/
├── styles/             # CSS files (variables, components, utilities, etc.)
├── scripts/            # Helper scripts for combining, purging, and converting CSS
├── examples/           # Demo examples showcasing the design system
├── tokens/             # Design tokens for easy customization
├── README.md           # Project documentation
└── package.json        # Project dependencies and scripts
```

***

## 🛠️ Tools & Technologies

- **CSS**: Vanilla CSS with a modular architecture.
- **Stylelint**: Linting for consistent coding standards.
- **PurgeCSS**: Removes unused CSS for optimized builds.
- **Lightning CSS**: Minifies the CSS for production.
- **Nodemon**: Watches for changes and automates tasks.

***

## 👀 Examples

Check out examples showcasing the design system in action:
➡️ **[View Examples](https://pattespatte.github.io/vanilla-css-design-system/examples/)**

***

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/pattespatte/vanilla-css-design-system/blob/main/LICENSE) file for details.

***

## 📬 Contact & Contributions

- 👤 **Author**: [pattespatte](https://github.com/pattespatte)
- 💬 **Feedback**: Found an issue or have a suggestion? Open an issue or submit a pull request.
- ➡️ **[Contribute](https://github.com/pattespatte/vanilla-css-design-system/issues)**

***

## ❤️ Support

If you find this project helpful, please consider giving it a ⭐ on GitHub!
