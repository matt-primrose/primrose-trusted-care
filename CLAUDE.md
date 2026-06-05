# Primrose Trusted Care — Project Guide for AI Agents

> This file is the canonical source of truth for any AI agent (Claude Code, Copilot, etc.) creating or maintaining this site. Read it end-to-end before making changes. If a decision in this file conflicts with code you find, **stop and ask the owner** — don't silently diverge.

---

## 1. Project overview

**Primrose Trusted Care (PTC)** is a family-services brand. The brand's defining promise is that every provider is **personally vetted** — background-checked and credentials-verified (e.g., CPR). This repo is the **public marketing website + intake forms** that introduces PTC to families and recruits new providers.

**Current services:**
- Child care — full-time nanny, date-night care, one-off / drop-in care.
- Mother's helper (household help, no childcare duties).
- Pet sitting.

The service catalog is intentionally **extensible** — new offerings (e.g., elder companion, tutoring, house sitting) must be addable by editing content files, not by writing new components.

**v1 scope (this repo right now):**
- Public marketing site.
- Contact form.
- "Become a Provider" application form (intake only — verification is performed manually by staff out-of-band).

**Explicitly out of scope in v1** — do not build these without an owner decision:
- Applicant login or "track my application" status pages.
- Staff/admin UI for reviewing submissions.
- Integrated background-check provider (Checkr, Sterling, etc.).
- Database persistence of any kind.
- Online booking, scheduling, or payments.
- Multi-instance / horizontally scaled deployments.

---

## 2. Tech stack & versions (locked)

| Layer | Choice | Notes |
| --- | --- | --- |
| Backend runtime | **Node.js 22.x LTS** | Required by GoDaddy hosting target. |
| Backend framework | **Express 5** | Passenger-friendly, SSE-friendly, small surface. |
| Frontend framework | **Angular 21.x** | Standalone components, signals, no NgModules. |
| Language | **Plain JS (ES modules)** on the backend, **TypeScript** on the frontend | Locked in during scaffold — no backend build step before Passenger runs the code. |
| SSR | **Runtime SSR** via Angular's `@angular/ssr/node` | Composed in `client/src/server.ts`; our API mounts on the same Express app. |
| Transport | **REST** for normal traffic, **SSE** for live events | See §7 for the SSE contract. |
| Email | **Transactional API** (Resend; Postmark stub kept as fallback) | Wrapped behind a `MailService` interface; provider is swappable. Resend chosen for its permanent free tier (3,000 emails/mo) — SendGrid's 60-day trial was a bad fit for this site's expected volume of ~10 submissions/mo. |
| Persistence | **None in v1** | Forms deliver to email; that inbox is the system of record. |
| Auth | **None in v1** | Site is fully public. |
| Anti-spam | **Honeypot field + per-IP rate limit** | No third-party captcha — overkill at this scale. |
| Hosting | **GoDaddy PaaS** (Node.js Hosting Beta — `host.beta.godaddy.com/paas`) | Heroku-style: upload source, platform runs `npm install && npm run build && npm start`. See §9. |

**Rule:** No new runtime dependencies without owner approval. Small surface is a feature on shared hosting.

---

## 3. Repository layout

