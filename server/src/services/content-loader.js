import { readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

// Default to <cwd>/content. In production, Passenger sets cwd to the app root.
// In dev, `npm run dev:server` runs from the repo root. Tests use injected loaders
// and don't hit this default.
// Override via CONTENT_DIR env var if needed.
function defaultContentDir() {
  return process.env.CONTENT_DIR
    ? resolve(process.env.CONTENT_DIR)
    : resolve(process.cwd(), 'content');
}

/**
 * File-backed content loader with mtime invalidation.
 * Reads JSON files from <repo>/content/ and caches them.
 * In dev, files are re-read when their mtime changes.
 */
export function createContentLoader({ contentDir = defaultContentDir() } = {}) {
  const cache = new Map(); // key → { mtimeMs, data }

  async function load(key) {
    const path = join(contentDir, `${key}.json`);
    const stats = await stat(path);
    const cached = cache.get(key);
    if (cached && cached.mtimeMs === stats.mtimeMs) {
      return cached.data;
    }
    const raw = await readFile(path, 'utf8');
    const data = JSON.parse(raw);
    cache.set(key, { mtimeMs: stats.mtimeMs, data });
    return data;
  }

  async function loadPage(name) {
    const path = join(contentDir, 'pages', `${name}.md`);
    const stats = await stat(path);
    const cacheKey = `page:${name}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.mtimeMs === stats.mtimeMs) {
      return cached.data;
    }
    const data = await readFile(path, 'utf8');
    cache.set(cacheKey, { mtimeMs: stats.mtimeMs, data });
    return data;
  }

  function clearCache() {
    cache.clear();
  }

  return { load, loadPage, clearCache };
}
