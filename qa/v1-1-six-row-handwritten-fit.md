# V1.1 six-row Handwritten Large fit — QA (2026-09-25)

- `npm run build`: PASS.
- Isolated Windows Chrome/Edge production-preview checks (`tests/browser/six-row-handwritten-fit.mjs`): January, May, October 2027 all activate the conditional six-row rule and retain over 20 CSS px of clearance below the final date in the desktop proof. PASS.
- October at 390px and 320px has no horizontal overflow; the final date remains inside the proof, with about 25px and 11px bottom clearance respectively. PASS in Chrome and Edge.
- Short 720px desktop viewport: the final date remains 26px above the proof edge. PASS in Chrome.
- Visual sample: `qa/v1-1-six-row-handwritten-large-october.png`. The final 31 is fully visible.
- Canvas screen/print date geometry is unchanged; its sixth-row center remains y=1700 on an 1800px artwork. This correction affects only CSS proof layout.

Physical iPhone/iPad and Product Owner visual review remain open. No deployment.