```
primrose-trusted-care/
├── CLAUDE.md                    # this file
├── README.md                    # human-facing project readme
├── package.json                 # root scripts + npm workspaces (server + client)
├── app.js                       # Passenger entry — boots client/dist/.../server.mjs (built SSR + API)
├── server/                      # API workspace (plain JS, ES modules)
│   ├── package.json
│   ├── src/
│   │   ├── index.js             # exports createApiRouter() + createApp()
│   │   ├── standalone.js        # dev entry (API only on :3000); used by `npm run dev:server`
│   │   ├── logger.js            # pino logger (PII redaction baked in)
│   │   ├── routes/
│   │   │   ├── contact.js       # POST /api/contact
│   │   │   ├── provider.js      # POST /api/become-a-provider (multipart)
│   │   │   ├── content.js       # GET  /api/content/*  (services/founders/testimonials/pages)
│   │   │   └── events.js        # GET  /api/events     (SSE channel)
│   │   ├── services/
│   │   │   ├── mail.js          # MailService factory: console (default) | resend (live) | postmark (stub)
│   │   │   ├── events.js        # SSE broadcaster (in-memory bus)
│   │   │   └── content-loader.js  # reads + caches content/*.json + pages/*.md (mtime invalidation)
│   │   └── middleware/
│   │       ├── rate-limit.js
│   │       ├── honeypot.js
│   │       └── error-handler.js
│   └── tests/                   # node:test specs (helpers.js + 4 test files)
├── client/                      # Angular 21 frontend + SSR composition
│   ├── angular.json
│   ├── package.json
│   ├── proxy.conf.json          # dev: proxies /api → :3000
│   └── src/
│       ├── index.html           # Google Fonts <link> with display=swap
│       ├── main.ts              # browser bootstrap
│       ├── main.server.ts       # SSR bootstrap
│       ├── server.ts            # **production SSR composition** — mounts /api router on Express + Angular catch-all
│       ├── styles.scss          # global stylesheet — imports tokens, sets defaults
│       ├── styles/
│       │   └── _tokens.scss     # mirrors brand-assets/palette.json
│       └── app/
│           ├── app.ts / .html / .scss      # root component (Header + RouterOutlet + Footer)
│           ├── app.config.ts               # browser providers (router, http, hydration)
│           ├── app.config.server.ts        # SSR providers
│           ├── app.routes.ts               # lazy feature routes
│           ├── app.routes.server.ts        # RenderMode.Server (runtime SSR everywhere)
│           ├── core/
│           │   ├── content.service.ts      # fetches + caches /api/content/*
│           │   ├── live-events.service.ts  # EventSource wrapper (signals)
│           │   ├── meta.service.ts         # per-route title + Open Graph
│           │   └── models/ {service, founder, testimonial}.ts
│           ├── shared/ {section, card}/    # reusable UI primitives (inline templates)
│           ├── layout/ {header, footer}/   # site shell
│           └── features/
│               ├── home/                   # hero + testimonials teaser + services teaser + CTAs
│               ├── services-list/          # /services
│               ├── service-detail/         # /services/:id
│               ├── about/                  # /about (founders + mission)
│               ├── testimonials/           # /testimonials
│               ├── contact/                # /contact (form + contact info)
│               └── become-provider/        # /become-a-provider (form + cert uploads)
├── content/                     # file-based content — single source of truth for copy
│   ├── services.json            # nested categories → services
│   ├── founders.json            # founder bios with photo refs
│   ├── testimonials.json
│   └── pages/
│       ├── mission.md           # rendered via marked on the server, served as HTML
│       └── contact.md
└── brand-assets/                # owner-supplied; do not invent without these
    ├── README.md                # describes the directory + naming conventions
    ├── palette.json             # design tokens (draft — see §6)
    ├── ptc-christ.png           # primary monogram (PtC, cross-shaped 't')
    ├── ptc-child-care.png       # secondary illustrated mark (baby with pacifier)
    ├── ptc-color-palette.jpeg   # color reference (source of the palette hex values)
    └── ptc-font-example.JPG     # business card photo — source of typography choices
```

**Production runtime path:** `app.js` → `client/dist/client/server/server.mjs` (built from `client/src/server.ts`) → Express app with helmet/pino/json → our `/api` router → static `dist/client/browser/` → Angular SSR catch-all.

**Dev runtime path:** `npm run dev` starts `server/src/standalone.js` (API only on :3000) and `ng serve` (Angular dev on :4200, proxying /api to :3000).

---

## 4. Domain model & extensibility

### Service catalog schema (`content/services.json`)

Two-level taxonomy. **Do not flatten.** Adding a service should never require touching components.

