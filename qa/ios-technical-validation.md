# Session 05 — iPhone / iPad Safari real-device worksheet

**Later Session 08 resolution:** This worksheet preserves Session 05 observations. The Product Owner later approved ZIP as V1 mobile primary delivery, reported iPhone 13 and iPad Air 5 full-set ZIP extraction and twelve-PNG inspection, and deferred multi-file Share and one-action direct Photos beyond V1. See mobile-device-results.md and design/ui-ux-change-request-session-08-mobile-handoff.md. Historical HTTPS and Photos gate labels below are not current V1 release gates.


**Session 05 status: Complete with deferred device validation. Technical Validation Gate: Passed for Technical Design by explicit Product Owner decision on 2026-09-23.** This worksheet remains open for later QA: **REAL HTTPS DEVICE TEST REQUIRED** for full-set Share/Save; iPad and detailed iPhone re-test pending. The one-action direct Save to Photos request remains unvalidated. These items do **not** block Session 06, but gate approval does not convert them to PASS or establish release acceptance. The Product Owner reported one real iPhone Safari run on 2026-09-23; outcomes below are scoped to that report, and model, OS version, file sizes and exact logs were not supplied. This isolated spike is not Production Architecture.

### Product Owner screenshot observation — 2026-09-23

A phone Safari screenshot of the original 4175 spike page shows a selected portrait image in the January preview with background-colored strips on both sides of the upper photo. This is expected from that version's explicit `PHOTO={x:200,y:0,w:800,h:1200}` inside its 1200×1800 output; the image itself fills that centered 2:3 viewport. The frozen Direction A product proof instead has a full-width upper photo area (58% of proof height). **This screenshot alone does not establish a crop failure or validate exported PNG fidelity.** Device model, iOS/Safari version and actual exported file were not supplied. The differing original spike geometry must not be carried into Technical Design as the approved product layout.

The Product Owner subsequently clarified the formal output standard: **whole output 1200×1800 and 2:3; upper photo spans all 1200 px with cover and no gutters; lower calendar region is separate.** The disposable page was updated to reflect this for follow-up testing. The screenshot describes the earlier page only.

### Product Owner reported iPhone Safari outcomes — original spike

| Capability | Reported actual result | Scoped status | Missing evidence / next run |
|---|---|---|---|
| Native picker | Could select 12 photos in one action | **PASS** for this picker action | Returned order, routes, cancel, metadata, HEIC, model/iOS version |
| Local persistence / restore | Save and restore worked | **PASS** for this run | Twelve source sizes, usage/quota, exact reload path, eviction/failure |
| Auto contrast | Visible Auto text switch worked | **PASS** for reported visible behavior | Four text roles, color ratios, exported PNG pixels |
| Zoom | Explicit Zoom control worked | **PASS** for this control | Pinch and Reset still pending |
| ZIP generation | Batch completed | **PASS** for reported completion | Duration, ZIP size/integrity, destination, interruption/retry |
| Current-month PNG file download | Both download buttons were tried. The Product Owner later found a downloaded PNG in iCloud Drive → Downloads | **PASS** for at least one actual file download; **PARTIAL** for which entrance worked | Exact button, filename, dimensions, device/iOS version and `handoffLog` not supplied; Photos import is a separate result |
| Open generated PNG | The generated PNG opens. A separate save action can put it in Photos, but the Product Owner requires direct Photos save with no second step | **PASS** for Open; **FAIL** against the requested one-action Photos outcome | Actual saved file/dimensions not supplied; HTTPS Share Sheet remains an alternative-path test, not proof of one-action direct Photos save |
| Drag reposition | Desktop manual attempt and iPhone touch drag appeared not to move image | **FAIL / PARTIAL in original spike** | Start zoom, drag target, image aspect, offsets; re-test updated crop and preview at 1.5× |
| Font switching | Sans/Serif/Handwritten looked unchanged in iPhone preview | **FAIL / PARTIAL in original spike** | Updated `fontLog`, sample, export comparison, actual fallback |
| Mobile 12-image delivery | ZIP generation succeeded; ideal handoff not established | **OPEN TECHNICAL QUESTION** | Trusted-HTTPS multi-file Share/Save test; fallback behavior |

