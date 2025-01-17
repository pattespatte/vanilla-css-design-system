# Vanilla CSS Design System

A design system built with vanilla CSS to provide a consistent look and feel across your web applications.

## Features

- Reusable CSS components
- Consistent design patterns
- Easy to integrate into any project
- Well-organized file structure for maintainability
- Responsive design using CSS media queries
- Comprehensive documentation with examples
- Naming conventions inspired by Atomic Design or BEM

## Getting Started

### Prerequisites

- A modern web browser
- Basic knowledge of HTML and CSS

### Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/your-username/vanilla-css-design-system.git
    ```

2. Navigate to the project directory:

    ```sh
    cd vanilla-css-design-system
    ```

3. Include the CSS file in your HTML:

    ```html
    <link rel="stylesheet" href="path/to/your/css/file.css">
    ```

    The main css file `main.css` imports all other css files.

    The folder structure is as follows:
    - `styles/`: contains all css files
        - `base/`: contains css files with base styles, such as reset, typography and variables
        - `components/`: contains the css for the components such as buttons, cards and forms
        - `layout/`: contains the css files for layout such as containers and grids
        - `utilities/`: contains the css files for helpers and spacing
    - `examples/`: contains the html files to showcase all the components in the design system. This file is not included in the `main.css` file and is only used for demonstration purposes.

### Combined and Minified CSS

You can use the combined and minified CSS file for easier integration into your projects. This file includes all the styles from the design system:

- **Filename**: `vanilla-combined.min.css`

#### How to Generate the File

To generate the combined and minified CSS file yourself, follow these steps:

1. Clone the repository and navigate to the project folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the build script:

   ```bash
   npm run build:css
   ```

4. The `vanilla-combined.min.css` file will be created in the project root.

Alternatively, download the prebuilt `vanilla-combined.min.css` file from the [GitHub Releases](https://github.com/pattespatte/vanilla-css-design-system/releases).

### Usage

Use the provided CSS classes in your HTML to apply the design system styles. For example:

```html
<div class="container">
  <button class="btn btn-primary">Primary Button</button>
  <div class="card">
    <div class="card-body">
      <h2 class="card-title">Card title</h2>
      <p class="card-text">This is an example card using some components of the design system.</p>
    </div>
  </div>
</div>
```

### Development and Production Modes

The design system supports two modes of operation:

#### Development Mode

In development mode, the system uses `main.css` which loads individual CSS files separately. This is useful for development as it makes debugging easier.

To switch to development mode:

```bash
npm run dev
```

#### Production Mode

In production mode, the system uses the combined and minified CSS file (`vanilla-combined.min.css`). This is optimized for production use as it reduces HTTP requests and file size.

To build and switch to production mode:

```bash
npm run build
```

This command will:

1. Combine all CSS files into one
2. Minify the combined CSS
3. Switch all HTML files to use the minified version

#### Switching Between Modes

You can switch between modes at any time using the npm scripts:

- `npm run dev` - Switch to development mode
- `npm run build` - Build files and switch to production mode

Note: Make sure you have run `npm install` first to install the required dependencies for mode switching.

## Contributing

Contributions are welcome! We appreciate any help with bug fixes, new features, or documentation improvements. To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request with a detailed description of your changes, including the purpose and any relevant context.

If you have any questions or need assistance, feel free to reach out!

## License

This project is licensed under the [MIT License](LICENSE).