```jsonc
{
  "categories": [
    {
      "id": "child-care",
      "name": "Child Care",
      "tagline": "Care your family can trust",
      "iconRef": "icons/child-care.svg",
      "services": [
        {
          "id": "full-time-nanny",
          "name": "Full-Time Nanny",
          "tagline": "Consistent daily care from a vetted nanny",
          "description": "...",
          "imageRef": "photography/nanny-hero.jpg",
          "bookingNotes": "Minimum 20 hrs/week...",
          "active": true
        },
        { "id": "date-night",  "name": "Date Night Care", "...": "..." },
        { "id": "one-off",     "name": "One-Off Care",    "...": "..." }
      ]
    },
    { "id": "mothers-helper", "name": "Mother's Helper", "services": [ /* ... */ ] },
    { "id": "pet-sitting",    "name": "Pet Sitting",     "services": [ /* ... */ ] }
  ]
}
```

**Extensibility test (must pass before any service-related PR is merged):**
> *Could a new category — e.g., "Elder Companion" — be added by editing only `services.json`, with no code changes? If no, the change has leaked the catalog into code; rework it.*

### Other content files
- `content/founders.json` — array of `{ id, name, role, photoRef, bio }`. Used by the About page.
- `content/testimonials.json` — two arrays: `testimonials` (each `{ id, quote, attribution, location }`) and an optional `images` (each `{ id, src, alt }`). The testimonials list surfaces on both the home-page carousel and the `/testimonials` page. The images array surfaces **only** on the home carousel, interleaved with testimonials (T, I, T, I, …), so the rotation cycles between quotes and photos.
- `content/pages/*.md` — long-form copy (mission, FAQ, privacy, etc.) rendered through a markdown component.

---

## 5. UI sections (required pages in v1)

All routes are lazy-loaded standalone components.

| Route | Purpose | Key components | Content source |
| --- | --- | --- | --- |
| `/` | Home — hero, services teaser, **testimonials early (trust signal)**, CTA to `/contact` and `/become-a-provider` | `HeroSection`, `ServicesTeaser`, `TestimonialsCarousel`, `CtaBanner` | `services.json`, `testimonials.json` (featured) |
| `/services` | Full catalog | `CategorySection`, `ServiceCard` | `services.json` |
| `/services/:id` | Individual service detail | `ServiceDetail` | `services.json` |
| `/about` | Two founder cards side-by-side, mission statement | `FounderCard`, `MissionBlock` | `founders.json`, `pages/mission.md` |
| `/testimonials` | Full testimonials list | `TestimonialCard` | `testimonials.json` |
| `/contact` | Phone, email, service area, hours, contact form | `ContactInfo`, `ContactForm` | `pages/contact.md` |
| `/become-a-provider` | Application form: contact info, services interested in, experience, references, **cert uploads (CPR, etc.)** | `ProviderApplicationForm` | n/a (form definition lives in code) |

### Form fields (provider application, indicative — confirm copy with owner)
- Contact: full name, email, phone, city/region.
- Interests: which service categories they want to provide for (multi-select from `services.json`).
- Experience: years, prior employers/families (free text), references.
- Credentials: CPR cert upload (multipart), other cert uploads.
- Consent: checkbox acknowledging that a background check will be run.

Uploaded files are attached to the outbound email — **never written to server disk in v1**.

---

## 6. Brand & design system

### Logo variants
PTC has **two marks**. Choose deliberately.

| Variant | File | Use for |
| --- | --- | --- |
| **PtC monogram** (the `t` is a stylized cross) | [`brand-assets/ptc-christ.png`](brand-assets/ptc-christ.png) | Site chrome — header and footer brand marks. Also formal/print contexts: business cards, letterhead, signature blocks. The brand's identity mark. |
| **Illustrated mark** (baby with pacifier) | [`brand-assets/ptc-child-care.png`](brand-assets/ptc-child-care.png) / [`ptc-child-care-transparent.png`](brand-assets/ptc-child-care-transparent.png) | Hero illustrations, favicon source, social cards, marketing collateral, child-care service pages. The brand's friendlier face. Use the transparent version when overlaying a colored or gradient background. |

Both marks may appear on the same page (e.g., monogram in the header and illustrated mark in the hero), but **don't place both marks on the same surface** (e.g., don't put both in the header).

Don't mix the two in the same surface (e.g., don't put both in the header). When pulling these into the Angular app under `client/src/assets/`, copy them with their existing names — don't rename again.

