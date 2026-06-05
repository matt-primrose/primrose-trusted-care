// Root build entry. Builds the Angular SSR bundle locally, but no-ops on hosts
// that don't install the build toolchain.
//
// Why: GoDaddy PaaS installs with devDependencies omitted (NODE_ENV=production)
// and its build sandbox cannot execute installed binaries (esbuild fails with
// EACCES). So the site is built off-platform and the prebuilt client/dist is
// committed and deployed. On the platform `@angular/cli` is absent, so this
// script skips the build and the committed client/dist is served as-is.
//
// Locally (devDependencies installed) it runs the real `ng build`, so the
// normal "rebuild after every change" workflow is unchanged.

import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);

// Check for @angular/build specifically (the builder that provides
// @angular/build:application). On GoDaddy it's an optionalDependency whose
// install fails (esbuild EACCES), so it gets skipped while @angular/cli may
// survive — checking @angular/cli would wrongly let `ng build` run and fail.
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
