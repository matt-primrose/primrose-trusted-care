import { createApp } from '../src/index.js';

/** No-op pass-through middleware; replaces the rate-limiter in tests. */
export const noopLimiter = (_req, _res, next) => next();

export function createFakeMailService() {
  const sent = [];
  return {
    name: 'fake',
    sent,
    async send(message) {
      sent.push(message);
    },
  };
}

export function createFakeEventsService() {
  const broadcasts = [];
  return {
    broadcasts,
    subscribe() {},
    unsubscribe() {},
    broadcast(eventName, payload) {
      broadcasts.push({ eventName, payload });
    },
    close() {},
  };
}

export function createFakeContentLoader(map = {}) {
  return {
    async load(key) {
      if (!(key in map)) {
        const err = new Error('ENOENT');
        err.code = 'ENOENT';
        throw err;
      }
      return map[key];
    },
    async loadPage(name) {
      const key = `page:${name}`;
      if (!(key in map)) {
        const err = new Error('ENOENT');
        err.code = 'ENOENT';
        throw err;
      }
      return map[key];
    },
  };
}

/** Boot the app on an ephemeral port and return { server, baseUrl, services }. */
export async function bootTestApp(overrides = {}) {
  const mailService = overrides.mailService ?? createFakeMailService();
  const eventsService = overrides.eventsService ?? createFakeEventsService();
  const contentLoader = overrides.contentLoader ?? createFakeContentLoader();
  const env = { MAIL_TO: 'to@test', MAIL_FROM: 'from@test', ...overrides.env };

  const app = createApp({
    mailService,
    eventsService,
    contentLoader,
    formLimiter: noopLimiter,
    env,
  });

  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  return {
    server,
    baseUrl: `http://127.0.0.1:${port}`,
    services: { mailService, eventsService, contentLoader },
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
