# Why BeanWise runs as two sites

BeanWise is split across two hosts:

| URL | What it serves | Repo | Host |
|-----|----------------|------|------|
| `beanwise.coderra.je` | Public site: homepage, courses, pricing, about, contact, and the free Computing Hub resources | `Computing-Hub/computing-hub.github.io` (this repo) | GitHub Pages |
| `members.coderra.je` | Members app: login, members-only library, course builder, bookings, SumUp payments, student dashboards | `Coderraje/tuition` | Railway (Django + PostgreSQL), deploys from `main` |

The split was made on 8 November 2026 (`Coderraje/tuition` commits `e92e5da`
and `026d35f`). The free activities moved from `education.coderra.je` to this
static site, first as `smartbeans.coderra.je` and then as `beanwise.coderra.je`,
and the Django app moved to `members.coderra.je`. The reasons below were written
up afterwards. They describe why the split makes sense, not a decision record
from the time.

## Reasons

1. **Only some features need a server.** Logins, member-only access, bookings,
   payments and dashboards need a backend and a database, so they live in
   Django on Railway. The free activities are plain HTML, CSS and JavaScript,
   so they need nothing more than static hosting.

2. **Cost and reliability.** GitHub Pages is free, served from a CDN and needs
   no maintenance. Railway is billed by usage. Keeping public and search
   traffic on Pages means free visitors cost nothing and never slow down the
   paid app, and the public site stays up if Railway has an outage.

3. **The whole organisation publishes under one domain.** This repo is the
   Computing-Hub *organisation* Pages site, so every other Computing-Hub repo
   with Pages enabled appears as a folder under the same domain (e.g.
   `/pythonblocks/`, `/python-fundamentals/`). New tools join the free
   collection by enabling Pages on their own repo, without being copied into
   Django.

4. **Paid content must stay private.** Anything published through GitHub
   Pages is public to anyone with the URL, even when the source repo is
   private. Members-only material therefore stays behind the Django login.

5. **The public site is the front door.** It markets the tuition with the
   homepage, pricing and free samples, then links to `members.coderra.je` to
   log in, build a course or pay.

## The cost of the split

Some content exists in both places and has to be kept in sync by hand:

- `courses.html` is a manual copy of the Django course list.
- The homepage cards on this site and on the Django home page
  (`templates/core/home.html` in `Coderraje/tuition`) are written separately
  and can drift apart.
- Links between the two sites are absolute URLs. If either host changes,
  search both repos for `members.coderra.je` and `beanwise.coderra.je`.
  Resource links stored in the Django database (`Resource.url`,
  `PlannerTopic.activity_url`) need a data migration, as was done in
  `courses/0010` and `courses/0011`.

## Where a change goes

- Public pages, pricing, marketing copy or a free resource: this repo. It goes
  live when merged into `main`.
- Anything behind a login, payments, bookings or the members library:
  `Coderraje/tuition`. Railway deploys it when merged into `main`.
- A new free tool: its own Computing-Hub repo with Pages enabled, plus a card
  in `resources.html` (and optionally `index.html`) here.
