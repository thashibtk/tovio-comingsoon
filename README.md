# TOVIO — Coming Soon (Next.js)

Converted from the original static HTML page 1:1 — same styling, fonts,
scroll-reveal animation, background texture, and dynamic copyright year.

## Structure
- `app/layout.tsx` — root layout, page metadata + `theme-color`
- `app/page.tsx` — the page markup (client component for the year + scroll-reveal `IntersectionObserver`)
- `app/globals.css` — all original CSS, unchanged (including the Google Fonts `@import`)

## Run locally
```bash
npm install
npm run dev
```
Then open http://localhost:3000

## Build for production
```bash
npm run build
npm start
```