### Palette and tokens
- Authoritative palette lives in [`brand-assets/palette.json`](brand-assets/palette.json).
- The values there are **eyedropper-approximations** from the brand reference image and are marked `version: 0.1.0-draft`. They must be verified against the source design file before launch.
- Mirror palette tokens into `client/src/styles/_tokens.scss` as CSS custom properties. Components reference token names (`var(--color-primary)`), never raw hex.

**Current palette (draft):**

| Token | Hex | Role |
| --- | --- | --- |
| `color.brand.blush` | `#F8DCE5` | Lightest pink — page background, soft surfaces |
| `color.brand.rose` | `#EBA3C2` | Mid pink — secondary accents, cards |
| `color.brand.pink` | `#E84D8E` | Hot pink — accent, links, focus rings |
| `color.brand.crimson` | `#D33041` | Warm red — primary CTA |
| `color.brand.rosewood` | `#8E5A5A` | Muted brown-rose — logo text color, muted body text |
| `color.ui.text` | `#2A1F22` | Deep warm near-black for body copy |

Validate contrast: `color.ui.text` on `color.brand.blush` should clear WCAG AA (≥ 4.5:1). The hot-pink and crimson should not be used as text on the blush background without checking contrast first.

### Typography
Three roles, three faces — all sourced from **Google Fonts** so no licensing concerns. Defaults are approximated from [`brand-assets/ptc-font-example.JPG`](brand-assets/ptc-font-example.JPG) and can be swapped in `palette.json` + `_tokens.scss` later.

| Role | Family | Where it's used | CSS variable |
| --- | --- | --- | --- |
| **Display** | **Cinzel** (Trajan-style Roman caps) | Logo lockup, page H1s only | `--font-display` |
| **Body** | **Lato** (humanist sans) | Default for all UI: body copy, H2+, navigation, forms, buttons | `--font-body` |
| **Script accent** | **Allura** (formal connected script) | Personal-name treatments and signatures **only** (e.g., founder signatures on the About page) | `--font-script` |

**Rules:**
- Cinzel is for **display only** — never use it below ~24px, never for paragraphs. It's all-caps glyphs by design.
- Allura is **restricted to decorative name treatments**. Never use it for body copy, buttons, nav, links, or anything below ~24px. Failing this rule is an accessibility regression.
- Set `--font-body` as the document default; switch to other faces only on the specific elements that need them.

**Font loading — required snippet in `client/src/index.html`:**

All three faces load from Google Fonts via a single request, with `display=swap` so the browser shows fallback text immediately instead of holding first paint:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@400;700&family=Allura&display=swap">
```

When swapping a family in `palette.json` later, update the `family=` parameters in this URL too — they're the only two places font names live. Do **not** drop `display=swap`.

### Voice & tone
- Warm, plain-spoken, trust-forward.
- Faith undertone is expressed by **the brand mark itself** (the cross-shaped `t` in the PtC monogram) and by **values language** ("called to serve families", "community we trust", "caring for your family like our own").
- **Do not add additional Christian iconography elsewhere on the site.** No extra crosses sprinkled across the UI, no scripture quotations, no churchy stock imagery. The brand mark carries the signal; the rest of the site reads as a warm, professional family-services brand.
- **Avoid em-dashes (—) in user-facing text content** (Markdown pages, JSON copy, page strings). Prefer commas for parentheticals, colons for lists or specifics, periods for emphatic breaks, or short subordinate clauses. Em-dashes read as typographically loud and break the warm, conversational tone we want. This rule applies to copy only, not to code comments or this guide.

### Photography
- Real families / real providers preferred over stock.
- When stock is unavoidable, choose images that look candid rather than posed; warm, natural lighting; diverse families.
- Consent rules: get written consent before publishing any photograph of a real provider, family, or child. Track consent in `brand-assets/photography/CONSENT.md` (to be created when real photography lands).
- Every `<img>` requires meaningful `alt` text — never empty unless purely decorative.

### Accessibility
- Target **WCAG 2.1 AA.**
- Contrast ratios verified against palette tokens.
- Every interactive element keyboard-reachable; visible focus states.
- Forms have labels, not placeholder-only inputs.

### Responsive design
- **Mobile-first.** Design at 360px width, then scale up.
- Nav collapses to hamburger below 768px.
- No horizontal scroll at any breakpoint.

---

## 7. Backend architecture

### Process model
- Single Express app, exported from `server/src/index.js`.
- `app.js` at the repo root is the **Passenger entry** — it requires `./server/src/index.js` and listens on `process.env.PORT`.
- Passenger spawns a single Node process per app in the default cPanel config. **All in-memory state (SSE clients, rate-limit counters) is single-process — do not assume fan-out.**

### Routing
- **Static**: Express serves Angular's built `dist/` directory at `/`. Unknown non-API routes fall through to `index.html` so Angular's router handles them.
- **API**: all server endpoints mount under `/api/`.

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/content/services` | GET | Returns `content/services.json`. Cached in memory; reloaded on file mtime change in dev. |
| `/api/content/founders` | GET | Returns `content/founders.json`. |
| `/api/content/testimonials` | GET | Returns `content/testimonials.json`. |
| `/api/contact` | POST | Validates, runs honeypot + rate-limit, hands to `MailService`, broadcasts `inquiry-received` SSE event, returns 202. |
| `/api/become-a-provider` | POST | Multipart-aware; same flow as contact, attaches uploaded certs to the outbound email. |
| `/api/events` | GET | SSE channel; see below. |

