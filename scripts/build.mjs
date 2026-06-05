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

let hasAngularCli = true;
try {
  require.resolve('@angular/cli/package.json');
} catch {
  hasAngularCli = false;
}

if (!hasAngularCli) {
  console.log(
    '[build] @angular/cli not installed (production install) — skipping build; serving prebuilt client/dist.',
  );
  process.exit(0);
}

const result = spawnSync('npm', ['run', '-w', 'client', 'build'], {
  stdio: 'inherit',
  shell: true,
});
process.exit(result.status ?? 1);
