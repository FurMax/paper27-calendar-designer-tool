# Calendar Design Studio V1 — Pre-release regression and QA

**Run:** 2026-09-24/25. **Scope:** current production build served from an isolated Vite preview at http://127.0.0.1:4173/. No deployment and no product-code changes in this run. The Product Owner's LAN development site and saved project were not touched.

**Result:** Automated Windows Chrome/Edge regression **PASS**. **V1 — Ready for Product Owner Device Smoke Test** means this build is ready for the next short hands-on check; it is **not** Release Candidate or deployment approval. The formal Session 08 release gate remains open.

## 1. Production build

- PASS — npm run build completed TypeScript checking and Vite production bundling before browser QA. Production browser tabs loaded the hashed dist asset, rather than source modules.
- Lint: NOT CONFIGURED — package.json has no lint script. This is not recorded as a passing lint run.
- PASS — npm test: 56/56 unit tests.
- PASS — node --check on the production-preview browser harness.

## 2. Automated test result

The isolated production-preview harness (tests/browser/pre-release-preview.mjs) passed in headless Windows Chrome 153 and Edge 153 with zero captured runtime errors. It used the product UI, browser-managed downloads and decoded exported files. Exact machine-readable results: v1-pre-release-9230.json and v1-pre-release-9231.json in this directory. Chrome screenshots: v1-pre-release-entry-desktop.png, v1-pre-release-review-desktop.png and v1-pre-release-editor-phone.png. Screenshots were visually reviewed.

Browser automation injects File objects and emulates touch; it does not exercise the physical OS picker, Safari browser chrome, iPhone memory pressure or a printer. Prior development-server regressions remain supporting evidence only.

## 3. Core workflow and artwork

- PASS — first-time Entry, picker cancel, unreadable image rejection, 2-photo partial project (10 Missing Photo; whole-set export disabled), photo replacement with old item returned to Unassigned, Start New cancel/confirm, and ordered 12-photo assignment.
- PASS — edit, drag/zoom/reset crop, three distinct photo-derived background suggestions, selection reflected in Preview, manual HEX, recalculated Auto text color, three typography presets, three sizes, Important Date add/remove and Preview, Review, single export and full-set export. Long month headings were checked for all 3 × 3 type combinations on September, November and December.
- PASS — all twelve 2027 Preview grids: Sunday first, six weeks/42 cells, month lengths, weekday positions and blanks. The real print and digital PNG files were checked for the same 504 date positions; January's Important Date ink was verified in a real exported PNG. Export coverage used synthetic source photos and a nondefault crop.
- PASS — current-month suggestions were derived from the active synthetic photo; the 12-month palette produced 12 distinct source-based colors. Preview did not mutate stored colors; Apply and one-step Restore survived reload.
- PASS — desktop pointer drag, zoom and reset; CDP-emulated phone one-finger drag, two-finger pinch, zoom and reset; crop coverage flags and sampled output edges showed no uncovered area. GSAP did not take over the crop interaction.
- PARTIAL — the physical picker, native HEIC, large phone originals, all color-extraction fallback images and real touch/scroll still require physical-device evidence. Auto contrast acceptance remains a separate HIGH decision.

## 4. Export

- PASS — print PNG ZIP: 12 ordered, unique valid files, each 1252 × 1843; PNG physical-resolution metadata about 300 PPI; genuine photo pixels through sampled bleed edges; correct 2027 calendar cells.
- PASS — digital PNG ZIP: 12 ordered files, each 1200 × 1800; 504 correct date-cell positions; covered photo edges.
- PASS — print JPG ZIP: 12 ordered files, each 1252 × 1843; valid JPEG markers, JFIF 300 dpi density and sampled photo edge colors.
- PASS — single print PNG and single digital JPG downloads, with expected names, dimensions and January important mark in the PNG. Cancel left the saved project intact. Injected font/export failure displayed an error; Retry produced a complete 12-file digital JPG set without changing the project revision.
- PARTIAL — single-file runs covered one PNG/print and one JPG/digital combination; the two full-set formats and print/digital variants above provide broader format evidence. Named-printer submission and physical trim/bleed proof remain unverified. No CMYK claim is made; the agreed printer brief permits RGB.

## 5. Persistence

- PASS — autosave and Resume restored screen, selected month, photo Blobs, crop, colors, type and Important Date. Start New confirmation and cancellation behaved correctly.
- PASS — injected IndexedDB save failure preserved the last committed revision and data; retry advanced the revision. A second tab wrote a newer revision and the stale tab was blocked.
- PARTIAL — real device storage quota, Safari eviction and interrupted backgrounding remain untested.

## 6. GSAP regression

- PASS — Landing stack settled into three distinct paper positions. A frame trace of month switching kept at least one proof fully covering the workspace; the incoming image decoded before reveal. Jan → Feb → Mar → Apr ended on Apr with no stale proof layer or animation queue.
- PASS — repeated photo suggestion actions ended on the last chosen color; repeated full-set palette previews and Apply/Restore kept the correct data. Export progress followed real file generation; no artificial delay was added.
- PASS — no captured runtime exception in Chrome or Edge. The inspected screenshots showed no unexpected layout displacement.
- LIMIT — animation feel and Safari smoothness require the Product Owner's short hands-on check. Existing local flash correction had already been reported as fixed by the Product Owner before this run.

