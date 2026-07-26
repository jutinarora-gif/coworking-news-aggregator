
# The Coworking Dispatch — India-first coworking news & community

News + community platform. Dispatches (articles) are aggregated automatically from RSS feeds, weighted 70% India / 30% global, enriched with community reviews, Q&A, weekly winners, and a map of Indian spaces. Vapor Chrome iridescent aesthetic inspired by Station F.

## Scope (v1)

Full community platform with accounts, RSS-aggregated dispatches on day one, a **rich review corpus seeded with 100+ realistic reviews**, plus an admin panel for feeds, features, and native editorial dispatches.

## Content model: RSS-first

Dispatches come from RSS, not manual writing. An admin-curated feed list is polled on a schedule; new items become dispatches automatically.

- **Feed sources (seeded):** India (YourStory, Inc42, ET Startups/Realty, Moneycontrol, WeWork India, Awfis, 91springboard, Table Space blogs) + global (Coworker.com, AllWork.Space, Deskmag, Coworking Insights).
- **Ingestion:** scheduled server route `/api/public/cron/ingest-rss` (pg_cron every 30 min, bearer-protected via `CRON_SECRET`). Parses items with `fast-xml-parser`, upserts by `guid`, extracts cover from enclosure / `media:content` / og-image fallback, sanitizes excerpt HTML.
- **70/30 mix:** each feed carries `region: india|global`; the feed query interleaves buckets 7:3 by `published_at`. User toggle overrides to India-only / Global-only / All.
- **Read view:** cards show source, favicon, region flag, time, excerpt. Detail page shows sanitized excerpt + "Read on {source} →" (link-out, no full-text mirroring). Community layer — comments, votes, save, space-tagging — lives on our side.
- **Space linking:** dispatches auto-link to a space by name/alias keyword match; admins can edit. Space profiles show recent dispatches mentioning them.
- **Editorial dispatches:** admin can also write native dispatches (Space of the Week note, weekly digest) with `source_type: 'editorial'`.
- **Moderation:** admin can hide dispatches, block feeds, edit title/excerpt/cover.

## Seeded reviews (100+)

To ship a lived-in feel on day one:

