// Root build entry. Builds the Angular SSR bundle locally, and must never build
// on GoDaddy PaaS — the site is built off-platform and the prebuilt client/dist
// is committed and served as-is (see CLAUDE.md §9).
//
// Two independent reasons `ng build` cannot run on the platform:
//   1. esbuild can't execute from node_modules there (EACCES), so the bundle fails.
//   2. Even when the toolchain does install, `ng build` for an SSR app extracts
//      server routes by booting a dev server, which binds localhost — and the
//      sandbox denies that: "listen EACCES: permission denied 127.0.0.1". This
//      killed a deploy on 2026-09-07.
//
// Two guards, because the toolchain's presence is not reliable: the Angular deps
// are optionalDependencies, so whether they survive install varies per deploy
// (that's how #2 got a chance to run at all).

import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);

// Guard 1: explicit opt-out. PTC_SKIP_BUILD=1 can be set in the PaaS dashboard.
if (process.env.PTC_SKIP_BUILD === '1') {
  console.log(
    '[build] PTC_SKIP_BUILD=1 — skipping build; serving prebuilt client/dist.',
  );
  process.exit(0);
}

// Guard 2: recognise the platform itself, so a clean deploy needs no dashboard
// setting. GoDaddy PaaS runs the app out of /app on Linux; a developer machine
// never does. Env vars are wiped whenever the app is recreated, so relying on
// guard 1 alone would make deploys fail again after a recreate.
const onPaas = process.platform === 'linux' && process.cwd().startsWith('/app');
if (onPaas) {
  console.log(
    '[build] running on GoDaddy PaaS (/app) — skipping build; serving prebuilt client/dist.',
  );
  process.exit(0);
}

// Guard 3: last line of defence if the platform ever moves off /app. Checks
// @angular/build (the builder providing @angular/build:application), not
// @angular/cli — when esbuild fails the builder is dropped while the CLI can
// survive, and a present CLI would wrongly let `ng build` run and fail on a
// missing builder.
let hasBuilder = true;
try {
  require.resolve('@angular/build/package.json');
} catch {
  hasBuilder = false;
}

if (!hasBuilder) {
  console.log(
    '[build] @angular/build not installed (platform install) — skipping build; serving prebuilt client/dist.',
  );
  process.exit(0);
}

const result = spawnSync('npm', ['run', '-w', 'client', 'build'], {
  stdio: 'inherit',
  shell: true,
});
process.exit(result.status ?? 1);
