

# Redesign Blog Listing & Article Pages

The current blog pages are plain and minimal — they don't match the rest of the site's art-directed aesthetic (mouse-following glow, framer-motion stagger animations, `surface-glass` / `rim-light` / `card-glow` surfaces, Space Grotesk typography, asymmetric layout, amber accent).

## Blog Listing (`/blog`)

- **Hero header** — large asymmetric heading with staggered `framer-motion` fade-in (matching Index page pattern), uppercase tracking subtitle
- **Mouse-following amber glow** — same radial gradient effect from Index page
- **Ambient directional key light** — subtle top-right ellipse
- **Post cards** — use `surface-glass` + `rim-light` styling instead of plain bordered boxes; on hover, apply `card-glow` with amber accent border transition
- **Numbering** — add `font-mono` article numbers (`01`, `02`, etc.) like the capabilities section on Index
- **Tag pills** — keep badges but add amber accent for the first tag
- **Staggered entry animation** — each card fades in with increasing delay using the same `fade` variant pattern from Index
- **Remove the `<head>` tag** in JSX (it doesn't work in React SPA — use `useEffect` for document.title instead)

## Blog Article (`/blog/:slug`)

- **Ambient glow background** — same mouse-following glow + directional key light
- **Article header** — larger, bolder typography with staggered motion animations for title, meta, and tags
- **Content styling** — upgrade the markdown renderer's output:
  - Headings get `text-foreground` with stronger weight
  - Code blocks use `surface-glass rim-light` styling instead of plain `bg-muted`
  - Blockquote-style pull quotes if present
  - Lists get amber accent bullets/numbers
- **Back link** — animated hover with arrow slide
- **CTA footer** — use a `surface-glass rim-light` card with amber accent border instead of plain text + border-top
- **Reading progress** — subtle amber progress bar fixed at top of viewport

## Technical approach

- Add `framer-motion` animations (already installed) matching Index page patterns
- Reuse existing utility classes: `surface-glass`, `rim-light`, `card-glow`, `text-accent-glow`
- Fix the SEO meta tag approach in Blog listing (use `useEffect` instead of JSX `<head>`)
- Both pages get the mouse-following glow effect extracted as a shared pattern

