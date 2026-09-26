# Pre-deployment final QA — 2026-09-26

## Bug log (recorded before fixes)

### QA-01 — Review dialogs ignore Escape (MEDIUM)

- Reproduction: In production preview, complete twelve months, open Review > 为全部月份推荐配色, wait for the 12 suggestions, then press Escape. The palette dialog remains open. The Review export dialog also has no Escape key handler in its implementation.
- Expected: Escape closes the current Review dialog and returns keyboard focus to its trigger. While an export is working, Escape should cancel that run without changing saved project data.
- Actual: The shared focus trap keeps Tab inside the dialog, but Escape does nothing. The visible close/cancel buttons still work.
- Scope: Review transient dialogs only. This is an accessibility and keyboard interaction defect; no data loss or blocked pointer workflow observed.
- Severity: MEDIUM.
- Status: Reproduced; fixing locally, then rerunning keyboard and related Review/export regressions.

### QA-02 — Mobile Editor month sheet ignores Escape (MEDIUM)

- Reproduction: In a 390 px production-preview viewport, enter Month Editor, open the current-month selector, then press Escape. The `选择月份` dialog stays open.
- Expected: Escape dismisses the sheet and returns focus to the month selector without changing the selected month.
- Actual: The focus trap remains active and Escape has no effect; the close button or backdrop still works.
- Scope: Editor month/background/crop sheets share the same missing keyboard-close path. Photo sampling has its own Escape handler and will be checked separately.
- Severity: MEDIUM.
- Status: Reproduced; fixing the three Editor sheets locally, then rerunning mobile and full workflow checks.

### QA-03 — New-project confirmation ignores Escape (MEDIUM)

- Reproduction: With a saved project, return to Entry, choose `新建日历`, then press Escape. The confirmation dialog remains open.
- Expected: Escape dismisses the confirmation before replacement begins, leaving the project intact and returning focus to `新建日历`.
- Actual: Only the close/cancel button or backdrop dismisses it. The required newer-tab conflict alert is intentionally not dismissible.
- Severity: MEDIUM.
- Status: Reproduced; fixing only this confirmation, then retesting persistence and the full workflow.

## Final disposition

- QA-01: **FIXED**. Review palette closes on Escape; active full-set generation cancels on Escape; other export states close. The shared focus trap restores the trigger. Chrome and Edge focused checks pass.
- QA-02: **FIXED**. Mobile Editor month, background and crop sheets close on Escape. Chrome and Edge 390 px checks pass. The photo sampler retains its existing dedicated Escape handler.
- QA-03: **FIXED**. New-project confirmation closes on Escape only before replacement starts. The conflict alert remains intentionally non-dismissible. Chrome and Edge checks pass.
- Open confirmed bugs: **BLOCKER 0, HIGH 0, MEDIUM 0, LOW 0** in the tested build.

## A. Build

**PASS.** `npm run build` runs `tsc -b` and Vite successfully after the final fix; 80 modules transform. `npm test` passes **64/64**. There is no lint script. All four bundled font files appear in `dist/assets`; the production app sources contain no localhost, LAN, spike or prototype runtime URL. The production preview responds with HTTP 200 on loopback and `192.168.31.102:4173`.

## B. Desktop browser matrix

| Browser | Result | Evidence |
| --- | --- | --- |
| Windows Chrome 153, production preview | **PASS** | Fresh project through actual downloaded print/digital PNG and JPG, full-set ZIP, failure/retry, save/conflict, rapid month switching, responsive layouts. `qa/final-qa-chrome.log`. |
| Windows Edge, production preview | **PASS** | Same complete flow and focused controls. `qa/final-qa-edge.log`. |
| Automated WebKit | **NOT TESTED** | No WebKit automation/browser is available in this Windows workspace. This is not a real Safari result. |

The tested development-only `5174` server is not the basis of this result. Chrome and Edge used the built app at port `4173`.

## C. Mobile automation

**PASS within Chrome/Edge emulation; real iPhone Safari remains untested on this build.** Isolated 390 px sessions started with no project and imported twelve photos, entered Assign and Editor, changed month/effect/duotone/background/texture/type/important date, visited Review, prepared and initiated ZIP delivery, used browser Back/Forward, refreshed and resumed. No document horizontal overflow or runtime exception. Separate responsive runs cover 320 px, 390 px, 844 px landscape, 1000 px and 1440 px; touch emulation covers one-finger crop, two-finger zoom and reset. Logs: `qa/final-qa-mobile-flow-chrome.log`, `qa/final-qa-mobile-flow-edge.log`, `qa/final-qa-chrome.log`, `qa/final-qa-edge.log`.

## D. Core flow

