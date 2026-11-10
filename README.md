# Kingdom 167 — Dirtybob

A static Kingshot community site designed for GitHub Pages. It uses plain HTML, CSS and JavaScript, so each page can be edited without a build step.

## Pages

- `index.html` — cinematic introduction and entry point
- `Home/index.html` — command-centre dashboard
- `SwordlandSummit/index.html` — event overview, legion schedule and sign-up guidance
- `AllianceBrawl/index.html` — format, eligibility and registration guidance
- `PrepWeek/index.html` — five-day preparation schedule and sign-up guidance

## Shared files

- `assets/css/style.css` — existing site styles plus the shared Dirtybob theme and responsive components
- `assets/js/main.js` — existing shared kingdom behaviour
- `assets/dirtybob-kingdom.jpg` — wide entry and dashboard key art
- `assets/css/intro.css` and `assets/js/intro.js` — responsive cinematic entry screen and stone-gate reveal
- `assets/intro-desktop.jpg`, `assets/intro-ipad.jpg`, `assets/intro-phone.jpg` — art plates composed for each screen size
- `assets/swordland-summit.jpg`, `assets/alliance-brawl.jpg`, `assets/prep-week.jpg` — event banner artwork

The new pages link to the existing GitHub Pages base path, `/Kingdom167/`. Keep that prefix in links and asset paths while the project is deployed at `kingshot167.github.io/Kingdom167`.

## Design system

The shared theme uses near-black plum backgrounds, violet panels and interactive accents, and metallic gold for kingdom highlights. Reusable layout classes include `.cc-panel`, `.cc-wrap`, `.cc-btn`, `.event-hero` and `.event-card`. Mobile layouts stack event information and use the compact bottom navigation; desktop layouts prioritize the command dashboard and multi-column event summaries.

The entry page uses a separate stylesheet so its fixed navigation rail, curtains and screen-specific artwork stay independent from the other pages. The reveal can be skipped, plays once per browser session, and is skipped automatically when reduced motion is requested.

## Future sign-ups

The current forms are intentionally guidance-only because the site is static. When Supabase is added, keep its URL and public anon key in a small shared configuration file, enforce access with database row-level security, and never put a service-role key in browser code. Connect each sign-up section to a shared JavaScript helper so validation and submission behaviour stay consistent across events.
