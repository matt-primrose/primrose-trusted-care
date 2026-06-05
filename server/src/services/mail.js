import { logger } from '../logger.js';

/**
 * MailService interface:
 *   send({ to, from, replyTo, subject, text, html, attachments }) → Promise<void>
 *
 *   attachments items are { filename, content (Buffer), contentType }.
 *
 * Active provider is selected by process.env.MAIL_PROVIDER:
 *   - 'console' (default) — logs the email instead of sending. Safe for dev.
 *   - 'resend' — live, calls the Resend REST API directly via fetch (Node 22
 *     global fetch). Requires MAIL_API_KEY in env. We intentionally do NOT use
 *     the `resend` npm SDK: it pulls in @react-email/render → react-dom, which
 *     the Angular SSR bundle leaves external and which GoDaddy PaaS fails to
 *     resolve at runtime. The REST API keeps the dependency surface tiny.
 *   - 'postmark' — stub; not implemented in v1.
 */

export function createMailService(env = process.env) {
  const provider = (env.MAIL_PROVIDER || 'console').toLowerCase();

  switch (provider) {
    case 'console':
      return createConsoleMailService();
    case 'resend':
      return createResendMailService(env);
    case 'postmark':
      return createPostmarkMailService(env);
    default:
      throw new Error(`Unknown MAIL_PROVIDER: ${provider}`);
  }
}

function createConsoleMailService() {
  return {
    name: 'console',
    async send(message) {
      logger.info(
        {
          mail: {
            to: message.to,
            from: message.from,
            subject: message.subject,
            textPreview: message.text?.slice(0, 200),
            attachmentCount: message.attachments?.length ?? 0,
          },
        },
        'mail.send (console — not actually sent)',
      );
    },
  };
}

function createResendMailService(env) {
  if (!env.MAIL_API_KEY) {
    throw new Error('MAIL_PROVIDER=resend requires MAIL_API_KEY');
  }
  const endpoint = 'https://api.resend.com/emails';

  return {
    name: 'resend',
    async send(message) {
      const payload = {
        to: message.to,
        from: message.from,
        subject: message.subject,
        text: message.text,
      };
      if (message.replyTo) payload.reply_to = message.replyTo;
      if (message.html) payload.html = message.html;
      if (message.attachments?.length) {
        payload.attachments = message.attachments.map((a) => ({
          filename: a.filename,
          content: Buffer.isBuffer(a.content) ? a.content.toString('base64') : a.content,
          content_type: a.contentType,
        }));
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.MAIL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        logger.error({ status: res.status, detail }, 'resend send failed');
        throw new Error(`Resend send failed: ${res.status}`);
      }

      const data = await res.json().catch(() => ({}));
      logger.info({ resend: { id: data?.id } }, 'resend send ok');
    },
  };
}

function createPostmarkMailService(env) {
  if (!env.MAIL_API_KEY) {
    throw new Error('MAIL_PROVIDER=postmark requires MAIL_API_KEY');
  }
  return {
    name: 'postmark',
    async send(_message) {
      // TODO: install postmark and wire up client.sendEmail(_message)
      throw new Error('Postmark provider stub — wire up postmark before using');
    },
  };
}
