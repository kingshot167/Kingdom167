# Kingdom 167 — Dirtybob

A static Kingshot community site designed for GitHub Pages. It uses plain HTML, CSS and JavaScript, so each page can be edited without a build step.

## Pages

- `index.html` — cinematic introduction and entry point
- `Home/index.html` — command-centre dashboard
- `SwordlandSummit/index.html` — event overview, legion schedule and sign-up guidance
- `AllianceBrawl/index.html` — format, eligibility and registration guidance
- `PrepWeek/index.html` — five-day preparation schedule and sign-up guidance
- `Rankings/index.html` — JSON-backed Top 100 leaderboard selector and alliance filters
- `EventCalendar/index.html` — kingdom schedule starter page
- `KvKCommandBoard/index.html` — KvK planning and assignment starter page
- `RecognitionBoard/index.html` — member and alliance recognition starter page
- `ResourceLibrary/index.html` — guides and tools library starter page
- `Announcements/index.html` — kingdom notices starter page
- `EventRosters/index.html` — event roster hub, with subpages for Flame Dragon Tyrant, Sanctuaries, Swordland Summit, and Alliance Brawl
- `ContactUs/index.html` — contact options and links to the relevant kingdom pages and existing alliance directory
- `KingdomDirectory/index.html` — player directory starter page with privacy and data-source placeholders
- `RulesFAQ/index.html` — Kingdom 167 community rules, poster, and common questions
- `PocketHoldout/index.html` — original browser arcade mini-game starring StreetDoc and Dirtybob
- `GiftCode/index.html` — Kingshot gift-code list and redemption page

## Shared files

- `assets/css/style.css` — existing site styles plus the shared Dirtybob theme and responsive components
- `assets/js/main.js` — existing shared kingdom behaviour
- `assets/data/giftcodes.json` — active code snapshot used by the Gift Code page
- `.github/workflows/update-giftcodes.yml` — checks Kingshot.net three times daily and commits list changes
- `scripts/fetch_giftcodes.py` — reads Kingshot.net's public gift-code feed; it does not redeem codes
- `.github/workflows/update-leaderboards.yml` and `scripts/fetch_leaderboards.py` — refresh MightPulse rankings and all five alliance rosters in one snapshot
- `assets/data/leaderboards.json` — local Top 100, alliance member rosters, and alliance summary snapshot read by the Rankings and Alliances hub pages
- `assets/css/alliance-members.css` and `assets/js/alliance-members.js` — shared role-grouped member cards for alliance profiles
- `assets/dirtybob-kingdom.jpg` — wide entry and dashboard key art
- `assets/css/intro.css` and `assets/js/intro.js` — responsive cinematic entry screen and violet flame reveal
- `assets/intro-desktop.jpg`, `assets/intro-ipad.jpg`, `assets/intro-phone.jpg` — art plates composed for each screen size
- `assets/swordland-summit.jpg`, `assets/alliance-brawl.jpg`, `assets/prep-week.jpg` — event banner artwork

The new pages link to the existing GitHub Pages base path, `/Kingdom167/`. Keep that prefix in links and asset paths while the project is deployed at `kingshot167.github.io/Kingdom167`.

## Design system

The shared theme uses near-black plum backgrounds, violet panels and interactive accents, and metallic gold for kingdom highlights. Reusable layout classes include `.cc-panel`, `.cc-wrap`, `.cc-btn`, `.event-hero` and `.event-card`. Mobile layouts stack content and open the side panel from the top bar; desktop layouts prioritize the command dashboard and multi-column summaries.

The entry page uses a separate stylesheet so its fixed navigation rail, reveal effect and screen-specific artwork stay independent from the other pages. The reveal plays once per browser session and is skipped automatically when reduced motion is requested.

## Future sign-ups

The current forms are intentionally guidance-only because the site is static. When Supabase is added, keep its URL and public anon key in a small shared configuration file, enforce access with database row-level security, and never put a service-role key in browser code. Connect each sign-up section to a shared JavaScript helper so validation and submission behaviour stay consistent across events.

## Future hub chat

Plan a responsive, integrated hub chat for the Kingdom community, sized for roughly 200–300 members with around 50 likely active chatters. The site is static, so chat will need a hosted backend; Supabase Auth and Realtime are the preferred starting point and fit the site's existing direction. Start on the free tier and review actual usage against its quotas before launch and as the community grows. Include sign-in, row-level security, basic moderation controls, and spam/rate limiting. Keep the Supabase service-role key out of browser code. Treat free-tier availability and limits as subject to change; re-evaluate hosting if usage or reliability needs exceed them.

## Future plans checklist

- [ ] Connect the Member Portal to Supabase Auth for email/password accounts, password recovery, and Discord OAuth.
- [ ] Add a member profile with KingShot Player ID and Discord linking, protected by row-level security.
- [ ] Replace the preview-only portal controls once secure authentication and account storage are configured.
- [x] Add the GitHub Actions MightPulse refresh, normalize the Top 100 boards, tag player rankings, and publish five role-grouped alliance rosters with names and avatars. Keep the API key out of browser code and committed files.
- [ ] Add the `MIGHTPULSE_API_KEY` repository secret, run the first refresh on `Dirtybob`, and confirm the returned board format and alliance matching before enabling scheduled refresh on the default branch.
- [ ] Connect the event calendar, KvK command board, recognition board, resource library, and announcements to an editable content source when ready.
- [ ] Connect Event Rosters pages to member sign-ups, role assignments, and event-specific schedules.
- [ ] Add a language selector for international members, starting with English and adding reviewed translations. Store translated interface text separately from page layout and remember each visitor's language choice on their device.

The leaderboard JSON is a normalized display snapshot. Each `leaderboards` entry uses a MightPulse board slug and contains `kind` (`player` or `alliance`) plus `entries` (up to 100 rows). Player rows include `rank`, `governor_id`, `nick_name`, `score`, and `alliance_abbr`; alliance rows include `rank`, `aid`, `abbr`, `name`, and `score`. The page reads only this local JSON file; the MightPulse key stays in GitHub Actions and is never exposed to visitors.

`player_ids_by_alliance` contains governor IDs for the listed alliance tags within Kingdom 167 only. MightPulse lookups include kingdom ID `167`, so matching tag names from other kingdoms are not included.

To enable a refresh, add a repository Actions secret named `MIGHTPULSE_API_KEY` in GitHub Settings → Secrets and variables → Actions. A push to `Dirtybob` that changes the fetch script or workflow triggers a refresh. GitHub requires the workflow file to exist on the default branch before its manual **Run workflow** button or daily schedule can run; from that button, select `Dirtybob` as the run branch when available. The daily run is scheduled for 03:17 UTC (13:17 Brisbane time). This setup does not merge anything into production.
