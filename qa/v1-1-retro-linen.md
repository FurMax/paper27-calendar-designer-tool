# V1.1 retro type and linen paper QA — 2026-09-25

- Production build PASS; 60/60 unit tests PASS.
- Chrome and Edge production-preview focused checks PASS. Fraunces loaded as an actual bundled face. Selecting **复古** changes exported title pixels. Selecting **亚麻纸** changes exported calendar-area pixels while photo pixels remain identical. Both print PNGs retain 1252 × 1843 dimensions.
- Current-month export chevron box center matches button center (within 1 px). The existing dropdown handler and four output variants remain unchanged.
- No page horizontal overflow at 390, 360, or 320 px. Font and paper controls remain present; the paper strip scrolls where needed. All twelve month names fit beside the year at Large scale in the 320 px phone proof.
- Sample output: `qa/v1-1-retro-linen-print.png`. Browser checks: `tests/browser/retro-linen.mjs`.
- Physical Safari and printer proof remain open under existing release QA. No deployment.
