import express from 'express';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { honeypot } from '../middleware/honeypot.js';
import { logger } from '../logger.js';

const ContactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().email().max(320),
  phone: z.string().trim().max(50).optional(),
  message: z.string().trim().min(1).max(5000),
  honeypot: z.string().optional(),
});

export function contactRouter({ mailService, eventsService, formLimiter, env = process.env }) {
  const router = express.Router();

  router.post('/contact', formLimiter, honeypot, async (req, res, next) => {
    const correlationId = randomUUID();
    try {
      const data = ContactSchema.parse(req.body);

      const subject = `[PTC] New contact: ${data.name}`;
      const text = [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        data.phone ? `Phone: ${data.phone}` : null,
        '',
        'Message:',
        data.message,
        '',
        `Correlation ID: ${correlationId}`,
      ]
        .filter(Boolean)
        .join('\n');

      await mailService.send({
        to: env.MAIL_TO,
        from: env.MAIL_FROM,
        replyTo: data.email,
        subject,
        text,
      });

      eventsService.broadcast('inquiry-received', {
        correlationId,
        source: 'contact',
        timestamp: new Date().toISOString(),
      });

      logger.info({ correlationId, source: 'contact' }, 'contact submission accepted');
      res.status(202).json({ ok: true, correlationId });
    } catch (err) {
      logger.error({ correlationId, err: err.message }, 'contact submission failed');
      next(err);
    }
  });

  return router;
}
