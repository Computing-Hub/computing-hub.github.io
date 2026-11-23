# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Hand-written static HTML for **BeanWise** (CS and Maths tuition, Coderra.je Limited) plus the free Computing Hub resource collection, served by GitHub Pages at `beanwise.coderra.je` (`CNAME`). No build step, package manager, linter or tests: edit the HTML/CSS/JS and push. To preview locally, serve the repo root (e.g. `python3 -m http.server`) rather than opening files directly, because `site.js` makes HEAD requests and some icon links are root-absolute (`/favicon.ico`).

## Architecture that spans files

- **This is the Computing-Hub organisation Pages site.** Every other repo in the org with Pages enabled is served as a folder under this domain (e.g. `/pythonblocks/`, `/mathvisual/`). So links like `mathvisual/fractions.html` or `<repo-name>/` point to *other repos*, not missing files here. Only `maths/` and `diagnostic-questions/` are content that actually lives in this repo.
- **Top-level pages** (`index`, `courses`, `maths`, `pricing`, `about`, `contact`, `resources`, `school-overview`, `404`) share `assets/site.css` and `assets/site.js`. Header nav and footer are duplicated in each page — a nav/footer change must be made in every top-level page. `site.js` highlights the current nav link by filename.
- **Light/dark theming** is done with CSS custom properties on `:root` in `site.css`, overridden under `prefers-color-scheme: dark`. Use the existing tokens (`--accent`, `--surface`, `--muted`, etc.) rather than hard-coded colours; page-specific styles go in a `<style>` block in that page (see `school-overview.html`).
- **"Coming soon" cards:** `site.js` sends a same-origin HEAD request for every `.card a.open` with a relative href and adds `.soon` to the card on a non-OK response. Absolute (cross-origin) links are skipped. So a resource card can be added before its repo publishes Pages.
- **Maths interactive pages** (`maths/ks3-interactive/`, `maths/ks4-interactive/`, `maths/route-to-a-4.html`) are self-contained pages with their own styling (not `site.css`). They load `maths/inclusion-settings.js`, which adds a Settings button (easy-read font, calm motion, one-step-at-a-time, read aloud) driven by URL params (`?font=easy`, `?motion=low`, `?chunks=on`, `?audio=on`) and localStorage. `maths.html` links into these folders — the path is `maths/`, not `maths-lab/` (the README's mention of `maths-lab/` is stale).
- **Django app at `members.coderra.je`** (separate repo `Coderraje/tuition`, on Railway) handles login, the members-only library, the course builder and dashboards. Static pages link to it by absolute URL; search for `members.coderra.je` if that host changes.

## Common edits

- **Pricing** is hard-coded in `index.html` and `pricing.html` — search for `£50`.
- **Adding a resource:** copy a card in `resources.html`, set `href` to `<repo-name>/`, edit the text; optionally add it to the featured grid on `index.html`.
- **Contact form** on `contact.html` posts to Formspree.
- `courses.html` is a manual copy of the Django course list; keep it in sync by hand.

## Domain

After pushing a `CNAME` change, confirm the custom domain in the repo's Settings → Pages and enable *Enforce HTTPS* once the certificate issues. DNS is a Cloudflare CNAME `beanwise` → `computing-hub.github.io`, DNS-only (grey cloud) until GitHub issues the certificate.
