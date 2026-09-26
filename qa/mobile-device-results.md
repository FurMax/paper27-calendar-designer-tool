# Session 08 — Mobile device results

**Status:** Product Owner reported an iPhone 13 Safari run on 2026-09-23. The report is scoped to the stated results; remaining device checks are open.

## Available hardware and URL

- iPhone 13 and iPad Air 5 are available. The iPhone probe reports iOS 16.2 Safari 16.2. The Product Owner confirms iPad Air 5 core flow in portrait and landscape; iPadOS/Safari version was not supplied.
- Android device is unavailable.
- Current reachable local test address from this Windows host: `http://192.168.31.102:5174/` (HTTP 200 on host). This is **LAN HTTP**, not a trusted HTTPS origin. It supports core workflow and ZIP handoff observation. Historical Web Share tests would require HTTPS, but Web Share is outside V1.
- The Product Owner used the supplied LAN address for the reported iPhone run; the iPad origin was not separately documented. The probe reports secureContext=false, shareAPI=false, and canShareAPI=false at this origin; those values do not establish capability on trusted HTTPS.


## Product Owner iPhone 13 report — 2026-09-23

- The Product Owner reported the iPhone Safari tests passed, a 24.2 MB ZIP was downloaded to iCloud Drive / Downloads, and the ZIP was extracted. All twelve 01–12 files were confirmed to be PNG and each opened. This supports a scoped core-workflow, ZIP download, extraction and twelve-file inspection PASS on this device and LAN HTTP origin. Individual crop, font, sampler, resume and timing observations were not supplied.
- The QA-only picker probe selected one file: 8FD577A9-BCC4-4F31-9832-1E7C274668BC.png, image/png, 5,733,218 bytes. The img fallback decoded it at 2480 × 3505 after createImageBitmap threw TypeError: Type error. This is successful decode of the picker-returned PNG, not evidence of native HEIC/HEIF decode or twelve original source files.
- The probe reported storage=null; storage usage/quota and large-original persistence pressure were not measured. It reported count=1 and totalBytes=5733218, which is not the total for twelve source photos or the ZIP size.
- The Safari user agent reports iPhone OS 16_2, Version/16.2 Mobile Safari. Current-stable Safari coverage remains a separate release-matrix check.
- The Product Owner declined further manual copying of native HEIC and twelve-source-file metadata; do not request the same probe again. Native HEIC and large-original source-set rows remain NOT TESTED. The later explicit reply confirms iPad Air 5 completed the same core flow in portrait and landscape, without a version, ZIP size or download destination.

## Requested production-app runs

The Product Owner was asked to run iPhone 13 Safari through 12-original-photo selection, assignment, crop single-finger drag/pinch/explicit zoom/Reset, three fonts, reload/Resume, one digital PNG and print ZIP download/extraction with all twelve files inspected. iPad Air 5 Safari was asked to repeat the core touch/save/export flow in portrait and landscape. Record each step PASS/FAIL, OS/browser version, source total bytes where available, actual destination and screenshots/files on failure.

## Gate status

| Gate | iPhone 13 | iPad Air 5 | Android Chrome |
|---|---|---|---|
| Native picker order/cancel, HEIC MIME/transcode/decode | **NOT TESTED** | **NOT TESTED** | **NOT TESTED** |
| Crop drag/pinch/zoom/Reset, no blank and scroll conflict | **PARTIAL — overall workflow reported PASS; step detail pending** | **PARTIAL — overall workflow reported PASS in both orientations; step detail pending** | **NOT TESTED** |
| Sampler and known-color pixel through exported PNG | **NOT TESTED** | **NOT TESTED** | **NOT TESTED** |
| Twelve representative original photos, bytes, usage, save/restore/export time, interruption | **PARTIAL — 24.2 MB ZIP reported; one 5.73 MB PNG probed; source set/timings pending** | **PARTIAL — core workflow reported PASS; source set/timings pending** | **NOT TESTED** |
| Font fallback and Preview/export parity | **NOT TESTED** | **NOT TESTED** | **NOT TESTED** |
| Multi-file Web Share | **OUT OF V1 SCOPE — Product Owner decision 2026-09-23** | **OUT OF V1 SCOPE** | **OUT OF V1 SCOPE** |
| One-action direct PNG write into iPhone Photos | **DEFERRED BEYOND V1 — Product Owner decision 2026-09-23** | N/A | N/A |
| Browser ZIP download, extraction and twelve-file inspection | **PASS — 24.2 MB ZIP in iCloud Drive / Downloads; twelve PNGs opened** | **PASS by Product Owner report in portrait and landscape; size/destination not supplied** | **NOT TESTED** |
| Safe area, browser chrome, portrait/landscape | **PARTIAL — overall workflow reported PASS; orientation detail pending** | **PARTIAL — both orientations reported PASS; safe-area/chrome detail pending** | **NOT TESTED** |

The confirmed download, extraction and opening of all twelve files counts as a scoped iPhone browser-ZIP delivery PASS. The Product Owner also confirms the same flow on iPad Air 5 in both orientations; its size and destination remain unreported. The Product Owner approved ZIP as V1 mobile primary delivery and deferred Web Share and one-action direct Photos beyond V1. Other device/browser QA gates remain open.

## QA-only picker metadata helper

`http://192.168.31.102:5174/qa/session08-device-probe.html` reports the picker-returned filename, MIME, bytes, decoded oriented dimensions, user agent and storage estimate. It processes files in the device browser without uploading or saving them. It is not production UI. The Product Owner has declined further manual metadata collection; no repeated probe is requested.


## Post-device-test output changes

The iPhone 13 and iPad Air 5 ZIP observations above were for the earlier PNG-only build. The Product Owner subsequently approved JPG selection and identified photo borders. JPG and the corrected bleed/photo-edge warning passed bounded Windows Chrome/Edge checks, but neither change has been retested on iPhone/iPad Safari. Preserve the original device observations as scoped historical evidence; current-build real-device output remains OPEN.

The later genuine-photo print-bleed change also postdates the Product Owner's iPhone/iPad run. Current-build device output remains unverified.