### Form handling rules
1. Validate input shape with zod (preferred) or express-validator.
2. If the honeypot field is non-empty, respond 202 silently — do not reveal the rejection.
3. Apply per-IP rate limit (e.g., 5 requests / 10 minutes) before invoking `MailService`.
4. `MailService.send(...)` returns a promise; on success, broadcast an SSE event with a correlation id; on failure, log and return 500.
5. **Never log raw form bodies.** Log a redacted shape: which endpoint, which fields were present, the correlation id. PII does not belong in stdout.

### SSE channel (`/api/events`) — v1 contract

The **only** SSE use case in v1: pushing a confirmation event when a submission is processed server-side, so the page can update without polling.

- Client opens `GET /api/events` (EventSource).
- Server sends a `: keep-alive` comment every **25 seconds** to keep the connection through proxies.
- Server broadcasts events of type `inquiry-received` with payload `{ correlationId, source: "contact" | "provider", timestamp }` after `MailService.send` resolves.
- Bus is in-memory (a `Set<Response>`); each connection is added on open, removed on close.
- **Do not** add unrelated event types to this channel without an architectural review — it would break the "minimal SSE" v1 scope (§12).

### Logging
- Structured JSON via **pino**.
- Platform captures stdout/stderr — view in the PaaS dashboard. No extra log shipping in v1.

---

## 8. Frontend architecture

- **Standalone components**, no NgModules. Use Angular 17+ idioms throughout.
- **Lazy-loaded** feature routes.
- **State**: signals + plain services. **No NgRx in v1.**
- **HTTP**: typed API clients in `core/api/`. Content is fetched once at app init and cached in a `ContentService`.
- **SSE client**: `LiveEventsService` in `core/` wraps `EventSource` and exposes an Observable / signal stream. Components opt in only where they actually need it (initially: contact and become-provider confirmation toasts).
- **Styling**: SCSS, component-scoped. Pull from `_tokens.scss` — never write raw hex values in component styles.
- **Forms**: typed reactive forms; show inline validation; disable submit while pending; show clear success and error states.

---

## 9. Deployment (GoDaddy PaaS — Node.js Hosting Beta)

The site deploys to **GoDaddy PaaS**, accessed at `host.beta.godaddy.com/paas` (currently in Beta). PaaS is a Heroku-style platform — you provide source code and the platform runs `npm install && npm run build && npm start`. It is **not** the classic cPanel + Phusion Passenger product (also marketed as "Node.js Hosting" — different product, same name; expect confusion).

Authoritative app requirements: <https://host.beta.godaddy.com/paas/app-requirements>.

### ⚠️ The platform CANNOT build this app — we ship a prebuilt bundle (changed 2026-06-05)

