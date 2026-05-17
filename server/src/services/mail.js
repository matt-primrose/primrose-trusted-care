import { logger } from '../logger.js';

/**
 * MailService interface:
 *   send({ to, from, subject, text, html, attachments }) → Promise<void>
 *
 * Active provider is selected by process.env.MAIL_PROVIDER:
 *   - 'console' (default) — logs the email instead of sending. Safe for dev.
 *   - 'sendgrid' — stub; needs @sendgrid/mail wired up before launch.
 *   - 'postmark' — stub; needs postmark wired up before launch.
 */

export function createMailService(env = process.env) {
  const provider = (env.MAIL_PROVIDER || 'console').toLowerCase();

  switch (provider) {
    case 'console':
      return createConsoleMailService();
    case 'sendgrid':
      return createSendGridMailService(env);
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

function createSendGridMailService(env) {
  if (!env.MAIL_API_KEY) {
    throw new Error('MAIL_PROVIDER=sendgrid requires MAIL_API_KEY');
  }
  return {
    name: 'sendgrid',
    async send(_message) {
      // TODO: install @sendgrid/mail and wire up sgMail.send(_message)
      throw new Error('SendGrid provider stub — wire up @sendgrid/mail before using');
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
