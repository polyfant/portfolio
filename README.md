# polyfant — Portfolio

Single-page portfolio for [github.com/polyfant](https://github.com/polyfant), meant to be linked from LinkedIn and GitHub.

Plain HTML/CSS/JS — **no build step, no dependencies**. The only external requests are Google Fonts (Archivo + JetBrains Mono).

## Preview locally

```bash
python -m http.server 8741
# open http://localhost:8741
```

(Any static file server works; opening `index.html` directly also works.)

## Deploy

### Option A — GitHub Pages

1. Create a new public repo (e.g. `polyfant/portfolio` or `polyfant/polyfant.github.io`).
2. Push these files to the repo root (`index.html`, `styles.css`, `script.js`, `favicon.svg`).
3. Repo → Settings → Pages → Source: *Deploy from a branch* → `main` / root.
4. Live at `https://polyfant.github.io/<repo>/` in a minute or two.

### Option B — Vercel / Netlify

Drag the folder into [vercel.com/new](https://vercel.com/new) or [app.netlify.com/drop](https://app.netlify.com/drop) — zero config, instant URL. Add a custom domain later if you want.

## Structure

| File | Purpose |
|------|---------|
| `index.html` | All content — edit copy here |
| `styles.css` | Design tokens (colors/fonts at the top), layout, scroll animations |
| `script.js` | IntersectionObserver reveals, nav states, hero particle field |
| `favicon.svg` | `>_` mark, amber on carbon |

## Notes

- **Motion architecture:** base CSS shows the *final* state; reveal/scroll-scrubbed states only activate when JS runs and `prefers-reduced-motion` is not set. Scroll-scrubbing (the 340-day timeline, hero parallax) uses CSS scroll-driven animations where supported, with an IntersectionObserver fallback — no scroll listeners anywhere.
- **Design tokens:** colors and fonts are the `:root` block at the top of `styles.css`. Accent is ember amber (`oklch(80% .13 78)`); swap one variable to retune the whole site.
- Screenshots from the review pass live in `review/` — safe to delete.
