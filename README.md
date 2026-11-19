# BeanWise — beanwise.coderra.je

Front door for BeanWise (Computer Science and Maths tuition, Coderra.je Limited)
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
| `assets/images/`, `favicon.ico` | Hero artwork and the BeanWise logo (header icon and favicons) |
| `assets/videos/` | Short looping lesson clips (mp4 + poster jpg) used on `index.html` |
| `maths/`, `diagnostic-questions/` | Resource content that lives directly in this repo |

Resource cards whose folder is not yet published are marked "coming soon"
automatically by `site.js` (same-origin HEAD request).

Pricing is hard-coded in `index.html` and `pricing.html` — search for `£50` to change it.

## Domain

`CNAME` holds `beanwise.coderra.je`. After pushing, confirm the custom domain
in the repo's **Settings → Pages** and tick *Enforce HTTPS* once the certificate issues.

### Cloudflare DNS (coderra.je zone)

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `beanwise` | `computing-hub.github.io` | DNS only (grey cloud) until GitHub issues the certificate |

### What still runs on Django (`members.coderra.je`)

Login, the members-only resource library, the course builder and student dashboards
stay on the Django app (`Coderraje/tuition`, Railway). Static pages link to it via
`https://members.coderra.je/...`; search for that host if it moves to another subdomain.

No redirects are kept for `education.coderra.je`: those links were never shared, so
its DNS record is simply removed. The `tuition` record is gone: the Django app now answers
on `members.coderra.je` (login, members library, course builder). `Computing-Hub/tuition` (the old copy) can be archived.

## Adding a resource

Copy a card in `resources.html`, set `href` to `<repo-name>/` and edit the text.
Optionally add it to the featured grid on `index.html`.

## `ocr-gcse-cs/` — OCR GCSE Computer Science course

A ready-to-teach J277 course that lives directly in this repo (static, no build step).

| File | Purpose |
|------|---------|
| `ocr-gcse-cs/index.html` | Course map: 13 units, ~90 lesson slots; `ready` lessons link, the rest show as planned |
| `ocr-gcse-cs/lesson.html?l=<id>` | Renders one lesson from `content/<id>.json` |
| `ocr-gcse-cs/course.json` | Units, lesson titles, spec refs and the `ready` list |
| `ocr-gcse-cs/content/*.json` | One file per lesson: spec points, hook, explain (+ `simple` low-reading-age version), key terms, try (tasks + embeds of Computing-Hub tools), check quiz, exam questions with model answers and examiner commentary, homework, teacher notes, `i18n` translations (pt/pl/ro) |
| `ocr-gcse-cs/assets/` | `course.css`, `course.js` (settings panel, i18n, quiz, read-aloud, chunk mode, print) |

Settings travel in the URL: `?lang=pt&easy=1&font=1&motion=1&chunks=1&audio=1&contrast=1&teacher=1`.
To add a lesson: create `content/<id>.json` (copy `2-1-07.json` as a template) and add the id to `ready` in `course.json`.
Try blocks: `type` = `task` (text), `embed` (iframe of a Computing-Hub tool), `python` (in-page Pyodide runner; optional `files` map for virtual text files) or `sql` (in-page sql.js runner; `schema` holds the CREATE/INSERT statements). The Python runner executes in a Web Worker (`assets/py-worker.js`) so a Stop button can kill an infinite loop without freezing the page; `input()` blocks the worker via SharedArrayBuffer, which needs cross-origin isolation, provided by `coi-serviceworker.js` (registers once and reloads once per session). Where isolation is unavailable (e.g. Safari), the runner falls back to the main thread without Stop. Both runners load from cdn.jsdelivr.net on first Run and fall back to a link to the Python IDE / SQL Blocks if blocked.
Video placeholders: set `video.url` in the lesson JSON when the explainer is recorded; until then the brief shows in teacher view.
