# V1.1 Part 1 — implementation and QA evidence

**Status:** Implemented for Product Owner review on 2026-09-25. The V1 release gate remains open; no deployment or Part 2 work occurred.

## Delivered

- Ten exact named fixed Common Colors: #F7F4EE, #E6EBE8, #E9E1D3, #CFE8D6, #BFD1C3, #B7D7F2, #95A8C7, #F3EEA4, #F4C7C3 and #D9C7EB. Clicking one updates only the active month. Existing Auto text contrast recalculates; arbitrary picker/HEX/RGB remain.
- The three current-crop photo colors still show 主色 / 搭配色 / 点缀色, a larger swatch, HEX and clear selected state. Their actual extraction algorithm was not changed.
- Six per-month choices: 无纹理, 细横线, 浅网格, 波浪格, 细点阵, 纸张肌理. The transparent tile is shared by CSS proof and Canvas output; it paints only the lower calendar area and continues into print calendar bleed. Existing saved projects resolve to 无纹理 without a migration.
- V1.1 desk polish warms the neutral workspace, softens the baby-blue action tone, and tightens panel/brand hierarchy. The Calendar artwork remains the visual focus. No GSAP, crop, export-control, template, Important Date or favicon change was made.

## Verification

- PASS — final production build: 78 modules, JS 379.38 kB / 125.37 kB gzip; CSS 56.29 kB / 10.64 kB gzip. Compared with the preceding pre-release bundle, JS is +4.24 kB raw / +1.43 kB gzip; CSS +3.83 kB raw / +0.52 kB gzip. No package dependency changed.
- PASS — 59/59 unit tests, including six bounded IDs, legacy missing-texture default and invalid-ID rejection.
- PASS — focused isolated production-preview Windows Chrome 153 and Edge 153: ten exact Common Colors, Auto ink, three distinct photo suggestions, six texture controls and selected states, actual photo-unmodified/digital PNG calendar-changed pixel hashes for all five non-none textures, print PNG/JPG dimensions, lower print-bleed texture difference, digital JPG, save/reload/Review persistence, 390 px phone sheet with no horizontal overflow, valid twelve-entry textured print PNG ZIP. No runtime exceptions. Machine evidence: qa/v1-1-part-1-9230.json and qa/v1-1-part-1-9231.json.
- PASS — established full production-preview regression rerun in both browsers after this change: first-time/returning flow, crop and emulated touch, 2027 dates, three photo suggestions, typography/important dates, full print/digital PNG/JPG ZIPs, failure/retry/two-tab conflict, GSAP rapid switch, reduced motion and responsive widths. See the preserved qa/v1-1-full-workflow-9230.json and qa/v1-1-full-workflow-9231.json rerun results for the V1.1 bundle.
- Visual review: qa/v1-1-editor-desktop.png, qa/v1-1-texture-phone.png and the actual qa/v1-1-paper-print-sample.png. The paper texture is deliberately faint and the synthetic photo remains clean.

## Deliberate choices and limits

- The old four visible Quick Colors were replaced by the requested ten to keep the control shelf compact. Pure white and dark green remain available through arbitrary picker/HEX/RGB.
- Texture overlays the calendar color below the photo, rather than the entire page, to protect photo edges and reading contrast. Opacity is fixed by style; no per-user intensity slider, custom pattern upload or decoration placement was added.
- Chrome/Edge runs use synthetic photos and browser touch emulation. Current-build iPhone/iPad Safari, real photo aesthetics and printer proof remain Product Owner/device QA. Original Session 08 HIGH items (Auto contrast acceptance and low-resolution warning) are not resolved by this patch.

## Product Owner review focus

1. Desktop Editor: fixed colors versus photo recommendations, right-panel rhythm and whether the desk grid stays quiet.
2. Phone Background/Texture sheet: ten colors, six patterns, scrolling and tap comfort.
3. Apply a texture, reload, then compare Editor/Review and one print PNG/JPG. Check that texture stays below the photo and is subtle enough for text.
4. Give Part 1 feedback or approval. Part 2 and deployment wait for a separate direction.

## Continuous-rail follow-up — 2026-09-25

The earlier lower Style/Date layout results are superseded by `qa/v1-1-editor-continuous-rail.md`. The color/texture and export behavior evidence remains applicable.
