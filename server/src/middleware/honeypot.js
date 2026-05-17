/**
 * Anti-spam: forms include a hidden `honeypot` field that real users leave empty.
 * If a submission has the field filled, return 202 silently — don't reveal the rejection.
 */
export function honeypot(req, res, next) {
  const value = req.body?.honeypot;
  if (typeof value === 'string' && value.trim().length > 0) {
    return res.status(202).json({ ok: true });
  }
  next();
}
