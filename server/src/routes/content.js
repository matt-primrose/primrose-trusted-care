import express from 'express';
import { marked } from 'marked';

const KNOWN_KEYS = new Set(['services', 'founders', 'testimonials']);
const KNOWN_PAGES = new Set(['mission', 'contact']);

export function contentRouter({ contentLoader }) {
  const router = express.Router();

  router.get('/content/:key', async (req, res, next) => {
    const { key } = req.params;
    if (!KNOWN_KEYS.has(key)) {
      return res.status(404).json({ error: 'unknown_content_key' });
    }
    try {
      const data = await contentLoader.load(key);
      res.set('Cache-Control', 'public, max-age=60');
      res.json(data);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ error: 'content_missing' });
      }
      next(err);
    }
  });

  router.get('/content/pages/:name', async (req, res, next) => {
    const { name } = req.params;
    if (!KNOWN_PAGES.has(name)) {
      return res.status(404).json({ error: 'unknown_page' });
    }
    try {
      const markdown = await contentLoader.loadPage(name);
      const html = await marked.parse(markdown);
      res.set('Cache-Control', 'public, max-age=60');
      res.type('text/html').send(html);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ error: 'page_missing' });
      }
      next(err);
    }
  });

  return router;
}
