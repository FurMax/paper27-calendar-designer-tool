# V1.1 Important Date asterisk follow-up — QA (2026-09-25)

The Product Owner asked to replace the upper-right red dot with a small red `*`. The third selector now reads 星号. Its stored style ID remains `dot`, so existing projects restore with the new presentation and keep all marked dates.

- `npm run build`: PASS.
- `npm test`: 62/62 PASS.
- Isolated Windows Chrome/Edge production-preview regression (`tests/browser/important-mark-placement.mjs`): retro font, large scale, January 18, all three styles, digital PNG, print JPG, Review, restore and 320px layout: PASS. No runtime exception.
- Browser proof pseudo-element reports `"*"`; its bounds clear the adjacent January 11 and 25 cells. All export photo hashes remain equal across styles; marked-date hashes change.
- Cropped actual PNG inspection confirms a small red asterisk at the upper right of 18, without reaching 11 or 25. Sample: `qa/v1-1-important-mark-placement-asterisk.png`.

Physical device and Product Owner visual review remain open. No deployment.
