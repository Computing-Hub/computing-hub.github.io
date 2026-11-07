# SmartBeans — smartbeans.coderra.je

Front door for SmartBeans (Computer Science and Maths tuition, Coderra.je Limited)
and the free Computing Hub resource collection. This is the GitHub Pages **organisation
site** for Computing-Hub, so every other repo in the organisation that has Pages
enabled is served as a folder beneath this domain (e.g. `/pythonblocks/`).

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Tuition-first homepage: subjects, how it works, pricing summary, featured resources |
| `pricing.html` | Rates, booking/payment flow, FAQ |
| `about.html` | Tutor credentials, approach, topic coverage |
| `contact.html` | Formspree contact form, email, phone, booking link |
| `resources.html` | The full free-resources catalogue (formerly the Computing Hub homepage) |
| `assets/site.css`, `assets/site.js` | Shared styles and behaviour for the pages above |
| `maths/`, `diagnostic-questions/` | Resource content that lives directly in this repo |

Resource cards whose folder is not yet published are marked "coming soon"
automatically by `site.js` (same-origin HEAD request).

Pricing is hard-coded in `index.html` and `pricing.html` — search for `£50` to change it.

## Domain

`CNAME` holds `smartbeans.coderra.je`. After pushing, confirm the custom domain
in the repo's **Settings → Pages** and tick *Enforce HTTPS* once the certificate issues.

### Cloudflare DNS (coderra.je zone)

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `smartbeans` | `computing-hub.github.io` | DNS only (grey cloud) until the GitHub cert is issued, then either |
| CNAME | `education` | `computing-hub.github.io` | Proxied (orange cloud) — needed for the redirect rule |
| CNAME | `tuition` | `computing-hub.github.io` | Proxied (orange cloud) — needed for the redirect rule |

### Redirects for the old subdomains (Cloudflare → Rules → Redirect Rules)

GitHub Pages serves one custom domain per repo, so the old hostnames must be
redirected at Cloudflare. Two **dynamic** 301 rules:

1. *education → smartbeans* (keeps the path, so deep links to resources survive)
   - If: `http.host eq "education.coderra.je"`
   - Then: Dynamic redirect, `concat("https://smartbeans.coderra.je", http.request.uri.path)`, 301, preserve query string

2. *tuition → smartbeans*
   - If: `http.host eq "tuition.coderra.je"`
   - Then: Static redirect to `https://smartbeans.coderra.je/`, 301

Once rule 2 is live the archived `Computing-Hub/tuition` repo (and its Railway
deployment, if still running) can be switched off.

## Adding a resource

Copy a card in `resources.html`, set `href` to `<repo-name>/` and edit the text.
Optionally add it to the featured grid on `index.html`.
