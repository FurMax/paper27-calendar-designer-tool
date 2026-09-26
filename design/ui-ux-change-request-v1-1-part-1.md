# V1.1 Part 1 — controlled UI and calendar-surface enhancement

**Direction:** Product Owner explicitly requested on 2026-09-25. This is a V1.1 enhancement patch, outside the frozen V1 release scope. Implementation is authorized; Part 2 and deployment are not.

## Decision and limit

- Preserve the four-screen flow, crop engine, month geometry, English calendar content, Chinese controls, current photo analysis, persistence and PNG/JPG/ZIP semantics.
- Add ten named fixed background shortcuts. They are optional and do not replace arbitrary HEX/RGB/native picker or the three actual-photo suggestions.
- Add one optional per-month texture setting: none, fine horizontal lines, light grid, wave grid, fine dots or paper grain. It applies only to the calendar background below the photo, at approximately 6–12% mark opacity. The photo is never overlaid. Default and legacy saved projects display no texture.
- Show the same texture in Editor/Review proof and actual digital/print PNG/JPG. Print calendar bleed should continue the background/texture into the bleed, while photo bleed uses the existing source-photo crop.
- Keep UI treatment within Fresh Baby Blue + Milk Mint with a calmer neutral desk. Brand wording stays Calendar Design Studio / 2027 · 月历设计工作台. No new template, decoration placement, animation or export workflow.
- The older V1 documents that exclude textures describe the original V1 baseline. This explicit V1.1 direction is a scoped exception. Product Owner review remains pending; Session 08 release blockers are unchanged.

## Implementation path

1. Store a validated optional texture ID in each month's existing style; no schema-version jump is needed because missing means none.
2. Use a tiny deterministic transparent tile shared by Preview CSS and Canvas rendering, with background-aware dark/light marks.
3. Place texture choices after Background Color in desktop Properties and in the existing mobile Background sheet; keep ten fixed colors and three photo-derived colors visually distinct.
4. Verify build, unit, selected browser workflows, proof/export pixel parity and responsive controls. Stop for Product Owner Part 1 review.
