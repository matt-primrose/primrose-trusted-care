import rateLimit from 'express-rate-limit';

const DEFAULT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const DEFAULT_MAX = 5;

export function createFormLimiter(env = process.env) {
  return rateLimit({
    windowMs: Number(env.RATE_LIMIT_WINDOW_MS) || DEFAULT_WINDOW_MS,
    max: Number(env.RATE_LIMIT_MAX) || DEFAULT_MAX,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'rate_limit_exceeded' },
  });
}