**PASS.** Clean start, picker cancel, fewer than twelve photos, exactly twelve photos, missing-month gating, replacement with crop reset/style retention, assignment, crop/zoom/reset, all twelve months, review navigation, sticky header and browser Back/Forward were exercised. Unit tests cover move, swap, reuse, returned upload order and twelve 2027 Sunday-first date grids. Rapid month switching ends on the requested month without stale state or visible gap in Chrome/Edge frame checks.

## E. Persistence and conflicts

**PASS.** Editor and Review states resume after IndexedDB autosave and reload. Checks include photo effects, duotone, background, texture, font, important marks, palette apply/undo, location and crop. Simulated save failure preserved the last valid revision; retry incremented it. Two-tab stale-write protection blocked the old tab. A separate closed-browser/device restore is a real-device item.

## F. Review and full-set palette

**PASS.** Twelve Review cards match the Editor's stored photo/style state. Palette modal shows twelve photo-based proposals; when January already equals its recommendation, the action and note accurately state **11 months changed, 1 unchanged**. Apply and undo preserve the already matching month. Focus remains inside the palette dialog; Escape closes it.

## G. Export and file inspection

**PASS.** Actual UI downloads were read and decoded, rather than only checking Blob creation. Single current-month print/digital PNG/JPG: dimensions 1252×1843 and 1200×1800 as appropriate, correct month and supported format. Complete ZIP: exactly twelve ordered, uniquely named files, valid PNG/JPG data, 2027 date positions, image bleed coverage and 300 PPI print metadata. The same project's print PNG ZIP was exported twice in immediate succession; all twelve corresponding file SHA-256 hashes matched exactly, with genuine progress events in both runs. Cancel, failure and retry remained usable. Focused checks compared photo-effect preview/Review/export pixels; all five effects, six current duotone choices and swap were exercised. Tracing-paper print PNG changed only the calendar region, retained photo pixels, and kept the bundled retro font. All six optional textures were each exported through all four print/screen PNG/JPG combinations in Chrome/Edge: the calendar pixels changed and the photo pixels remained identical to the no-texture baseline. Ten fixed colors, three photo recommendations, valid/invalid HEX, RGB 0/255 and four fonts × three scales were also checked in Chrome/Edge. Logs: `qa/final-qa-photo-effects-*.log`, `qa/final-qa-important-mark-style-*.log`, `qa/final-qa-controls-*.log`, `qa/final-qa-tracing-retro-*.log`.

## H. Remaining validation, not confirmed bugs

- **REAL DEVICE REQUIRED:** Current-build iPhone Safari touch/pinch, sticky scrolling, image decode, font loading, memory pressure, IndexedDB after browser relaunch, and downloaded PNG/JPG/ZIP handoff. Automated mobile emulation is not Safari.
- **REAL DEVICE / PRINT REQUIRED:** Named-printer proof and photo-color appearance in the owner's actual image viewer. A prior MagicView screenshot compared two April export versions; same-file comparison remains open. Pixel-level browser/export checks did not establish a product color shift.
- **NOT TESTED:** macOS Safari, Android Chrome, and automated WebKit are unavailable on this host. These are support-matrix gaps, not PASS results.
- **Performance limit:** Fresh-load and interaction runs showed no obvious stall; two consecutive complete exports succeeded. The synthetic test photos are much smaller than some real phone photos, so this does not prove worst-case Safari memory behavior.

## I. Fixed bugs

| ID | Severity | Fix | Regression |
| --- | --- | --- | --- |
| QA-01 | MEDIUM | Review palette/export Escape handling with cancel during active generation. | Focused Chrome/Edge, complete Review/export flows, unit/build. |
| QA-02 | MEDIUM | Editor's month/background/crop sheet Escape handling. | 390 px Chrome/Edge, mobile flow, unit/build. |
| QA-03 | MEDIUM | Entry new-project confirmation Escape handling before replacement. | Chrome/Edge confirmation, complete core flows, unit/build. |

No feature, palette, artwork renderer, project model or export algorithm changed in these fixes. Existing older browser harnesses had stale UI selectors and were updated only where reused for this QA; their initial assertion failures were not product defects.

## J. Short real iPhone Safari handoff

Open **http://192.168.31.102:4173/** on the same Wi-Fi. This is the production preview bound to `0.0.0.0`, not a deployment.

1. Open the page, select several real photos and assign them; edit one month.
2. Drag the photo with one finger, pinch with two fingers, switch months rapidly and try a photo effect plus a duotone preset.
3. Change background, texture, font and one important date; scroll the long page and check the sticky header.
4. Refresh and resume; confirm those edits survive. Review the month and use **导出本月** for one file.
5. Prepare and download the twelve-month ZIP, open it in Files, and confirm all twelve images are present. Note any visible color difference, white border, missed touch, stuck dialog or obvious lag.

