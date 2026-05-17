import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootTestApp, createFakeContentLoader } from './helpers.js';

test('GET /api/content/services returns loaded JSON', async () => {
  const ctx = await bootTestApp({
    contentLoader: createFakeContentLoader({
      services: { categories: [{ id: 'child-care', services: [] }] },
    }),
  });
  try {
    const res = await fetch(`${ctx.baseUrl}/api/content/services`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.categories[0].id, 'child-care');
  } finally {
    await ctx.close();
  }
});

test('GET /api/content/unknown → 404', async () => {
  const ctx = await bootTestApp();
  try {
    const res = await fetch(`${ctx.baseUrl}/api/content/unknown`);
    assert.equal(res.status, 404);
  } finally {
    await ctx.close();
  }
});

test('GET /api/content/pages/mission renders markdown to HTML', async () => {
  const ctx = await bootTestApp({
    contentLoader: createFakeContentLoader({
      'page:mission': '# Our Mission\n\nServe families well.',
    }),
  });
  try {
    const res = await fetch(`${ctx.baseUrl}/api/content/pages/mission`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/html/);
    const html = await res.text();
    assert.match(html, /<h1>Our Mission<\/h1>/);
    assert.match(html, /<p>Serve families well\.<\/p>/);
  } finally {
    await ctx.close();
  }
});
