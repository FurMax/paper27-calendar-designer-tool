# V1.1 Sticky Workspace Header — QA (2026-09-25)

- `npm run build`: PASS.
- Windows Chrome and Edge production-preview isolated browser contexts: PASS, via `tests/browser/sticky-workspace-header.mjs`. No existing IndexedDB was cleared or altered.
- Landing Header remains non-sticky.
- Assign, Editor and Review at 1440×900: Header remains at viewport top after scroll, measured 65px including the 1px border. Existing three stage links remain accessible.
- Editor at 1440×900 and 1440×600: sticky proof starts at 80px, below Header; its lower edge remains within the viewport (854px and 566px respectively). The twelve-month bar is static.
- Editor at 820×900: project Header sticky, preview not sticky, no horizontal overflow.
- Editor at 390×844: compact Header measured 57px including border; month selector scrolls offscreen rather than forming another top bar. The stage menu opens with all three existing destinations.
- Review at 390×844 and 320×700: Header sticky, no horizontal overflow. No console exceptions in either browser.
- Dialog layering reviewed by CSS (`.sheet-backdrop` z-index 40 over workspace Header z-index 30); no dialog flow was changed.

Physical iPhone/iPad scroll, Safari browser chrome behavior, and formal release QA remain open. No deployment.