GoDaddy PaaS's build sandbox **cannot execute installed `node_modules` binaries**. Any on-platform `npm run build` (i.e. `ng build`) dies because Angular's bundler (esbuild) fails with `spawnSync .../@esbuild/linux-x64/bin/esbuild EACCES`. The sandbox logs `airo-sandbox: ... skipping path=/app/node_modules mode=rx` — it never applies the execute mount to `node_modules`. This started ~2026-06-03 after ~16 days of working deploys, with no app changes — i.e. it's a platform-side regression (a support ticket is open). Installing the build toolchain into `dependencies` only swaps `ng: not found` for the esbuild `EACCES`; there is no on-platform fix.

**So the site is built off-platform and the build output is committed and deployed:**
- **`client/dist/` is committed to git** (un-ignored in both `.gitignore` and `client/.gitignore`). It is the deploy artifact. `app.js` boots `client/dist/client/server/server.mjs`.
- The root **`build` script runs [`scripts/build.mjs`](scripts/build.mjs)**, which runs the real `ng build` locally but **no-ops on the platform** by skipping when **`@angular/build`** can't be resolved. (It checks `@angular/build` — the builder — NOT `@angular/cli`: when esbuild fails, the builder is dropped while the CLI can survive, and a present CLI would wrongly let `ng build` run and fail with "Could not find @angular/build:application builder".)
- The Angular/Vitest build toolchain (`@angular/build`, `@angular/cli`, `@angular/compiler-cli`, `typescript`, `vitest`, `jsdom`) lives in **`optionalDependencies`** (see `client/package.json`). GoDaddy forces a full install — `NODE_ENV` is a reserved secret we can't set, and `NPM_CONFIG_OMIT=dev` was ignored — so esbuild **will** be installed and its postinstall **will** hit `EACCES`. As *optional* deps, that failure is **non-fatal**: npm warns, skips the failed package(s), and the install completes (same mechanism as `fsevents` on Linux). Do **not** move these to `dependencies` or `devDependencies`.
- **Email uses the Resend REST API via `fetch`, not the `resend` SDK** — the SDK pulls in `@react-email/render` → `react-dom`, which the SSR bundle externalizes and the platform couldn't resolve at runtime (`ERR_MODULE_NOT_FOUND`). See [`server/src/services/mail.js`](server/src/services/mail.js).

**Deploy flow:** edit code/content → `npm run build` (repo root) → **commit the changed `client/dist/`** → push. GoDaddy installs deps (esbuild fails harmlessly), the build skips, and `node app.js` serves the prebuilt bundle. Revisit this whole section if/when GoDaddy fixes the sandbox; then we can drop the committed `client/dist`, move the toolchain back to `devDependencies`, and let the platform build again.

