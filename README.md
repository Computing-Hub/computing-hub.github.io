# SmartBeans — smartbeans.coderra.je

Front door for SmartBeans (Computer Science and Maths tuition, Coderra.je Limited)
and the free Computing Hub resource collection. This is the GitHub Pages **organisation
site** for Computing-Hub, so every other repo in the organisation that has Pages
enabled is served as a folder beneath this domain (e.g. `/pythonblocks/`).

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Tuition-first homepage: bean-teacher hero, subjects, lesson videos, topics, how it works, pricing summary, featured resources |
| `courses.html` | Ready-made courses with estimated hours and cost (a copy of the Django course list, November 2026); "Choose & adjust" opens the Django course builder |
| `maths.html` | KS3 and GCSE Maths: topic links into `maths-lab/` and the short maths videos |
| `pricing.html` | Rates, booking/payment flow, FAQ |
| `about.html` | Tutor credentials, approach, topic coverage |
| `contact.html` | Formspree contact form, email, phone, booking link |
| `resources.html` | Tuition learning-resources library (members-only items open on the Django app) followed by the full free catalogue |
| `assets/site.css`, `assets/site.js` | Shared styles and behaviour for the pages above |
| `assets/images/`, `favicon.ico` | Hero artwork and the SmartBeans logo (header icon and favicons) |
| `assets/videos/` | Short looping lesson clips (mp4 + poster jpg) used on `index.html` |
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
| CNAME | `smartbeans` | `computing-hub.github.io` | DNS only (grey cloud) until GitHub issues the certificate |

### What still runs on Django (`tuition.coderra.je`)

Login, the members-only resource library, the course builder and student dashboards
stay on the Django app (`Coderraje/tuition`, Railway). Static pages link to it via
`https://tuition.coderra.je/...`; search for that host if it moves to another subdomain.

No redirects are kept for `education.coderra.je` or `tuition.coderra.je`: those
links were never shared, so their DNS records are simply removed and `Computing-Hub/tuition` (the old copy) is archived.

## Adding a resource

Copy a card in `resources.html`, set `href` to `<repo-name>/` and edit the text.
Optionally add it to the featured grid on `index.html`.
