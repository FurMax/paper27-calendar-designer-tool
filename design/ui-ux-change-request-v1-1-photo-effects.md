# V1.1 Photo effects — local Editor addition

**Owner direction:** 2026-09-25. **Status:** implemented for Product Owner review. No deployment or release gate change.

The Editor adds one compact per-month photo-effect strip beneath photo crop controls. Five choices are 原图, 胶片, 冷调, 半调, 双色映射. The last choice exposes exactly three fixed pairs: 深蓝 × 奶白, 酒红 × 浅粉, 墨绿 × 米白. There is no strength control in this first pass: keeping each treatment as one stable choice makes selection quick and output predictable.

The effect is non-destructive and stored on the month slot as an optional `photoEffect` object. Existing schema-version-1 projects default to 原图. It does not alter the source asset, crop, per-month calendar background/texture/text, project typography, photo color recommendations, assignment, or export geometry. The existing project persistence stores it with the month.

Editor and Review use the existing crop transform with a processed photo canvas. The PNG/JPG renderer applies the same color/halftone function only to the photo region after the existing print bleed composition. Calendar artwork below the photo is never processed. The effect preview uses a smaller raster for interaction speed; fine halftone dots can differ by a few pixels from full-resolution output, while color treatment follows the same formula.

This is an approved bounded extension to the V1.1 visual features; no AI editing, adjustable filter stack, or expanded preset gallery.

**Superseded on 2026-09-25:** the three-pair limit and original endpoint RGB values above are replaced by the six owner-specified pairs and swap in `design/ui-ux-change-request-v1-1-editor-progressive-duotone.md`.