**Required env vars beyond the mail ones (set in the PaaS dashboard):**
- `NG_TRUST_PROXY_HEADERS=true` — GoDaddy proxies requests; without this Angular SSR warns on `x-forwarded-for` and can't see the real client IP / host.
- Angular SSR validates the request host against `security.allowedHosts` in [`client/angular.json`](client/angular.json) (returns 400 otherwise). It includes `*.airoapp.ai` (GoDaddy preview URLs — the subdomain's `cNN` number changes between app recreations) plus the production domain. Changing it requires a rebuild + committed `client/dist`.

> **Start command note:** the platform's run command was observed to be `npm run dev`, not `npm start`. As a workaround the root `dev` script is aliased to `npm run start` (and the real dev command is `dev-local`). If you can set the platform's start command to `npm start` in the dashboard, restore `dev` to the `concurrently` command and drop the alias.

### What our `package.json` must declare (already in place at the repo root)
- `"main": "app.js"` — entry point.
- `"build": "node scripts/build.mjs"` — builds locally, no-ops on the platform (see above).
- `"start": "node app.js"` — long-running command the platform invokes.

### How code reaches PaaS (two options)
- **GitHub integration** (current method) — connect the repo; push to `main` triggers a deploy. One-click, clear audit trail. Because `client/dist/` is committed, the push carries the prebuilt bundle.
- **Zip upload** (≤ 100 MB) via the PaaS dashboard. Include `client/dist/` (the prebuilt bundle); exclude `node_modules/`. Note `client/dist` is ~33 MB, so mind the 100 MB limit.

### Environment variables
Set these in the PaaS dashboard. **Never commit them.** Same shape as `.env.example` at the repo root:
- `NG_TRUST_PROXY_HEADERS=true` — **required**; GoDaddy proxies requests (see §9 prebuilt-bundle notes).
- `MAIL_PROVIDER=resend` (or `postmark`)
- `MAIL_API_KEY=...`
- `MAIL_FROM=...` — verified sender address
- `MAIL_TO=...` — where submissions land
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` (optional overrides)

`NODE_ENV` is a **reserved secret on GoDaddy PaaS** — you can't set or view it (assume `production` at runtime). Don't rely on it to control the install; that's why the build toolchain is in `optionalDependencies` (see §9). `PORT` is set automatically by PaaS; our app already reads `process.env.PORT`. **All env vars are wiped if the app is deleted and recreated** — re-add them after any recreate.

### Network constraints
PaaS apps can make **outbound connections only on ports 80 and 443**, plus GoDaddy-managed databases. Resend (`api.resend.com`) and Postmark both serve on 443, so we're fine. If we ever add a new external integration, verify it's HTTPS before assuming it'll work.

### First-deploy checklist (do before going live)
- [ ] Confirm Node.js **22.x** is selectable in the PaaS dashboard. The public app-requirements page doesn't list supported versions — verify before relying on it.
- [ ] Add the production domain (and any wildcard like `.primrosetrustedcare.com`) to `security.allowedHosts` in [`client/angular.json`](client/angular.json) and rebuild. Angular's SSR will return 400s for hosts not on the list. PaaS preview URLs (`*.preview.c24.airoapp.ai`) are already allowed.
- [ ] Set all required env vars in the PaaS dashboard.
- [ ] Mail provider has the production sender verified.
- [ ] Trigger a deploy. Once the URL is live, test the contact and provider forms end-to-end and confirm an email arrives.
- [ ] Verify the SSE channel (`/api/events`) stays connected through PaaS's network layer — long-lived HTTP responses can hit proxy timeouts on some platforms. If keep-alives get dropped, raise the timeout or shorten the keep-alive interval below 25s.

---

## 10. Testing & quality gates

| Area | Tool | What to cover |
| --- | --- | --- |
| Backend | `vitest` or built-in `node:test` | Route handlers, `MailService` (with a fake transport), honeypot middleware. |
| Frontend | Angular's built-in test runner | Smoke test per feature, key services (`ContentService`, `LiveEventsService`). |
| Lint | ESLint + Prettier | Both halves. Run via npm scripts; no husky in v1. |

Run these locally before opening any PR. Don't merge red builds.

---

## 11. Operating rules for AI agents

Before every change, satisfy this checklist:

1. **Read content from JSON/markdown, never hard-code copy** — services, testimonials, bios, FAQ, mission. If you find yourself typing a service name in a component, stop.
2. **Reference design tokens, not raw hex values.** Palette changes must propagate via `_tokens.scss` alone.
3. **Form endpoints stay PII-light.** Never log raw form bodies. The email is the system of record in v1.
4. **No new runtime dependencies without owner approval.** Small surface area is a feature on shared hosting.
5. **Mobile-first.** Build the 360px layout, then scale up.
6. **Faith undertone is carried by the brand mark (the cross in the PtC monogram in the site chrome) plus values language.** Do not add additional Christian iconography elsewhere on the site (no extra crosses sprinkled into the UI, no scripture quotations, no churchy imagery). The monogram in the header/footer carries the signal; the rest of the site reads as a warm, professional family-services brand.
7. **Extensibility test for service changes.** Could a new category be added by editing only `services.json`? If no, rework.
8. **SSE channel is for confirmation events only in v1.** Don't reuse it for unrelated flows without architectural review.
9. **Don't write to server disk for user data.** Uploads stream straight into the outbound email.
10. **If brand assets are missing,** leave placeholders (`TBD-PALETTE`, `TBD-LOGO`) — do not invent colors, typography, or imagery.
11. **Rebuild AND commit `client/dist` after every code change before asking the owner to verify or deploy.** The owner runs the site from the built bundle (`npm start` against `client/dist/`), not from `ng serve` with HMR. After editing SCSS, TypeScript, HTML, or content files, run `npm run build` from the repo root and only then declare a UI/visual change done. Don't trust "the dev server should hot-reload" reasoning — it doesn't apply here. **And because GoDaddy can't build (see §9), `client/dist/` is the committed deploy artifact — a code change that isn't followed by a rebuilt, committed `client/dist/` will NOT reach production.**

---

## 12. Roadmap (deferred, not forgotten)

These items have been considered and explicitly deferred past v1. When the owner asks for one, plan a separate phase — don't sneak it in.

- Applicant login + "track my application" status (likely pairs with expanding SSE).
- Staff/admin UI for reviewing submissions (requires auth + persistence).
- Integrated background-check provider (Checkr, Sterling, etc.) with webhook handling.
- Database persistence for applications/contacts (PII handling, encryption-at-rest, backups).
- Online booking / scheduling / payments.
- Multi-instance scaling (current Passenger model assumes one process).
- Headless CMS migration (if content volume outgrows file-based editing).

---

## 13. Pending tasks for the owner

Status of scaffold and remaining pre-launch items:

**Done in the scaffold (2026-05-17):**
- [x] Drop initial brand assets into `brand-assets/` (logos + color reference).
- [x] Confirm typography pairing — Cinzel (display), Lato (body), Allura (script accent). Approximated from `ptc-font-example.JPG`.
- [x] Scaffold the full stack: Node 22 + Express 5 backend, Angular 21 SSR client, npm workspaces, file-based content with realistic placeholder copy, SSE channel, design tokens, ESLint + Prettier, 10 passing server tests.

**Still needed before launch:**
- [ ] **Verify the palette hex values** in [`brand-assets/palette.json`](brand-assets/palette.json) against the source design file — current values are eyedropper-approximated from the JPEG and marked `0.1.0-draft`.
- [x] Choose transactional email provider — **Resend** selected (switched from SendGrid 2026-05-18 because SendGrid's free tier is a 60-day trial, not a permanent tier; Resend gives 3,000 emails/mo free forever, which comfortably covers expected volume). Live adapter wired up in [`server/src/services/mail.js`](server/src/services/mail.js) calling the **Resend REST API directly via `fetch`** (not the `resend` npm SDK — the SDK pulls in `@react-email/render` → `react-dom`, which the SSR bundle externalizes and GoDaddy PaaS fails to resolve at runtime; the REST API avoids that and keeps the dependency surface tiny). Remaining owner steps before go-live: (1) create a Resend account at [resend.com](https://resend.com), (2) verify the `primrosetrustedcare.com` domain by adding the SPF/DKIM DNS records Resend provides, (3) generate an API key at [resend.com/api-keys](https://resend.com/api-keys), (4) set `MAIL_PROVIDER=resend`, `MAIL_API_KEY=re_…`, `MAIL_FROM=info@primrosetrustedcare.com`, `MAIL_TO=info@primrosetrustedcare.com` in the PaaS dashboard.
- [ ] Fill in real founder names + bios + portraits (replacing placeholders in [`content/founders.json`](content/founders.json)).
- [ ] Fill in real contact info, service area, hours in [`content/pages/contact.md`](content/pages/contact.md).
- [ ] Replace placeholder testimonials in [`content/testimonials.json`](content/testimonials.json) with real attributed quotes (with written consent).
- [ ] Decide on a production domain, provision SSL via the PaaS dashboard, and add the domain to `security.allowedHosts` in [`client/angular.json`](client/angular.json).
- [ ] Confirm Node.js 22.x is selectable in the PaaS dashboard (the public app-requirements page doesn't list supported versions — verify before first deploy).
- [ ] Verify SSE keep-alives survive the PaaS network layer (long-lived HTTP can hit proxy timeouts on managed platforms).

---

*Last updated: 2026-05-17 (scaffold complete). When the v1 scope shifts, update this file in the same PR — agents trust it as ground truth.*
