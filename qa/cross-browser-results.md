# Session 08 — Cross-browser results

**Status:** In progress. A PASS is limited to the exact browser and mode named below. Release-time stable-version confirmation and the formal native-browser matrix remain open.

| OS / browser | Version, mode and URL | Result | Evidence still needed |
|---|---|---|---|
| Windows Chrome | 153.0.8010.52, headless, `http://127.0.0.1:5173/` | **PARTIAL** | Production integration, twelve-month Preview/PNG and print ZIP passed. Native picker, visible browser download UI, accessibility and real original-photo pressure remain. |
| Windows Edge | 153.0.4234.48, headless, same URL | **PARTIAL** | Same integration and PNG/ZIP assertions passed in a separate Edge profile. Native picker and visible handoff remain. Edge shares Chromium behavior; this does not cover Safari. |
| macOS Chrome | No Mac or remote test service available (Product Owner, Session 08) | **NOT TESTED** | Full desktop workflow and file destination. |
| macOS Edge | No Mac or remote test service available (Product Owner, Session 08) | **NOT TESTED** | Full desktop workflow and file destination. |
| macOS Safari | No Mac or remote test service available (Product Owner, Session 08) | **NOT TESTED** | Full workflow, HEIC/decode, fonts, Canvas, IndexedDB, ZIP. |
| iPhone Safari | iPhone 13, iOS/Safari 16.2 user agent; LAN HTTP | **PARTIAL** | Product Owner reports core workflow passed and 24.2 MB ZIP downloaded to iCloud Drive / Downloads; all twelve extracted PNGs opened. One picker-returned PNG decoded through img fallback. HEIC, step-level touch/font/sampler evidence, current-stable Safari and trusted HTTPS remain open. |
| iPad Safari portrait | iPad Air 5; iPadOS/Safari version and origin not supplied | **PARTIAL** | Product Owner reports the same core workflow and ZIP extraction/twelve-PNG inspection passed. Size/destination, native picker details, font/sampler/large-original evidence and current-stable version remain open. |
| iPad Safari landscape | iPad Air 5; iPadOS/Safari version and origin not supplied | **PARTIAL** | Product Owner reports the same core workflow and ZIP extraction/twelve-PNG inspection passed. Rotation/safe-area details, size/destination and current-stable version remain open. |
| Android Chrome | No Android device or remote test service available (Product Owner, Session 08) | **NOT TESTED** | Required release matrix and full mobile workflow. |

Current Windows OS build observed locally: `10.0.26200`. The installed browser versions above are factual run versions; whether they remain the current stable versions at release time must be checked again. Headless automation injected `File` objects and does not represent the OS picker. No single Chromium result is propagated to another platform.

## Session 08 output correction

Both isolated Windows Chrome and Edge also passed single digital JPG, twelve-file print JPG ZIP, 300 dpi JFIF metadata, narrow format selector, and synthetic photo-edge pixel/warning checks. Chrome passed the full UI preflight edit/continue flow. Existing default PNG integration passed again after the correction. These additions do not fill the macOS, Android or current-stable Safari rows.

The subsequent genuine-photo print-bleed correction also passed isolated Windows Chrome/Edge synthetic pixel regressions and default PNG/JPG full-set ZIP checks. This does not fill real Safari, Android, macOS or named-printer rows.


## V1 pre-release production-preview rerun, 2026-09-24/25

| OS / browser | Version, mode and URL | Result | Evidence still needed |
|---|---|---|---|
| Windows Chrome | 153, headless, isolated profile, http://127.0.0.1:4173/ serving dist/ | **PASS for automated production-preview suite; PARTIAL for formal browser row** | Native picker, visible browser download UI and real photos; see qa/v1-pre-release-9230.json. |
| Windows Edge | 153, headless, separate isolated profile, same production preview | **PASS for automated production-preview suite; PARTIAL for formal browser row** | Same native UI limits; see qa/v1-pre-release-9231.json. |
| WebKit | No runnable local WebKit environment found | **NOT TESTED** | Safari-equivalent automation when available; never substitute it for physical iPhone Safari. |

The rerun exercised real PNG/JPG files and ZIP downloads, twelve 2027 calendar grids, crop/color/type/Important Date, persistence errors, fast GSAP interaction, reduced motion and touch emulation. The prior dev-server rows above remain historical evidence. macOS, Android and current-build iPhone/iPad Safari statuses are unchanged. Full scope and limitations: qa/v1-pre-release-results.md.
