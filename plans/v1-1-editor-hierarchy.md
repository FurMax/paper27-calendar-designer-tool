# V1.1 Editor hierarchy follow-up

**Scope:** UI placement and density only, explicitly directed by the Product Owner on 2026-09-25.

1. Keep month preview, crop/photo actions, current background, photo recommendations, and ten compact color shortcuts in the quick rail.
2. Move precise color, texture, typography, important days, single export, and whole-set palette entry beneath the proof as Style / Dates / Export sections.
3. Keep the existing Review palette preview/apply/restore and all current data/export behavior.
4. Check desktop and 320/390 px phone layout, keyboard labels/focus, crop, colors, textures, date marks, month switching, and PNG/JPG exports.
5. Stop at Product Owner review; no Part 2 or deployment.
## Product Owner follow-up (2026-09-25)

Round the fixed and photo-derived color samples, move precise color back into the desktop rail and phone background sheet, and make Export the last standalone full-width workbench panel. Keep existing actions, model, photo analysis, and renderer. This supersedes the precise-color placement and two-column Dates/Export row specified above; validation is in `qa/v1-1-editor-round-colors.md`.
## Compact controls follow-up (2026-09-25)

Only Background and Texture presentation is in scope. Background keeps the same photo/common colors and precision/pixel-sampling logic but compresses to Recommendation, Common and Custom rows with default-collapsed HEX/RGB. Texture keeps the same six values with Clear plus five 40 px previews in one row. The current-color card is removed. The previous round 2 × 5 grid and large texture cards are superseded. Validate 200 px maximum collapsed panel target, one-row texture, keyboard names, phone scrolling, and unchanged crop/export. No deployment or Part 2 work.

## Superseding layout direction — 2026-09-25

The Product Owner later approved a continuous right rail. Style and Date move from the lower cards into the rail after Text Color; the desktop proof becomes sticky and viewport-fitted, while Export remains standalone. The earlier lower-card placement in this plan is superseded. See `design/ui-ux-change-request-v1-1-editor-continuous-rail.md`.
