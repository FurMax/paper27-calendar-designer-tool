# V1.1 Editor continuous settings rail — UI / UX change request

Directed by the Product Owner on 2026-09-25. This supersedes the earlier V1.1 lower Style and Date card placement.

## Scope

- Desktop Editor: a viewport-bound sticky proof on the left and a continuous right settings rail ordered Photo, Background, Text Color, Style, Date.
- The proof keeps its 2:3 artwork ratio and fits within `100dvh - 48px`. Below 1024px the rail stacks after the proof and sticky positioning is removed.
- The right rail uses 24px section rhythm and separators. Style and Date become sections in that rail; their former lower cards are removed. Export remains one separate final section below the two-column layout.
- Background retains three compact palette rows and a collapsed HEX/RGB precision control. Texture retains the single-line strip with Clear and five 40px previews.
- Text color moves next to Background. Auto/Custom, custom picker/HEX, and the existing non-blocking contrast warning retain the same behavior and state.

## Boundaries

No changes to project fields, color/photo sampling, crop, typography, texture, important-date, export, or palette algorithms. No new animation or color scheme.

## Review

Check desktop at short and tall viewport heights, 1024px boundary, phone stacking, immediate contrast warning response to background changes, and photo/crop/export behavior.
