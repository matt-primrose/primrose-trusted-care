import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { honeypot } from '../middleware/honeypot.js';
import { logger } from '../logger.js';

const ProviderSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().email().max(320),
  phone: z.string().trim().min(1).max(50),
  city: z.string().trim().max(200).optional(),
  interests: z
    .union([z.string(), z.array(z.string())])
    .transform((v) => (Array.isArray(v) ? v : [v]))
    .pipe(z.array(z.string().min(1)).min(1)),
  experience: z.string().trim().max(5000).optional(),
  references: z.string().trim().max(2000).optional(),
  consentBackgroundCheck: z
    .union([z.literal('on'), z.literal('true'), z.literal(true), z.boolean()])
    .transform((v) => v === true || v === 'true' || v === 'on'),
  honeypot: z.string().optional(),
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 }, // 10 MB per file, 5 files max
});

export function providerRouter({ mailService, eventsService, formLimiter, env = process.env }) {
  const router = express.Router();

  router.post(
    '/become-a-provider',
    formLimiter,
    upload.array('certs', 5),
    honeypot,
    async (req, res, next) => {
      const correlationId = randomUUID();
      try {
        const data = ProviderSchema.parse(req.body);
        if (!data.consentBackgroundCheck) {
          return res.status(400).json({ error: 'consent_required' });
        }

        const subject = `[PTC] New provider application: ${data.name}`;
        const text = [
          `Name: ${data.name}`,
          `Email: ${data.email}`,
          `Phone: ${data.phone}`,
          data.city ? `City: ${data.city}` : null,
          `Services of interest: ${data.interests.join(', ')}`,
          '',
          'Experience:',
          data.experience || '(none provided)',
          '',
          'References:',
          data.references || '(none provided)',
          '',
          `Consent to background check: yes`,
          `Correlation ID: ${correlationId}`,
        ]
          .filter(Boolean)
          .join('\n');

        const attachments = (req.files ?? []).map((file) => ({
          filename: file.originalname,
          content: file.buffer,
          contentType: file.mimetype,
        }));

        await mailService.send({
          to: env.MAIL_TO,
          from: env.MAIL_FROM,
          replyTo: data.email,
          subject,
          text,
          attachments,
        });

        eventsService.broadcast('inquiry-received', {
          correlationId,
          source: 'provider',
          timestamp: new Date().toISOString(),
        });

        logger.info(
          { correlationId, source: 'provider', attachmentCount: attachments.length },
          'provider application accepted',
        );
        res.status(202).json({ ok: true, correlationId });
      } catch (err) {
        logger.error({ correlationId, err: err.message }, 'provider application failed');
        next(err);
      }
    },
  );

  return router;
}
