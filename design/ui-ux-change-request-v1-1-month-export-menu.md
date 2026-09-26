# V1.1 Editor current-month export menu — UI / UX change request

Directed by the Product Owner on 2026-09-25 after review of the oversized `04 · FINISH` section.

## Scope and decision

- Remove the entire Editor-only bottom export section, including its variant/format selector cards and the duplicate full-set palette link. Keep full-set palette and batch export in Review.
- Add a compact secondary `导出本月⌄` control immediately left of `预览与导出` in the Editor title row. Its menu contains four direct actions: print PNG, print JPG, digital PNG, digital JPG. Menu selection targets the currently edited month and must not change its saved project style, current month or route.
- Reuse `renderMonthImage` and the existing Blob URL download handoff; preserve dimensions, bleed, 300 PPI, color and photo rendering. The print proof remains the Editor's current default; menu selection does not switch proof mode.
- Close menu on repeat click, outside pointer, Escape and option selection. Menu is an absolute overlay with no layout shift, keyboard-visible focus and compact responsive wrapping.
- Try automatic browser handoff after the asynchronous render. Keep a small prepared-file download action as fallback because iOS Safari may not honor a download initiated after user activation expires. Do not claim the file was saved solely because a click was dispatched.

## Non-goals

No changes to Calendar Canvas, crop, month navigation, inspector controls, Review screen, app navigation, product colors, typography, project data or export algorithm.

## Verification

Check old section absent; two actions near the Editor title; four actual output combinations and current-month file names; no menu layout shift; outside click/Escape/focus; no extra palette entry; responsive and sticky proof/inspector behavior; direct handoff and fallback status. Product Owner visual review remains pending. No deployment.
