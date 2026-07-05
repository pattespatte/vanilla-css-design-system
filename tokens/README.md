# Design tokens

Generated from `styles/variables/*.css` (structural) and `styles/themes/*/tokens.css` (per-theme palette) by `scripts/css-to-tokens.js`. Regenerate with `bun run css2tokens`.

## File structure

```
tokens/
├── README.md             ← this file
├── borders.json          ← structural (theme-independent)
├── breakpoints.json      ← structural
├── spacing.json          ← structural
├── typography.json       ← structural
├── other.json            ← structural (opacity, shadows, transitions)
├── legacy-tokens.json    ← legacy theme palette + alias mapping
└── helix-tokens.json     ← helix theme palette + alias mapping
```

## Structural vs theme tokens

**Structural** files (`borders.json`, `breakpoints.json`, `spacing.json`, `typography.json`, `other.json`) come from `styles/variables/*.css`. They are theme-independent — every theme uses the same spacing scale, breakpoints, etc.

**Theme** files (`legacy-tokens.json`, `helix-tokens.json`) come from `styles/themes/<name>/tokens.css`. They contain both the theme's raw palette (e.g. `helix.darkblue.500`) and its alias mapping onto the neutral `--color-*` aliases (under the `<themeName>` top-level key, e.g. `helix.color.primary`).

## Two-tier structure of theme files

Each `<themeName>-tokens.json` has two kinds of content downstream consumers should know about:

```jsonc
{
  // 1. Raw palette at the top level, namespaced under the theme name:
  "helix": {
    "darkblue": { "500": { "$value": "#3b4992", "$type": "color" }, ... },
    "beige":    { "300": { "$value": "#d4c4a3", "$type": "color" }, ... },
    // ...
  },

  // 2. Alias mapping — how the theme maps --color-* aliases to its tokens:
  "helix": {
    "color": {
      "primary": { "$value": "{helix.color.primary}", ... },
      // ...
    }
  }
}
```

The two `helix` subtrees are merged by `Object.assign` in `css-to-tokens.js`. When consuming, treat the file as: top-level raw palette + a `<themeName>` subtree containing the alias mapping.

## Reverse pipeline

`scripts/tokens-to-css.js` walks this directory and writes one CSS file per JSON into `styles/variables/`. Theme token files (`*-tokens.json`) would generate `styles/variables/*-tokens.css` — currently unused by `main.css` since theme tokens live in `styles/themes/`. The reverse pipeline primarily exists for the structural tokens.

## Figma sync

`scripts/css-to-figma.js` exports tokens to `figma/*.json` for the Figma Tokens plugin. Check that script's source for the current export mapping if you need to update it after structural changes here.
