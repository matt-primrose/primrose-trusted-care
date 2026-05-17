# Brand Assets

This directory is the **single source of truth** for Primrose Trusted Care brand identity.

## Files

| File | Purpose |
| --- | --- |
| [`palette.json`](palette.json) | Design tokens (colors, typography, logo metadata). Mirrored into `client/src/styles/_tokens.scss`. |
| [`ptc-christ.png`](ptc-christ.png) | **Primary monogram** — PtC with the cross-shaped `t`. Use for header, favicon, footer, formal contexts. |
| [`ptc-child-care.png`](ptc-child-care.png) | **Secondary illustrated mark** — baby with pacifier. Use for child-care sections, social cards, softer family-facing contexts. |
| [`ptc-color-palette.jpeg`](ptc-color-palette.jpeg) | Color reference image. The source of the eyedropper-approximated hex values in `palette.json` (draft until verified against the master design file). |
| [`ptc-font-example.JPG`](ptc-font-example.JPG) | Business-card photo used to identify the typography pairing (Cinzel display, Lato body, Allura script accent). |

## When the Angular client uses these

These files are exposed at `/brand-assets/<filename>` in the browser, thanks to the `assets` entry in [`client/angular.json`](../client/angular.json). They're copied into `client/dist/client/browser/brand-assets/` at build time — don't reference them by their repo path from the client.

## Don't

- **Don't put both marks on the same surface.** Pick one per context.
- **Don't add other Christian iconography** elsewhere on the site — the cross in the monogram carries the brand's faith undertone. Adding crosses to other pages would push past "subtle."
- **Don't invent hex values.** If the palette needs to change, edit `palette.json` and `_tokens.scss` together.

## Adding new assets

1. Drop the file here with a descriptive `ptc-*` name (lowercase, hyphens, no spaces).
2. If it's used by Angular components, no build config change is needed — `assets/**/*` copies everything.
3. Add it to the file table above.
4. For photography: get written consent before publishing any image of a real provider, family, or child. Track consent in a forthcoming `CONSENT.md` here.

## Pending items

- [ ] Verify the palette hex values in `palette.json` against the master design file (current values are eyedropper-approximated from `ptc-color-palette.jpeg` and marked `0.1.0-draft`).
- [ ] Add real founder portraits (currently both founder cards on `/about` use `ptc-christ.png` as a placeholder).
- [ ] Photography drop with written consent log.