The updated spike adds full-width cover crop, draggable blue box **and** upper Calendar preview, clamped offsets, font diagnostics, a 12-photo selection count, explicit current preview month, and a separate full-set action. Reload 4175 to obtain this version before the next run.

In a later informal follow-up, the Product Owner said other problems seemed resolved. This is encouraging but does not identify exact crop/font actions or provide logs; their graded rows remain pending until the updated-page results are recorded.

## Start the temporary test page

1. Put the Windows computer and device on the same trusted Wi-Fi. From `D:\calendar-studio\spikes\browser-lab` on the computer, run `python -m http.server 4175 --bind 0.0.0.0` and keep that terminal open during the test. This is a temporary local test server; no site is deployed.
2. On iPhone/iPad **Safari**, open **Test URL: `http://192.168.31.102:4175/`**. This was the computer's LAN IP on 2026-09-23; if it changes, replace only the IP using the current `ipconfig` IPv4 address. If the page cannot load, record that result; do not change firewall or browser security settings solely for this test.
   The URL returned HTTP 200 from this Windows host using both `127.0.0.1` and `192.168.31.102` on 2026-09-23. The Product Owner subsequently reached the LAN page on iPhone Safari; iPad reachability is still unverified.
3. Use test photos you are comfortable selecting. The page performs processing in the device browser and contains no upload request. Avoid deleting the original photos. The `保存当前选择的照片和设置` button writes copies to this test origin's IndexedDB; use it only for the storage rows below.
4. Record a second run on **iPad Safari** in both portrait and landscape. Android Chrome can use the same LAN URL and worksheet with its own device details.

**Secure-context limit:** the LAN URL uses HTTP. It can test picker, decode, crop, PNG/ZIP generation and ordinary download/open. [Web Share requires HTTPS or another secure context](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share); `navigator.share` may be absent at this URL. That result means **NOT TESTED IN REQUIRED SECURE CONTEXT**, not that iOS Safari lacks file sharing. A trusted HTTPS test URL is an **OPEN QUESTION** for a later authorized device run. Do not bypass a certificate warning.

## Device record — one copy per device

| Field | Actual value |
|---|---|
| Device model |  |
| iOS/iPadOS version |  |
| Safari version or full User Agent shown on page |  |
| Test date/time and timezone |  |
| Free device storage (approximate) |  |
| Test URL actually opened |  |
| Wi-Fi / network notes |  |
| 12 test photos: formats and approximate total size |  |
| `secureContext`, `shareAPI`, `canShareAPI` values from Environment box |  |

Use **PASS / FAIL / PARTIAL / NOT TESTED** in every outcome cell. A screenshot, exact error string, actual filename and destination are more useful than “works.”

## Picker and decode (Spike 01–02)

| ID | Exact steps | Expected behavior | Actual result | Status |
|---|---|---|---|---|
| P1 | Tap the file input; choose **Photos**. Select exactly 12 known photos in a deliberate non-date order, then finish. | Picker permits 12; log shows count 12 and the exact returned order. |  |  |
| P2 | Repeat P1 with the **Files** route, if offered, using 2–3 JPG/PNG files. | Files route can return readable files; route availability is recorded. |  |  |
| P3 | Note the actual tap order before selecting; compare it with `returnedOrder` in the log. | Returned order is reported faithfully; no assumption that it equals tap order. |  |  |
| P4 | Tap `清空 picker`, reopen picker, then Cancel/Done without selecting anything. | Existing selected photo/crop remains; log behavior and whether `change` fires are recorded. |  |  |
| P5 | Choose one normal iPhone HEIC/HEIF photo, if available. Read name, MIME, bytes and bitmap/img results. | Decode succeeds or gives a clear error; note whether Safari supplied HEIC or converted JPEG. |  |  |
| P6 | Choose portrait, landscape and large original photos (for example a recent high-resolution phone photo). Inspect decoded width/height and orientation. | Browser shows visually upright image and sensible dimensions without crashing. |  |  |
| P7 | Try one corrupt/unreadable test image from Files, if safely available. | Decode error appears and current valid photo is not replaced. |  |  |
| P8 | If the picker allows >12, select 13 and note behavior. | Spike log reports all returned files; future product must reject over-limit as a whole. |  |  |

