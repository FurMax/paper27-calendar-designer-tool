# Session 05 — Remaining native-browser worksheet

All entries below are **NOT TESTED** until a person operates that browser's actual system picker and records the result. Automation's `setInputFiles` in `docs/technical-validation.md` did not exercise native picker behavior. Use the same isolated page documented in [browser-lab README](../spikes/browser-lab/README.md). For a device on the same Wi-Fi, the temporary LAN test URL was `http://192.168.31.102:4175/` on 2026-09-23; replace the IP if it changes. No deployment was made.

## Environment record

| Field | Actual value |
|---|---|
| Device / OS and version |  |
| Browser and version |  |
| Test URL |  |
| Test date |  |
| 12 source files: formats and total bytes |  |

## Desktop Chrome, desktop Edge, macOS Safari — run separately

| ID | Exact steps | Expected | Actual | PASS / FAIL / PARTIAL |
|---|---|---|---|---|
| D1 | Click input; choose 12 images in a deliberately scrambled click order. Record click order and `returnedOrder`. | 12 returned, usable metadata; initial assignment must follow returned order, not assumed click order. |  |  |
| D2 | Reopen picker and Cancel. | Existing preview/state unchanged; record whether a `change` event/log update occurs. |  |  |
| D3 | Try select 13 if OS dialog permits. | Exact returned count recorded; product later must reject >12 whole selection. |  |  |
| D4 | Select JPEG/PNG/WebP and a real HEIC if one is available; inspect both decoder fields. | Exact success/error for each format, file name/MIME/size/dimensions. |  |  |
| D5 | Drag crop and operate zoom slider; reset. | No blank region; `covered=true`; reset centered. |  |  |
| D6 | Export one PNG with Serif; compare proof and downloaded file. | 1200×1800, correct custom font/background/dates/crop. |  |  |
| D7 | Batch ZIP, cancel/fail/retry. | 12 ordered valid entries; project input retained. |  |  |
| D8 | Save 12 real phone-photo originals in IndexedDB, reload/restore; use A/B tabs for stale-write test. | Full restoration and stale write rejection, with bytes and quota recorded. |  |  |

For macOS Safari specifically, record `document.fonts` status, PNG output, HEIC result, `navigator.storage.estimate()` behavior and any browser file-save prompt. It is a distinct required engine and cannot inherit Chrome/Edge PASS.

## Android Chrome real phone — run separately

| ID | Exact steps | Expected | Actual | PASS / FAIL / PARTIAL |
|---|---|---|---|---|
| A1 | Open LAN URL in current stable Android Chrome. Tap input and enter system Photos picker, select exactly 12 in a known order. Repeat via Files if available; Cancel once. | Native multi-select and returned order observed; cancel leaves state unchanged. |  |  |
| A2 | Select Android camera JPEG, PNG/WebP from Files, and HEIC if device produces one. Inspect log. | Exact MIME, size, oriented dimensions and decoder success/error. |  |  |
| A3 | Drag and pinch portrait, landscape and square photos; use zoom slider/reset; rotate phone. | No blank region, no accidental page navigation, controls usable. |  |  |
| A4 | Export/download/open one 1200×1800 PNG; inspect crop, font, contrast and final destination. | One usable PNG, no silent failure. |  |  |
| A5 | Generate ZIP; record duration/size, one interruption, cancel/failure/retry. | One usable 12-entry ZIP or exact failure/recovery report. |  |  |
| A6 | Store 12 real phone photos; reload/restore; test two tabs. | Saved data restored and stale write blocked; record storage usage/quota. |  |  |

**Android conclusion:** REAL DEVICE TEST REQUIRED until actual results are returned. HTTP LAN is not a secure context for Web Share; use a trusted HTTPS test URL in a separately authorized run for that API.
