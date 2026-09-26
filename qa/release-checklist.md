# Session 08 — V1 release checklist

**Status:** Session 08 Product Owner acceptance recorded on 2026-09-26 with documented QA exceptions. The production-preview Windows regression is complete. **No Release Candidate. No Production Release.** Production deployment has not been approved.

| Gate | Current result |
|---|---|
| Build and unit suite | **PASS** — current production build and 56/56 unit tests in V1 pre-release QA. No lint script is configured. |
| Windows Chrome/Edge integration and 2027 Preview/digital output | **PARTIAL for formal matrix** — current dist/ production-preview headless Chrome/Edge workflow and actual download assertions pass; native picker and visible handoff pending. |
| Twelve ordered print PNGs/JPGs in desktop ZIP | **PASS in isolated Windows Chrome/Edge automation** for each selected format; real desktop native handoff still pending. |
| Persistence failure/restore and export cancel/fail/retry | **PASS in isolated Chrome regressions**; real-device quota/interruption pending. |
| iPhone/iPad production workflow, HEIC, touch, large originals | **PARTIAL** — Product Owner reports iPhone 13 Safari 16.2 and iPad Air 5 portrait/landscape core workflows, ZIP extraction and twelve opened PNGs. iPhone ZIP was 24.2 MB in iCloud Drive / Downloads; iPadOS version, iPad size/destination, native HEIC, step-level touch/sampler/font checks, source-photo pressure and current-stable Safari remain open. |
| Android Chrome workflow | **BLOCKER / NOT TESTED** — Product Owner confirms no Android device or remote test service is available. |
| macOS Chrome/Edge/Safari | **BLOCKER / NOT TESTED** — Product Owner confirms no Mac or remote test service is available. |
| Multi-file Web Share | **OUT OF V1 SCOPE** — Product Owner approved ZIP as V1 mobile primary handoff. Historical QA-only Share experiment is not a product feature or release gate. |
| One-action direct iPhone Photos outcome | **DEFERRED BEYOND V1** by explicit Product Owner decision; Files/Downloads ZIP is described truthfully. |
| Auto contrast acceptance and low-resolution warning | **HIGH open decisions** — see `integration-results.md` and pending change request. |
| Accessibility | **PARTIAL** — dialog keyboard focus fixed and regression passes; screen readers, physical touch targets, zoomed text and Safari safe areas pending. |
| Photo-edge quality | **PARTIAL** — Chrome/Edge synthetic digital/print PNG/JPG genuine-source bleed regression and Chrome print-proof/pre-export warning flow pass. The supplied real JPGs show historical borders; original photos/crops are unavailable for exact regeneration. Updated iPhone/iPad output remains untested. |
| Printer preflight | **BLOCKER / PARTIAL** — stated postcard trim/3 mm bleed, RGB allowance and 300 dpi match the validated sample PNG geometry/metadata. JPG and PNG are now both selectable; Chrome/Edge print JPG passed 1252×1843 and JFIF 300 dpi checks. No named-provider submission or physical proof. |
| Deployment target | **OPEN QUESTION** — no hosting provider/domain/production configuration found. Deployment cannot start before Release V1 approval and target decision. |

## Release decision

**Do not nominate V1 Release Candidate yet.** Required device/browser, source-photo, print-provider and accessibility evidence remains incomplete. The Product Owner resolved mobile handoff for V1 as ZIP and deferred Web Share/direct Photos. Preserve every NOT TESTED status until actual evidence exists. Resolve HIGH issues individually; no HIGH issue is implicitly accepted. Once all required rows have evidence and BLOCKERs are cleared, prepare the Release Candidate Report and stop for Product Owner Release Approval. Production deployment and smoke testing follow only after that approval.


## V1 Enhancement / Polish Patch hold

The Product Owner-directed patch passes bounded Windows Chrome/Edge browser and 54-unit checks recorded in `v1-enhancement-patch.md`. Important Date is a controlled small V1 scope addition, not a release authorization. **Product Owner visual/interaction review is pending.** Earlier physical-device, formal browser-matrix, printer and HIGH-issue blockers above remain open. Do not deploy automatically.


## 2026-09-24/25 production-preview update

The current dist/ build passed the isolated pre-release Chrome/Edge harness, 56/56 unit tests, twelve-month Preview and actual print/digital PNG/JPG ZIP checks, save/export failure and two-tab recovery, GSAP rapid switching, reduced motion and responsive touch emulation. Detailed evidence is in qa/v1-pre-release-results.md and the two JSON summaries. This advances the build to **Ready for Product Owner Device Smoke Test** only. The formal device/browser, printer, Auto contrast and low-resolution-warning rows above retain their release-blocking status.

## Session 08 Product Owner acceptance — 2026-09-26

The Product Owner explicitly accepted the current Calendar Design Studio project for Session 08 on 2026-09-26. This is acceptance of the current product/workflow after the owner reported the other iPhone functions normal. The photo-top pale band traced to a white source-image edge was deferred by the owner; the focused edge-warning correction passed Chrome/Edge regression, but the affected file has not been re-exported and checked on iPhone. This remains a known exception, not a PASS.

Formal evidence rows retain their actual status: macOS Safari/Chrome/Edge and Android Chrome NOT TESTED; named-printer proof and current-stable Safari PARTIAL/NOT TESTED as recorded; Auto contrast and low-resolution-warning decisions OPEN. Product Owner acceptance does not convert these to PASS, nominate a Release Candidate, authorize production deployment, or begin the next gate. Deployment requires a separate explicit decision.