## 7. Reduced motion

- PASS — emulated prefers-reduced-motion: reduce left Landing directly in its final arrangement, switched months without an outgoing layer, displayed the palette directly and retained text export status. The Important Date mark remains a nonanimated, visible state.
- PARTIAL — physical iOS accessibility settings and VoiceOver were not tested.

## 8. Browser and responsive result

| Platform | Result | Evidence |
|---|---|---|
| Windows Chrome 153, headless | PASS for this automated production-preview suite | Isolated profile, actual downloads and exported-file checks; native picker and visible download UI remain PARTIAL. |
| Windows Edge 153, headless | PASS for this automated production-preview suite | Separate Edge profile and full equivalent harness; same native UI limits. |
| Windows Chromium touch/viewport emulation | PASS within emulation | 390 × 844, 844 × 390, 320 × 700, 1000 × 800 and 1440 × 900: no horizontal overflow; crop hit test available. Phone portrait dock stayed sticky. Landscape at 844 px used the designed wider static layout. |
| WebKit / Safari equivalent | NOT TESTED | No local usable WebKit runner was found. Automated Chromium is not Safari evidence. |
| iPhone 13 / iPad Air 5 Safari | PARTIAL historical owner report | Core workflow and twelve extracted PNGs were reported on earlier builds. That report predates the current print-bleed and GSAP correction; current-build smoke remains open. |
| macOS Chrome / Edge / Safari; Android Chrome | NOT TESTED | No Mac, Android device or remote service is available. |

Safe-area behavior, Safari browser chrome, physical touch target comfort, bottom sheet scrolling and mobile export destination require device review. Existing headless screenshots do not close those items.

## 9. Performance and bundle

- Production JS: **375.14 kB / 123.94 kB gzip**; CSS: **52.46 kB / 10.12 kB gzip**; 76 modules. GSAP versions: gsap 3.15.0 and @gsap/react 2.1.2. No ScrollTrigger, Flip, Draggable or other GSAP plugin was added.
- The pre-GSAP baseline recorded in the focused-upgrade QA was 297.77 kB / 93.68 kB gzip JS. Difference: **+77.37 kB raw / +30.26 kB gzip**.
- Cached local production-preview reloads measured about 29–34 ms DOMContentLoaded/load and about 6–7 MB JS heap. These are a narrow local regression signal, not cold-network or real iPhone performance measurements. Month switching and recommendation actions completed in the browser harness; Safari scroll and perceived motion remain a hands-on check.

## 10. Known issues by severity

| Severity | Item | Status |
|---|---|---|
| BLOCKER | Formal release matrix lacks macOS Chrome/Edge/Safari, current-build iPhone/iPad Safari and Android Chrome; named-printer physical proof is missing. | Open release evidence. No new production-code blocker was found in the two Windows automated runs. |
| HIGH | Auto calendar text contrast acceptance threshold is unresolved; documented borderline combinations remain below a candidate 4.5:1 threshold. | Product Owner decision required; see design/ui-ux-change-request-session-08-contrast.md and qa/integration-results.md. |
| HIGH | Low-resolution print-photo warning remains in the approved acceptance criteria but has no agreed threshold/implemented acceptance. | Open decision and implementation/verification before release; see product/acceptance-criteria.md and qa/integration-results.md. |
| MEDIUM | Physical native picker/HEIC, large originals, storage pressure, VoiceOver, Safari safe areas and scroll have no current-build evidence. | Targeted device QA. |
| LOW | No lint script exists; current build and 56 tests pass. | Optional tooling backlog, not a claim that lint passed. |

No newly reproduced functional failure appeared in the production-preview Chrome/Edge suite. Required formal release evidence and both HIGH items cannot be silently waived. Hosting/deployment target is also an OPEN QUESTION; it was outside this no-deploy QA run.

## 11. Exact Product Owner iPhone smoke test

On the **current build** in iPhone Safari, please make one short pass:

1. Open Entry, select phone photos and verify crop drag plus two-finger pinch.
2. Switch Jan → Feb → Mar → Apr quickly; choose a photo recommendation and mark one Important Date.
3. Reload, Resume and confirm that month, crop, color and marked date remain.
4. Download one image and one 12-month ZIP; open the image and extract/open several months, including a print image edge.
5. Tell us whether Landing/month/palette motion, scrolling and Safari responsiveness feel smooth, and report iOS version plus any problem screenshot.

This is a focused physical-device smoke test, not a request to repeat the automated matrix.

## 12. Deployment readiness

**V1 — Ready for Product Owner Device Smoke Test.** **Not ready to deploy:** formal Session 08 browser/device coverage, named-printer proof, the two HIGH decisions and Product Owner Release Approval remain open. No Release Candidate was nominated, no production deployment occurred and this QA stage stops here.


## Evidence refresh note, 2026-09-25

The isolated pre-release browser harness was rerun after the separately authorized V1.1 Part 1 patch to verify existing behavior. Its default qa/v1-pre-release-9230.json and qa/v1-pre-release-9231.json outputs and screenshots now reflect that later build, while the bundle numbers and dated conclusions above describe the original pre-release run. Copies of the later full-workflow JSON are retained as qa/v1-1-full-workflow-9230.json and qa/v1-1-full-workflow-9231.json. The V1.1 result and scope are in qa/v1-1-part-1.md; original V1 release blockers remain open.
