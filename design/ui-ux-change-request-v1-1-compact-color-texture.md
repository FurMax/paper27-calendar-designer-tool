# V1.1 Editor compact color and texture controls

**Status:** Implemented for Product Owner review (2026-09-25).

This scoped follow-up supersedes the right-rail round-color and lower texture-card presentation in `ui-ux-change-request-v1-1-editor-round-colors.md`. Background becomes one compact card with three no-wrap rows: Recommendation (the same three crop-derived suggestions), Common (the same ten fixed colors), and Custom (a toggle revealing the existing HEX/RGB/native picker, closed by default). Recommendation/common samples are 28–32 px circles with a two-pixel selected ring, accessible names and hover/focus tooltips. Common colors may scroll horizontally. Remove the separate current-color card. Keep the existing precise photo pixel sampler as a small action in the recommendation row.

Texture keeps the same six state values and previews but uses a one-line strip: a Clear action for `none`, plus five 40 px square previews with tooltips and a selected ring. No label is printed beneath thumbnails. The texture still applies only to the date area.

No changes to the Editor grid, other panels, crop, photo analysis, project schema, output renderer, or export flow. Validate collapsed right-rail background height near or below 200 px; scrolling, focus, selection, exact-color toggle, texture application and output, phone sheet, and no horizontal page overflow. No deployment.
