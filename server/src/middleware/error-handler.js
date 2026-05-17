import { ZodError } from 'zod';
import { logger } from '../logger.js';

export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'validation_failed', issues: err.issues });
  }

  if (err?.code === 'LIMIT_FILE_SIZE' || err?.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'upload_rejected', detail: err.code });
  }

  logger.error({ err: { message: err.message, code: err.code, stack: err.stack } }, 'unhandled error');
  res.status(500).json({ error: 'internal_error' });
}
