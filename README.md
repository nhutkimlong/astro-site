# Astro Migration (Zero-Breaking)

This project wraps your existing static site inside an Astro workspace **without changing any HTML/CSS/JS**.
Everything from your current site is placed under `/public`, so routes and behaviors stay intact.

## Run locally
```bash
# 1) Install deps
npm i

# 2) Start dev server
npm run dev
# open http://localhost:4321
```

## Build for production
```bash
npm run build
npm run preview
```

## Next Steps (progressive enhancement)
- Convert a page to `src/pages/<page>.astro` only when you want to add components/partials.
- Keep legacy pages in `/public` for zero-risk behavior.
- You can introduce Tailwind, SSG, islands, etc., incrementally.
