import express from 'express';
import pinoHttp from 'pino-http';
import helmet from 'helmet';
import { logger } from './logger.js';
import { createMailService } from './services/mail.js';
import { createEventsService } from './services/events.js';
import { createContentLoader } from './services/content-loader.js';
import { createFormLimiter } from './middleware/rate-limit.js';
import { errorHandler } from './middleware/error-handler.js';
import { contentRouter } from './routes/content.js';
import { contactRouter } from './routes/contact.js';
import { providerRouter } from './routes/provider.js';
import { eventsRouter } from './routes/events.js';

export { logger, errorHandler, createContentLoader };

/**
 * Build the API as an Express Router (no app-level middleware, no /api prefix).
 * The parent app mounts it under /api and supplies helmet/pino/json/etc.
 *
 * This is what the production SSR composition uses (client/src/server.ts).
 */
export function createApiRouter({
  mailService,
  eventsService,
  contentLoader,
  formLimiter,
  env = process.env,
} = {}) {
  mailService = mailService ?? createMailService(env);
  eventsService = eventsService ?? createEventsService();
  contentLoader = contentLoader ?? createContentLoader();
  formLimiter = formLimiter ?? createFormLimiter(env);

  const router = express.Router();

  router.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  router.use(contentRouter({ contentLoader }));
  router.use(contactRouter({ mailService, eventsService, formLimiter, env }));
  router.use(providerRouter({ mailService, eventsService, formLimiter, env }));
  router.use(eventsRouter({ eventsService }));

  return router;
}

/**
 * Build a standalone Express app with app-level middleware + /api routes.
 * Used by tests and the dev-mode standalone server (server/src/standalone.js).
 * In production, client/src/server.ts composes everything itself.
 */
export function createApp({
  mailService,
  eventsService,
  contentLoader,
  formLimiter,
  env = process.env,
} = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(pinoHttp({ logger }));
  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use(
    '/api',
    createApiRouter({ mailService, eventsService, contentLoader, formLimiter, env }),
  );

  app.use(errorHandler);

  return app;
}
