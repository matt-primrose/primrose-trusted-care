// Dev-only entry: starts the Express API app on its own (no SSR).
// Used by `npm run dev:server`. In production, client/src/server.ts orchestrates everything
// and root app.js boots the built bundle.

import { createApp } from './index.js';
import { logger } from './logger.js';

const app = createApp();
const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  logger.info({ port, mode: 'api-only' }, 'ptc dev server listening');
});
