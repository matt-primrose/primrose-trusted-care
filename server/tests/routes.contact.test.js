import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootTestApp } from './helpers.js';

test('POST /api/contact with valid body → 202, mail sent, event broadcast', async () => {
  const ctx = await bootTestApp();
  try {
    const res = await fetch(`${ctx.baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Looking for a date-night sitter for next Friday.',
      }),
    });
    assert.equal(res.status, 202);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.ok(body.correlationId);

    assert.equal(ctx.services.mailService.sent.length, 1);
    const sent = ctx.services.mailService.sent[0];
    assert.equal(sent.to, 'to@test');
    assert.equal(sent.from, 'from@test');
    assert.equal(sent.replyTo, 'jane@example.com');
    assert.match(sent.subject, /Jane Doe/);
    assert.match(sent.text, /date-night sitter/);

    assert.equal(ctx.services.eventsService.broadcasts.length, 1);
    assert.equal(ctx.services.eventsService.broadcasts[0].eventName, 'inquiry-received');
    assert.equal(ctx.services.eventsService.broadcasts[0].payload.source, 'contact');
  } finally {
    await ctx.close();
  }
});

test('POST /api/contact with honeypot → 202 silently, no mail sent', async () => {
  const ctx = await bootTestApp();
  try {
    const res = await fetch(`${ctx.baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Spam Bot',
        email: 'spam@example.com',
        message: 'buy stuff',
        honeypot: 'i am a bot',
      }),
    });
    assert.equal(res.status, 202);
    assert.equal(ctx.services.mailService.sent.length, 0);
    assert.equal(ctx.services.eventsService.broadcasts.length, 0);
  } finally {
    await ctx.close();
  }
});

test('POST /api/contact with missing fields → 400 validation_failed', async () => {
  const ctx = await bootTestApp();
  try {
    const res = await fetch(`${ctx.baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Jane' }), // missing email + message
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error, 'validation_failed');
    assert.ok(Array.isArray(body.issues));
  } finally {
    await ctx.close();
  }
});