- **Volume & distribution:** ≥120 reviews across ~20 seeded spaces, ~4–8 per space, skewed slightly to a few flagship spaces (10–12 reviews) so leaderboards feel real.
- **Realism:** varied ratings (mostly 3.5–4.8 with a sprinkling of 2s and 5s), plausible pros/cons written in a natural voice, mix of short and long bodies, structured sub-ratings (wifi / quiet / community / coffee / value), 20–30% include 1–2 photo URLs from open-license coworking imagery.
- **Attribution:** posted by a small pool of ~30 seed "community" author profiles (display name + avatar, `is_verified_coworker` mostly true, no auth logins — these are `profiles` rows without a matching `auth.users` entry, allowed by dropping the FK-to-auth on `profiles` and keying by uuid, OR by pre-provisioning demo auth users; I'll use the FK-less profiles approach so no fake auth accounts are created).
- **Time distribution:** `created_at` spread over the last 6 months so leaderboards, "recent" filters, and Top Winners have signal.
- **Delivery:** literal `INSERT` statements in the seed migration — per project rules, seed rows ship via migration SQL, not runtime insertion or generation on first load.
- **Downstream signal:** review volume + ratings feed the weekly winners score; ~50 seed `votes` and ~15 seed `questions`/`answers` are included so Q&A and vote counts look active too.

## Design direction

- **Palette (Vapor Chrome):** #c4b5fd, #818cf8, #67e8f9, #a5f3fc on deep near-black; iridescent multi-stop gradients on hero, hover glows, card borders, CTAs.
- **Feel:** modern, cool, editorial; generous whitespace; frosted-glass cards; subtle grain; smooth motion.
- **Wordmark:** "The Coworking Dispatch" with a gradient underline.
- Station F–inspired gradients only; layout/composition are ours.

## Core sitemap

```text
/                            Home: hero + search, Space of the Week, Top Winners, India/Global dispatch feed, map teaser, newsletter CTA
/dispatches                  Aggregated feed with filters (India / Global / All, source, city, tag)
/dispatches/$slug            Excerpt + "Read on source", related dispatches, linked space, comments
/spaces                      Directory: search + filters + India map view
/spaces/$slug                Overview, amenities, reviews, Q&A, sales-question checklist, recent dispatches
/winners                     Weekly leaderboard archive
/questions                   Community Q&A / AMA feed
/questions/$id               Thread
/submit                      Submit a space / suggest a feed (auth-gated)
/auth                        Sign in / sign up (email + Google)
/_authenticated/dashboard    Saved dispatches, my reviews, questions
/_authenticated/admin        Admin CMS (role-gated): feeds, dispatches, spaces, weekly picks, moderation
/about, /newsletter          Static
```

## Feature set

**Requested**
1. RSS-aggregated dispatches, India-weighted 70/30, with India/Global/All toggle.
2. Coworking Space of the Week — pinned hero card on home.
3. Questions to ask the salesperson — curated checklist per space, copyable, community upvotes.
4. Top Winners this week — leaderboard by weighted score (reviews + upvotes + dispatch mentions).
5. Global search — sticky `Cmd/Ctrl+K` over spaces, dispatches, questions, cities, sources.
6. Real user reviews — verified-coworker badge, structured ratings, photos, pros/cons — **seeded with 120+ reviews**.

**Engagement**
7. Weekly newsletter signup for the Dispatch digest.
8. India city map — clustered pins, filter by city/tier, list ↔ map split.
9. Community Q&A / AMA — upvotes, AMA tag.

**Additions**
10. Vibe tags on spaces.
11. Compare drawer (up to 3 spaces).
12. Founder replies on reviews (verified badge).
13. Auto-composed "This Week's Dispatch" digest → newsletter.
14. Save & collections for spaces and dispatches.
15. Report / flag on user content.
16. Suggest-a-feed (admin-approved).

## Data model (Lovable Cloud)

All tables with RLS + explicit GRANTs; `has_role()` SECURITY DEFINER for role gating.

- `profiles` (id uuid pk, auth_user_id nullable → auth.users, display_name, avatar_url, city, is_verified_coworker) — nullable FK lets seed authors exist without auth users
- `user_roles` (user_id, role: admin | moderator | user)
- `cities`, `spaces` (with `aliases text[]`, `is_published`)
- `feeds` (url, source_site, region, is_active, last_polled_at, last_status, added_by, approved)
- `dispatches` (feed_id nullable, source_type, guid, title, slug, excerpt, cover_url, source_url, source_name, region, city_id, linked_space_id, tags, published_at, ingested_at, is_hidden, is_featured, author_id, body_md)
- `dispatch_comments`, `space_of_week`
- `reviews` (space_id, profile_id → profiles.id, rating_overall, rating_wifi, rating_quiet, rating_community, rating_coffee, rating_value, pros, cons, body, photos jsonb, created_at)
- `questions`, `answers`, `votes`, `sales_questions`, `saves`, `newsletter_subscribers`, `weekly_winners`

Reviews are keyed to `profiles.id` (not `auth.users.id`) so seeded community authors can post them; real users get a profile row auto-created on signup that also links to `auth.users`. RLS on reviews: public SELECT on non-hidden rows; INSERT/UPDATE/DELETE require the row's `profile_id` to map to an `auth_user_id = auth.uid()` (so real users can only touch their own; seed rows are read-only in the app).

## Technical approach

- **Stack:** TanStack Start, Tailwind v4, shadcn, Lovable Cloud (email + Google auth).
- **Server fns:** `createServerFn` for reads/writes; `requireSupabaseAuth` for user actions; publishable-key server client for public lists.
- **RSS ingestion:** Worker-compatible parser (`fast-xml-parser`) + allowlist HTML sanitizer; scheduled server route, `CRON_SECRET` header check.
- **Feed mix:** SQL interleave 7:3 by region, ordered by `published_at`.
- **Search:** Postgres `tsvector` over spaces, dispatches, questions; `Cmd+K` palette UI.
- **Map:** Google Maps Platform connector (managed), India-centered.
- **Weekly winners:** SQL view + scheduled recompute; seeded with plausible ranks from the seed reviews.
- **Seed migration:** cities, ~20 spaces, ~30 seed community profiles, **120+ reviews**, ~50 votes, ~15 questions + answers, ~15 sales questions, ~10 approved feeds, this week's Space of the Week + Top Winners. Dispatches populate on first cron run (admin "Poll now" available).
- **Admin CMS:** feeds (add/approve/disable/poll-now), dispatch moderation, spaces CRUD, weekly picks, review/question moderation.
- **SEO:** unique `head()` per route; dispatch detail has `og:image` from cover + `rel="canonical"` to `source_url`.

## Build order

1. Enable Lovable Cloud; configure email + Google auth.
2. Migration #1: schema + RLS + GRANTs + `has_role()` + core seed (cities, spaces, sales questions, feeds, Space of the Week).
3. Migration #2: seed community profiles + **120+ reviews** + votes + questions/answers + `weekly_winners`.
4. Design tokens (Vapor Chrome) in `src/styles.css`.
5. Root shell: sticky header, wordmark, nav, `Cmd+K` search, session-aware auth affordance.
6. Home page.
7. RSS ingestion server route + sanitizer + `CRON_SECRET` (generated) + pg_cron schedule + admin "Poll now".
8. Dispatch list + detail routes.
9. Spaces list with map (Google Maps connector prompt) + space detail (reviews, Q&A, sales checklist, compare drawer, recent dispatches).
10. Winners archive; Q&A feed + threads.
11. Auth pages, user dashboard, submit + suggest-a-feed flows.
12. Admin CMS.
13. Newsletter signup + subscribers table.
14. Verify: build passes; reviews render on space profiles; one feed ingests end-to-end; sign-in, post-review, ask-question, admin approve-feed flows all work.

## Open items during build

- **Google Maps connector** — linked at step 9.
- **CRON_SECRET** — generated in step 7.
- **Admin bootstrap** — first admin role assigned via SQL; I'll ask for your signup email at step 12.
- **Newsletter sending** — stored-only in v1.
- **RSS licensing** — title/excerpt/cover/link only, link out for full text.
