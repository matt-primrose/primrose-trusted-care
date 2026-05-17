import { logger } from '../logger.js';

const KEEP_ALIVE_INTERVAL_MS = 25_000;

export function createEventsService() {
  const clients = new Set();
  let keepAliveTimer = null;

  function startKeepAlive() {
    if (keepAliveTimer) return;
    keepAliveTimer = setInterval(() => {
      for (const res of clients) {
        try {
          res.write(': keep-alive\n\n');
        } catch (err) {
          logger.warn({ err }, 'sse keep-alive write failed');
        }
      }
    }, KEEP_ALIVE_INTERVAL_MS);
    keepAliveTimer.unref?.();
  }

  function stopKeepAlive() {
    if (!keepAliveTimer) return;
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }

  return {
    subscribe(res) {
      clients.add(res);
      startKeepAlive();
      res.write(`event: hello\ndata: ${JSON.stringify({ at: Date.now() })}\n\n`);
    },

    unsubscribe(res) {
      clients.delete(res);
      if (clients.size === 0) stopKeepAlive();
    },

    broadcast(eventName, payload) {
      const chunk = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
      for (const res of clients) {
        try {
          res.write(chunk);
        } catch (err) {
          logger.warn({ err, eventName }, 'sse broadcast write failed');
        }
      }
    },

    get clientCount() {
      return clients.size;
    },

    close() {
      stopKeepAlive();
      for (const res of clients) {
        try {
          res.end();
        } catch {
          // ignore
        }
      }
      clients.clear();
    },
  };
}