Real Safari status stays **REAL DEVICE REQUIRED** until the owner reports this run. No deployment was performed.

## Gate

**V1 — READY FOR DEVICE SMOKE TEST.** Confirmed BLOCKER = 0 and HIGH = 0 in the tested production build. This does not pass the release/deployment gate and does not replace iPhone Safari, printer or unavailable browser-matrix validation.

## Device smoke follow-up — print PNG top bleed defect (2026-09-26)

**QA-04 — HIGH; gate reopened.** The Product Owner reports that one print PNG sometimes has a white band along the photo top although the trim preview appears clean; increasing photo zoom removes it. Other iPhone smoke items were reported normal.

- Reproduction: Import a 1200×1044 photo with a 50 px white source strip at the top and dark pixels below. Keep zoom at 1. In Editor the print trim preview and current edge warning look clean. Export January print PNG. Pixel (600,2) is white, while (600,38) is dark. The exact output is 1252×1843 px.
- Expected: The Editor or export preflight must detect an unwanted pale source edge anywhere in the **full print photo including bleed**, so the owner can zoom/reposition before downloading. The preview warning must not silently miss a print-only white band.
- Actual: `analyzePhotoEdgeRisk` sampled only the trim-sized photo, although `addPrintBleed` draws source photo pixels into the outer 3 mm. The source strip can live wholly in bleed and escape the existing check.
- Evidence: `tests/browser/print-top-bleed-edge.mjs`, `qa/print-top-bleed-edge-before.log`.
- Fix scope: Align the existing non-blocking edge warning and export preflight with the actual print-bleed photo rectangle. Do not alter crop geometry or silently zoom the user's image, since a pale source background can be intentional.
- Status: Reproduced; HIGH remains open until fixed and related production flows rerun. The prior READY FOR DEVICE SMOKE TEST designation is suspended for this build.

### QA-04 correction and verification

The production edge scan now samples the **entire print photo rectangle, including the 3 mm bleed**, using the same placement as `addPrintBleed`. The Editor warning names the hidden print bleed, and Review's existing full-set preflight uses this same scan. Photo pixels, saved crop, print geometry and export rendering were not changed; the owner can zoom or reposition when the source itself has a pale margin.

- Focused 1200×1044 source-strip reproduction on the final build: Chrome and Edge both show `上方` in Editor and `1 月 · 上方` in Review. The unadjusted 1252×1843 print PNG has white pixel (600,2) and dark pixel (600,38); zooming to 1.2 clears the warning and makes pixel (600,2) dark. No browser runtime errors. See `qa/print-top-bleed-edge-after-chrome.log` and `qa/print-top-bleed-edge-after-edge.log`.
- Related production regression: complete Chrome and Edge workflows passed, including 12 print PNGs, repeated 12-PNG export, digital PNG, print JPG, single-month files, save/failure recovery, crop and responsive checks. Mobile-width core flow passed in Chrome and Edge. Unit tests 64/64 and final `npm run build` passed.
- Product Owner screenshots of February show a roughly 20 px pale-pink uniform band above the textured photo in the iPhone file viewer, while the trim preview starts with brick texture. The uploaded files are **screenshots**, not the original PNG or source photo. This is consistent with a source strip visible only in bleed, but the exact owner file cannot yet be proven to share the synthetic reproduction's cause.
- Severity after correction: the reproduced blind spot is fixed. **Focused real iPhone recheck of the affected February print PNG remains required** before closing QA-04 and restoring the deployment gate. Check that the new Editor warning appears before zoom, clears after zoom, and that the newly exported PNG has no top band. No deployment.

## Session 08 Product Owner acceptance — 2026-09-26

The Product Owner explicitly accepted the current Calendar Design Studio project for Session 08 on 2026-09-26. This is acceptance of the current product/workflow after the owner reported the other iPhone functions normal. The photo-top pale band traced to a white source-image edge was deferred by the owner; the focused edge-warning correction passed Chrome/Edge regression, but the affected file has not been re-exported and checked on iPhone. This remains a known exception, not a PASS.

Formal evidence rows retain their actual status: macOS Safari/Chrome/Edge and Android Chrome NOT TESTED; named-printer proof and current-stable Safari PARTIAL/NOT TESTED as recorded; Auto contrast and low-resolution-warning decisions OPEN. Product Owner acceptance does not convert these to PASS, nominate a Release Candidate, authorize production deployment, or begin the next gate. Deployment requires a separate explicit decision.
