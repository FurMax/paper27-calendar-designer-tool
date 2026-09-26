# V1.1 Photo effects QA

**Status:** automated Chrome/Edge pass; Product Owner visual and real iPhone/iPad review pending. No deployment.

- `npm run build`: PASS.
- `npm test`: PASS (64/64), including default, per-month state, restore, invalid ID, crop/style preservation.
- `node tests/browser/photo-effects.mjs` and Edge with `CDP_PORT=9231`: PASS in isolated production preview.
- All five choices changed the current month immediately. The four processed choices produced distinct PNG photo pixels while the lower calendar pixel was unchanged. Three duotone pairs produced distinct outputs.
- Editor processed preview and digital PNG sample pixels matched exactly for film/cool/duotone; halftone differed at the sampled pixel by at most 3 channel values due to preview scaling.
- Print and digital PNG/JPG all generated with expected dimensions; January effect stayed on January, February remained 原图. Review and restore retained January's effect.
- Mobile emulation at 390px had no page overflow in Review or Editor. No browser exceptions.
- Screenshot: `qa/v1-1-photo-effects-editor.png`.
- Real Safari touch/crop responsiveness and visual fit on actual user photos remain to be checked by the Product Owner. The browser sample uses a synthetic three-tone image and cannot establish subjective filter quality.