Record P1's **tap order** and **returned order** explicitly here:

- Tap order: 
- `returnedOrder`: 
- Photos versus Files behavior: 
- HEIC selected file `name` / `type` / `size` / decoded dimensions: 

## Crop, calendar, fonts and contrast (Spike 03–06, 11)

| ID | Exact steps | Expected behavior | Actual result | Status |
|---|---|---|---|---|
| C1 | With a portrait photo, set Zoom to 1.5, then single-finger drag in the blue crop box **and** the photo portion of Calendar preview; repeat with landscape and square. Record offset before/after and `movableOutputPx`. | Offset visibly changes where overflow exists; no blank region appears and `covered=true`. At Zoom 1, a direction with zero overflow legitimately cannot move. |  |  |
| C2 | Pinch inward/outward with two fingers inside crop; then use Zoom slider and tap `居中重置`. | Zoom changes within 1–3, no blank region; reset returns zoom 1 and centered offsets. Page does not switch month. |  |  |
| C3 | Rotate iPhone to landscape and iPad through portrait/landscape while crop is edited. | Crop and controls remain usable; note if gesture/page scrolling conflicts. |  |  |
| C4 | Inspect January proof. | `January`, `2027`, `S M T W T F S`, Jan 1 under Friday, 31 dates, six rows. |  |  |
| C5 | Select Sans, Serif and Handwritten one by one. Capture `fontLog` for each: selected, `faces.status`, `documentFontsStatus/check`, `cssFontFamily`, `canvasFont`, `canvasJanuaryWidth`, `previewTextHash`, `fallback`. Compare large `January 2027` sample, preview and an opened PNG. | All three candidate WebFonts actually load and produce distinct preview/export lettering; record any fallback or identical metrics. |  |  |
| C6 | Try white, `#777777`-like mid-tone, very dark and bright saturated background colors. Switch Auto/Custom. | Title, year, weekdays and dates use one ink color; Custom stays selected and warns at low contrast. |  |  |
| C7 | Generate one PNG after a visible crop and Serif selection. Open the image and compare crop, month/year, weekdays, dates and background to browser preview. | 1200×1800 PNG matches intended composition and uses Serif. Note any Safari text or clipping drift. |  |  |

Photo shape/dimensions, crop `zoom`/offset, font, background, Custom/Auto, and observed blank area:

- 

## PNG/ZIP handoff (Spike 06–08)

