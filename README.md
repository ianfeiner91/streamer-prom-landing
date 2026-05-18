# Streamer Prom 2026 — Landing Page

Landing page for **FunnyMike's Streamer Prom 2026**, presented by FunnyMike × Fixated.

Live event: **August 8, 2026** — live on Twitch with 100+ top-tier creators.

## Stack

Plain HTML / CSS / JavaScript. No build step.

- `index.html` — single-page layout
- `css/` — base, sections, animations, responsive
- `js/main.js` — preloader, cursor, scroll reveals, counters, bar chart, video
- `images/` — event photos, polaroids, creator photos, recap video

## Local development

Any static server will work. With Python:

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173.

## Deploy

Configured for Netlify via `netlify.toml`. Push to `main` and Netlify will publish the root directory as-is.

## Partnership inquiries

brandpartnerships@fixated.com
