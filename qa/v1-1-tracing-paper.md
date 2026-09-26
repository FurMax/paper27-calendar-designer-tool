# V1.1 tracing-paper replacement QA — 2026-09-25

- Production build PASS; 61/61 unit tests PASS, including legacy `linen` → `vellum` saved-project normalization and unchanged other months.
- Chrome and Edge production-preview focused checks PASS: **硫酸纸** selected in the one-row texture strip, same proof/export tile, 1252 × 1843 print PNG generated, lower calendar pixels changed and photo pixels unchanged. No horizontal overflow at 390/360/320 px.
- The first cloud-spot implementation was rejected during sample inspection because the repeated circles looked like a pattern. The accepted implementation uses a 512 px seamless low-frequency satin wash and subtle sheet edge; white-base print sample inspected at page scale: `qa/v1-1-tracing-paper-print.png`.
- Dark-color wash opacity is bounded to reduce impact on white date contrast. Chrome/Edge custom `#555555` print checks produced a dark blank calendar pixel (`[90,90,90]`) while preserving the photo. Formal color proof across real materials/printer and physical iPhone Safari visual review remain open. No deployment.
- Browser test: `tests/browser/tracing-paper.mjs`.
