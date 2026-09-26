# V1.1 local type and paper refinement — 2026-09-25

**Directed by Product Owner.** Scope: center the compact current-month export chevron, add one curated English calendar type preset, and add one restrained paper texture. No other Editor layout or export behavior changes.

- Export trigger uses a fixed-size, centered CSS chevron rather than a font glyph whose baseline varied.
- Add **复古** as a fourth project-wide calendar preset: locally bundled OFL-licensed [Fraunces](https://github.com/google/fonts/tree/main/ofl/fraunces), with month weight 600 and detail weight 400. Existing three presets, scale settings, and Chinese product UI fonts stay unchanged. The new face is loaded explicitly for canvas exports.
- Add **亚麻纸** as a seventh optional per-month texture. It uses a 96 px deterministic, low-alpha woven-fiber tile. The same tile draws in CSS proof and canvas PNG/JPG output, only on the lower calendar color region; photos remain untouched. Existing saved projects continue to default to no texture.
- The existing 40 px thumbnail strip scrolls on very narrow phones to accommodate the new option.

This supersedes the earlier three-font and six-texture option counts for the current build. Product Owner visual/device review remains open. No deployment or release approval.
