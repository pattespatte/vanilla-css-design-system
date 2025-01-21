# Vanilla CSS Design System

A lightweight, modular, and highly customizable design system built with vanilla CSS. Perfect for creating consistent and responsive web applications.

## Features

- **Reusable CSS Components**: Prebuilt components like buttons, cards, and forms.
- **Responsive Design**: Built with CSS media queries for seamless responsiveness.
- **Design Tokens**: Easily convert between CSS variables and design tokens for consistency across platforms.
- **Production-Ready**: Combined and minified CSS for optimized performance.
- **Atomic Design Inspired**: Follows BEM naming conventions for maintainability.
- **Developer-Friendly**: Supports both development and production modes.

---

## Getting Started

### Prerequisites

- A modern web browser.
- Basic knowledge of HTML and CSS.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/vanilla-css-design-system.git
```

2. Navigate to the project directory:

   ```bash
   cd vanilla-css-design-system
   ```

3. Include the CSS file in your HTML:

   ```html
   <link rel="stylesheet" href="path/to/vanilla-combined.min.css">
   ```

   Alternatively, for development, use the `main.css` file:

   ```html
   <link rel="stylesheet" href="styles/main.css">
   ```

---

### Folder Structure

The project is organized as follows:

```
styles/
├── base/          # Base styles (reset, typography, variables)
├── components/    # Reusable components (buttons, cards, forms)
├── layout/        # Layout utilities (containers, grids)
├── utilities/     # Helper classes (spacing, visibility)
└── custom.css     # Custom styles (optional)
examples/          # HTML examples showcasing components
scripts/           # Build and conversion scripts
```

---

### Build and Production

#### 1. Combine and Minify CSS

To generate the combined and minified CSS file (`vanilla-combined.min.css`), run:

```bash
npm install
npm run build:css
```

This will:
- Combine all CSS files into one.
- Purge unused CSS.
- Minify the output.

#### 2. Switch Between Development and Production Modes

- **Development Mode**: Use `main.css` for easier debugging.

  ```bash
  npm run dev
  ```

- **Production Mode**: Use the minified CSS file for optimized performance.

  ```bash
  npm run build
  ```

---

### Design Tokens and CSS Variables

The design system supports seamless conversion between CSS variables and design tokens.

#### Convert Between Formats

- **CSS Variables to Design Tokens**:

  ```bash
  npm run css-to-tokens
  ```

- **Design Tokens to CSS Variables**:

  ```bash
  npm run tokens-to-css
  ```

#### Example Token Structure

```json
{
  "color": {
    "primary": {
      "value": "#007bff",
      "type": "color"
    }
  }
}
```

Equivalent CSS variable:

```css
:root {
  --color-primary: #007bff;
}
```

---

### Contributing

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request with a detailed description of your changes.

---

### License

This project is licensed under the [MIT License](LICENSE).
