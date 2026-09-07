# Brand Assets

This directory is the **single source of truth** for Primrose Trusted Care brand identity.

## Files

| File | Purpose |
| --- | --- |
| [`palette.json`](palette.json) | Design tokens (colors, typography, logo metadata). Mirrored into `client/src/styles/_tokens.scss`. |
| [`ptc-christ.png`](ptc-christ.png) | **PtC monogram** (square, white background) — PtC with the cross-shaped `t`. Used in the site header and footer (CSS-clipped to a circle via `border-radius: 50%`), and in formal/print contexts. The brand's identity mark. |
| [`ptc-christ-circle.png`](ptc-christ-circle.png) | **PtC monogram** (circular, white background preserved, corners transparent) — same monogram clipped to an inscribed circle. Use as the browser-tab favicon and anywhere a true round shape is needed without relying on CSS clipping. |
| [`ptc-child-care.png`](ptc-child-care.png) | **Illustrated mark** (white background) — baby with pacifier. Use on white surfaces. |
| [`ptc-child-care-transparent.png`](ptc-child-care-transparent.png) | **Illustrated mark** (transparent background) — same illustration with white pixels (including letter counters) converted to alpha=0. Use on colored/gradient surfaces (e.g., the home hero) so the logo doesn't show a white square halo. |
| [`ptsf_side.png`](ptsf_side.png) / [`ptsf_back.png`](ptsf_back.png) | **Safe Ride van artwork, full scene** (owner-supplied source) — side and rear views of the branded van, including sky/trees/road background. ~2 MB each; too heavy to ship to the browser. Keep as the source of truth for the derivatives below. |
| [`ptc-safe-ride-back.jpg`](ptc-safe-ride-back.jpg) | **Safe Ride van, rear view** (1100x1005) — the artwork in the home-page "Coming Soon" banner. `ptsf_back.png` scaled down and JPEG-encoded by [`scripts/resize-image.ps1`](../scripts/resize-image.ps1), artwork otherwise untouched (~215 kB vs the 1.8 MB source). Regenerate rather than hand-editing. |
| [`agape-love-investigations-logo-web.png`](agape-love-investigations-logo-web.png) | **Partner logo** (1080x566, transparent) — Agape Love Investigations, the firm that runs provider background checks. Shown in the credit blurb at the bottom of the home page, on a white card because the logo's rose ink has almost no contrast against the page's rose gradient. Owner-supplied and already web-sized; no processing step. |
| [`ptc-color-palette.jpeg`](ptc-color-palette.jpeg) | Color reference image. The source of the eyedropper-approximated hex values in `palette.json` (draft until verified against the master design file). |
| [`ptc-font-example.JPG`](ptc-font-example.JPG) | Business-card photo used to identify the typography pairing (Cinzel display, Lato body, Allura script accent). |

## When the Angular client uses these

These files are exposed at `/brand-assets/<filename>` in the browser, thanks to the `assets` entry in [`client/angular.json`](../client/angular.json). They're copied into `client/dist/client/browser/brand-assets/` at build time — don't reference them by their repo path from the client.

## Don't

- **Don't put both marks on the same surface.** Pick one per context.
- **Don't add Christian iconography elsewhere on the public site.** The cross in the PtC monogram (visible in the header and footer) carries the faith undertone; adding additional crosses or churchy imagery to other pages would push past "subtle."
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
