# V1.1 Editor current-month export menu — 2026-09-25

## Change

The oversized Editor `04 · FINISH` export section and duplicate full-set palette link are gone. The Editor title pairs the compact secondary current-month export menu with the primary Review route. Menu items select print PNG/JPG or digital PNG/JPG without changing the selected month, route or project data. `renderMonthImage` and the existing Blob URL handoff remain the output path. A small anchored state attempts immediate download and retains manual download/retry controls when needed. Review's full-set controls are unchanged.

## Verification

- Production build PASS; current unit suite 60/60 PASS.
- Chrome and Edge production-preview focused run PASS: old bottom section absent; header utility width 106px and right aligned with 10px gap; four menu items; repeat click, Escape and outside pointer close; menu open leaves document height, month navigator top and proof top unchanged.
- All four April actions triggered the existing renderer and one Blob URL download handoff with correct names and MIME: print PNG/JPG 1252 × 1843, digital PNG/JPG 1200 × 1800. Print PNG retained 300 PPI metadata. Switching to July then exporting produced `07-July-2027-Print-106x156mm.png`.
- Desktop proof column remains `position: sticky` at 24px while scrolling. At 390px and 320px, the menu stays inside the viewport and adds no horizontal overflow. No runtime exceptions.
- Visual samples: `qa/v1-1-month-export-menu-desktop.png`, `qa/v1-1-month-export-menu-phone.png`.
- Chrome complete production-preview workflow PASS after the UI change: all twelve print PNGs, digital PNGs, print JPGs, current-month print PNG and digital JPG downloaded as actual files; crop, palette, dates, persistence and responsive regression checks stayed green. The PNG test helper now finds `pHYs` by chunk type because color-profile chunks may precede it.

## Risk and remaining check

The old two-tap flow deliberately used a fresh user activation after async rendering. The new direct action attempts download after the render promise resolves, which may be blocked silently by iPhone Safari. The compact status retains the generated Blob and offers **再次下载** as a fresh-tap fallback, without claiming the browser saved the file. Physical iPhone Safari verification remains open. Product Owner visual review and release gate remain pending. No deployment.