| ID | Exact steps | Expected behavior | Actual result, including destination | Status |
|---|---|---|---|---|
| E1 | Refresh 4175 and confirm the heading says `2026-09-23 PNG 交接复测`. Tap `生成并尝试下载当前月 PNG` once. Confirm Safari's prompt. Record `exportLog` bytes/MIME and `handoffLog.userActivationAtClick`; inspect Safari Downloads and Files for `01-January-2027.png`. | Blob is generated; an actual saved/openable PNG must be observed to pass handoff. A prompt alone is insufficient. | Product Owner tried this entrance and later found a PNG in iCloud Drive → Downloads, but cannot yet attribute the file specifically to E1 versus E1b. | **PARTIAL attribution** |
| E1b | Without regenerating, tap visible `再次下载已生成 PNG（直接链接）` once; inspect Safari Downloads and Files again. | The direct tap uses the prepared Blob URL in a fresh user gesture; record whether a file actually appears. | Product Owner also tried this entrance; a PNG was later found, but which entrance produced it is unknown. | **PARTIAL attribution** |
| E2 | Without regenerating, tap `打开已生成 PNG`. Record whether a new tab/viewer opens, then try Safari Share and Save to Files/Photos only if those actions actually appear. | PNG opens; available handoff actions and actual destination are described exactly. Do not assume Save to Photos exists. | Product Owner: PNG opens; a subsequent manual save to Photos is possible but violates the requested no-second-step behavior. Exact file/dimensions not supplied. | **PASS Open / FAIL requested direct-Photos flow** |
| E3 | After E1, tap `分享 PNG`. | On LAN HTTP, `shareAPI` may be unavailable. Record exact message; mark secure-context share as still pending. |  |  |
| E4 | Tap `生成整套 12 张 PNG 并尝试下载 ZIP`. Do not background Safari for first run. If the automatic request fails, tap `再次下载已生成 ZIP（直接链接）` without regenerating. | Progress reaches 12/12 separate PNGs, then packages ZIP with `01`–`12` files; record time, size, integrity and actual destination separately from the page's completion log. |  |  |
| E5 | Repeat ZIP while switching away from Safari or locking device once; return. | Record actual interruption, success/failure, and whether retry works without losing selected photo. |  |  |
| E6 | Tap `下次模拟失败`, then start ZIP; tap ZIP again to retry. Also try `取消` during a run. | Failure/cancel stops cleanly; retry can complete; no saved photo is deleted. |  |  |

For Web Share in a **trusted HTTPS** device test later: **Test URL: OPEN QUESTION / not provisioned in Session 05**. Generate PNG first, then tap Share as a separate user gesture; separately generate the full set and tap `实验：分享 12 张 PNG`. Record `navigator.canShare({files})` for one and 12 files, Share Sheet options, actual Save to Files/Photos destinations, whether all 12 images arrive, time, memory/interruption and fallback behavior. **Do not mark PASS at the LAN HTTP URL.** A Share Sheet with a further Save action does **not** meet the Product Owner's one-action direct-Photos requirement; grade that requirement separately.

## Local persistence and two tabs (Spike 09–10)

| ID | Exact steps | Expected behavior | Actual result | Status |
|---|---|---|---|---|
| S1 | Select 12 distinct real phone photos. Record their total bytes from picker log. Tap `保存当前选择的照片和设置`; record `usage` and `quota`. | Save returns revision and file count 12, without a false success message on failure. |  |  |
| S2 | Close/reopen Safari tab or reload the same URL; tap `读取保存状态`. | Twelve files, assignments, crop, colors and typography reappear as stored metadata. |  |  |
| S3 | Open the same test URL in tabs A and B. Tap Restore in both. Save a revision in B, then tap `写入一次修订` in A. | A reports newer/stale conflict and does not overwrite B. |  |  |
| S4 | Repeat S1 with large originals or when storage is constrained, if practical. | On failure the previous valid revision remains available after reload. Do not deliberately fill the device to exhaustion. |  |  |

## Outcome summary for Product Owner return

- Device/browser: 
- P1–P8 results and click versus returned order: 
- HEIC actual MIME/decode: 
- Crop/pinch/rotation: 
- Font and PNG visual fidelity: 
- PNG download/Open/Save destination: 
- Share on secure HTTPS: **NOT TESTED unless a trusted HTTPS URL was used**
- ZIP duration/size/interruption/retry: 
- IndexedDB 12-photo total bytes, usage/quota and reload: 
- Multi-tab conflict: 
- Screenshots or files that show failures: 
- Session 05 gate outcome: **Passed for Technical Design with deferred device validation** by Product Owner decision on 2026-09-23. Later iOS QA remains open; at least one PNG file download to iCloud Drive passed, while the requested one-action Photos result and other untested items must not be marked PASS.
