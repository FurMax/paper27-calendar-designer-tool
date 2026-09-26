# V1.1 central workspace grid QA — 2026-09-25

- Changed only Editor workspace presentation: `#F7F9FC`, one uniform 24px grid at `rgba(108, 132, 164, 0.055)`, no drag-only overlay.
- The Editor calendar proof has a 1px `rgba(80, 105, 140, 0.10)` border and `0 10px 28px rgba(34, 53, 78, 0.08)` shadow. Artwork dimensions, crop and output code are unchanged.
- `npm run build`: PASS.
- Chrome and Edge focused browser checks: PASS at 1280, 1440 and 1920 × 800; artwork stays 384 × 576, month navigation and inspector retain their geometry, and the workspace grid remains the same during crop drag. Narrow 390px layout retains the same workspace treatment and has no horizontal overflow.
- Screenshot: `qa/v1-1-workspace-grid-editor.png`. The calendar remains the strongest visual object. Grid is visible only on closer look; no grid appears in month navigation or Inspector.

Product Owner visual review is pending. No deployment.
