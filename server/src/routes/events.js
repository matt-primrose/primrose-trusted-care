import express from 'express';

export function eventsRouter({ eventsService }) {
  const router = express.Router();

  router.get('/events', (req, res) => {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();

    eventsService.subscribe(res);
    req.on('close', () => {
      eventsService.unsubscribe(res);
    });
  });

  return router;
}
