// Passenger / production entry. Boots the built Angular SSR + PTC API bundle.
//
// Requires that `npm run build` has produced client/dist/client/server/server.mjs first.
// For dev work, use `npm run dev:server` instead — it runs the API standalone (no SSR build needed).

import { app } from './client/dist/client/server/server.mjs';

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(JSON.stringify({ level: 'info', msg: 'ptc-server listening', port }));
});
