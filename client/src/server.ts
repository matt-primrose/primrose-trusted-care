import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { join } from 'node:path';
// JS imports from the server workspace; resolved at runtime via npm workspaces hoisting.
// @ts-expect-error — no type declarations for the JS server workspace
import { createApiRouter, logger, errorHandler } from '../../server/src/index.js';

const browserDistFolder = join(import.meta.dirname, '../browser');

export const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// PTC API routes — these must come BEFORE the static + SSR catch-all.
app.use('/api', createApiRouter({}));

// Static assets from the Angular browser bundle.
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// Angular SSR catch-all — renders any non-API, non-static route.
//
// trustProxyHeaders is not optional for us: GoDaddy fronts the app with a proxy that
// sends x-forwarded-for on every request. Angular only trusts x-forwarded-host and
// x-forwarded-proto by default, and when it sees any other x-forwarded-* header it
// warns, sets deoptToCSR, and serves the client-side shell instead of rendering —
// i.e. SSR silently switches off in production. Verified 2026-09-07: with the header
// present the response lost its server-rendered markup entirely.
//
// NG_TRUST_PROXY_HEADERS in the environment still takes precedence over this; setting
// it here means a deploy renders correctly even if that env var is missing (they get
// wiped whenever the PaaS app is recreated).
const angularApp = new AngularNodeAppEngine({ trustProxyHeaders: true });
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

// Final error handler — JSON for /api/*, default rendering otherwise.
app.use(errorHandler);

// Auto-listen if this module is the entry point (used by ng serve / Angular CLI).
// In production via root app.js, this branch is skipped and app.js calls listen.
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = Number(process.env['PORT']) || 4000;
  app.listen(port, (error?: Error) => {
    if (error) throw error;
    logger.info({ port, mode: 'ssr' }, 'ptc server listening');
  });
}

export const reqHandler = createNodeRequestHandler(app);
