# Primrose Trusted Care

Marketing website for Primrose Trusted Care — a vetted family-services brand offering child care, mother's helper, and pet sitting.

> **For AI agents working in this repo:** read [CLAUDE.md](CLAUDE.md) first. It's the authoritative architecture spec and operating rules.

## Stack

- **Node.js 22** (LTS) + **Express 5** backend (plain JS, ES modules)
- **Angular 21** frontend (TypeScript, standalone components, **SSR at runtime**)
- File-based content (no database in v1)
- Hosted on **GoDaddy PaaS** (Node.js Hosting Beta — Heroku-style upload/build/run)

## Repository layout

```
primrose-trusted-care/
├── app.js                # Passenger entry — boots the built SSR bundle
├── server/               # API workspace (plain JS): Express routes, mail, SSE, content loader
├── client/               # Angular 21 client + SSR composition (TypeScript)
├── content/              # File-based content (services, founders, testimonials, pages)
├── brand-assets/         # Logos, palette, photography
├── CLAUDE.md             # AI-agent guide (read first)
└── README.md             # this file
```

## Prerequisites

- Node.js **22.x** (LTS) — see `engines` in `package.json`
- npm **10.x** or newer

## Quickstart

```bash
# Install all workspaces (server + client)
npm install

# Dev — runs API on :3000 and Angular dev server on :4200 concurrently
# Angular proxies /api → :3000 (see client/proxy.conf.json)
npm run dev

# Production build (Angular browser + SSR bundle)
npm run build

# Production start (Passenger entry)
npm start
```

In dev, open http://localhost:4200 — the Angular dev server handles HMR, and any `/api` request is proxied to the standalone API server. SSR runs only in production builds.

In prod (`npm start` or via Passenger), a single server on `$PORT` (default 3000) serves both `/api/*` endpoints and SSR-rendered HTML for everything else.

## Configuration

Copy `.env.example` to `.env` and fill in the values you need. Required for live mail:

| Variable | Purpose |
| --- | --- |
| `PORT` | Listen port (Passenger sets this automatically) |
| `MAIL_PROVIDER` | `console` (dev default), `sendgrid`, or `postmark` |
| `MAIL_API_KEY` | API key for the chosen provider |
| `MAIL_FROM` | The sender address (must be verified with the provider) |
| `MAIL_TO` | The recipient address (where form submissions land) |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (default 600000 / 10 min) |
| `RATE_LIMIT_MAX` | Max requests per IP per window (default 5) |

## Editing content

All site copy lives in [content/](content/):

- `services.json` — service categories and individual services. **Adding a new service or category requires only this file** (see CLAUDE.md §4).
- `founders.json` — founder bios + photo paths.
- `testimonials.json` — testimonial list; `featured: true` items also surface on the home page.
- `pages/mission.md`, `pages/contact.md` — long-form markdown copy.

Content changes are picked up immediately in dev (the loader watches mtime). In production, content is loaded at request time and cached briefly.

## Brand assets

[brand-assets/](brand-assets/) holds logos, the color palette reference, and (eventually) photography. See [brand-assets/README.md](brand-assets/README.md) for naming conventions and which mark to use where.

Design tokens live in [`brand-assets/palette.json`](brand-assets/palette.json) and are mirrored as CSS custom properties in [`client/src/styles/_tokens.scss`](client/src/styles/_tokens.scss). When you change the palette, update both.

## Tests

```bash
# Server tests (node:test) — 10 tests covering routes, services, middleware
npm run -w server test

# Client tests (Angular's vitest runner)
npm run -w client test
```

## Lint

```bash
npm run lint
```

ESLint flat config at the root covers server + root JS. Prettier config is at the root too. Client lint is a placeholder for v1 (wire up `@angular-eslint` later).

## Deploy (GoDaddy PaaS — Node.js Hosting Beta)

See [CLAUDE.md §9](CLAUDE.md) for the full first-deploy checklist and authoritative requirements. Summary:

1. In the PaaS dashboard at `host.beta.godaddy.com/paas`, create the app. Confirm Node.js **22.x** is selected.
2. Set environment variables in the PaaS dashboard (never commit `.env`).
3. Deploy via either:
   - **Zip upload** (≤ 100 MB; exclude `node_modules/` and `**/dist/`), or
   - **GitHub integration** — connect the repo and trigger a deploy from the dashboard.
4. PaaS runs `npm install`, `npm run build`, then `npm start`. Your app listens on `process.env.PORT`.
5. Add the production domain to `security.allowedHosts` in [`client/angular.json`](client/angular.json) **before** first deploy — Angular SSR returns 400 for unknown hosts.

## Project history & decisions

[CLAUDE.md](CLAUDE.md) captures the architecture, design tokens, voice/tone, accessibility targets, deferred features, and the operating rules every AI agent (or new contributor) should follow.

The original scaffold plan, including alternatives we considered and rejected, lives in `~/.claude/plans/` for the author's reference.
