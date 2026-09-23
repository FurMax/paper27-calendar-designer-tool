# Session 06 — Production Architecture

**Status:** Approved with the Session 06 Technical Gate on 2026-09-23. Session 07 implementation and the Product Owner-approved print/color/type amendments are recorded below; formal release QA remains in Session 08.

## 1. System boundary and evidence

V1 is one responsive, client-only, local-first website for one 2027 project. There is no account, API server, cloud sync, database server, service worker requirement, or native application. Product UI is Simplified Chinese; the calendar proof and output use English month/weekday labels and Arabic numerals. The approved S01–S04/T01–T05 structure and Direction A visual system govern the UI; `prototype/` and `spikes/` are references, not production source.

Choose **React + TypeScript + Vite** for the production app. At Session 06 approval, the repository contained no production package or source files (`src/` is empty), so this is a Session 06 stack decision, not an inheritance from the prototype. React handles the four screens and transient surfaces; TypeScript makes project and renderer contracts explicit; Vite supplies a small browser build. Use React context plus a focused reducer for the one active project, local component state for open sheets/menus, and plain functions for domain rules. Add no state library, router package, domain framework, or repository abstraction unless implementation demonstrates a specific need. Use the browser History API for S01–S04 and the selected month; no server routing is required. URL navigation must never create/delete a project or become the source of saved content.

The frozen UI is implemented as views over domain state. A single command boundary validates edits and creates the next immutable project snapshot. Persistence serializes that snapshot and assets; export reads a snapshot. React component state must not be persisted as the project model. `lastLocation` is limited stable resume context; open sheets, pickers, pointer positions, save progress, and export progress are transient.

## 2. Modules and contracts

| Module | Responsibility | Boundary |
|---|---|---|
| App shell/navigation | S01–S04, T01–T05, History/back, responsive placement, stable resume context | Reads project selectors; does not implement assignment or rendering rules |
| Calendar date engine | Twelve 2027 months, Sunday-first 42 cells, English labels | Pure deterministic functions; no locale-dependent browser formatting |
| Project state/assignment | One project, 12 slots, project photo items, Move/Swap/Replace/Remove/Reuse/Delete, Ready/Missing selectors | Pure commands enforce approved reset/preservation semantics |
| Photo import | Picker result validation, whole over-limit rejection, decode-before-commit, oriented dimensions, low-resolution warning | Returns validated candidate assets/items; never mutates a month on failure |
| Crop math/gesture adapter | Cover, drag, pinch, explicit zoom, Reset; normalized crop parameters | Pure math shared by preview and export; pointer events only in UI adapter |
| Calendar render model | Fixed 1200×1800 trim composition, date grid, resolved crop, colors, typography metrics; selected export variant | One source of visual constants; preview and Canvas consume it |
| Preview | Browser proof and review thumbnails at responsive scale | Uses render model; has no independent layout math/date logic |
| Canvas export renderer | Draw one full-bleed photo plus separate calendar region and English text to exact-size PNG | Reads immutable model/decoded photo; does not use DOM/SVG screenshot export |
| Persistence | IndexedDB assets + project, revision-checked transactions, restore, save status | One small module; no generic repository layer or LocalStorage originals |
| Delivery | Single PNG handoff, sequential 12-PNG production, ZIP package, platform-capability handoff | Does not modify saved project; mobile selection remains gated by real-device evidence |

The approved Direction A proof uses a **58% / 42%** photo/calendar split. Formalize that at 1200×1800 as a full-width `1200×1044` Photo Region above a `1200×756` Calendar Region. The matching Session 05 value was a spike proxy, not by itself production approval; this decision derives from the frozen proof and must pass implementation-fidelity review. Text coordinates belong in the same versioned geometry definition, derived from that proof and verified in M4/M6. Future P2 templates can replace this one geometry definition without introducing a V1 template selector.

## 3. Decisions and rationale

### ADR-01 — Dedicated Canvas export renderer

**Decision:** Browser preview remains interactive DOM/CSS, while a dedicated Canvas 2D renderer produces PNGs. Both consume the same render model, crop math, date data, typography definitions, and color resolution. The baseline composition is 1200×1800. The approved digital output keeps that size; the default print variant maps it into a 1181×1772 trim area within a 1252×1843 bleed canvas at 300 PPI. Load and verify the selected bundled font faces before drawing; a failed face produces an explicit fallback/error path and never silently claims preset fidelity.

**Evidence:** Session 05 produced real 1200×1800 desktop PNGs with dedicated Canvas. The tested SVG-image path lost the selected Serif font. This does not prove Safari font or preview/export fidelity. [Validation](technical-validation.md) remains the measured scope.

### ADR-02 — IndexedDB for the one local project

**Decision:** Store project metadata/items and original photo Blobs in IndexedDB. Use one readwrite transaction spanning the project and asset stores for a logical save, including a revision compare and any asset additions/deletions. Report Saved only after transaction completion. Do not store originals in LocalStorage. A `BroadcastChannel` message is an early conflict hint; the transaction revision check is authoritative.

**Evidence:** Twelve desktop proxy JPEGs restored; one iPhone restore was reported; a desktop stale-tab write was rejected. Twelve large real phone originals, real quota failure, eviction, and Safari conflict behavior are deferred QA. See [validation](technical-validation.md) and [persistence details](data-model.md).

### ADR-03 — Shared render model and normalized crop

**Decision:** Keep fixed geometry, six-row date positions, resolved style/typography metrics, and photo crop in pure TypeScript modules. Preview and export receive the same computed month model. Store zoom and normalized offsets rather than CSS transforms or device pixels. This avoids copying template constants into responsive components and supports independent preview scaling.

**Evidence:** January 2027 and one desktop preview/export comparison passed in Session 05; full 12-month and Safari comparisons remain required.

## 4. Runtime flow and failure ownership

1. **Start/resume:** Read the single IndexedDB project and referenced assets, validate schema/invariants, then show S01 returning state or new-project state. Restore stable `lastLocation` when valid; otherwise open S04. A corrupt/unreadable saved project is reported with retry and never replaced automatically.
2. **Import:** Accept the returned `FileList` order, reject an over-limit selection as a whole, decode candidates and record decoded orientation/dimensions. JPEG/PNG/WebP passed named desktop fixtures. HEIC/HEIF is a decode attempt only: if the browser returns readable data, continue; otherwise show unsupported/unreadable feedback and preserve the old assignment and edits. No native HEIC promise or conversion dependency is made. Unreadable bulk items are identified; readable items may proceed as the approved flow permits. The individual picker remains a complete fallback.
3. **Edit:** Domain commands reset crop on every changed month-photo pairing and retain month style. The editor's crop gesture adapter sends normalized changes to the same command boundary. Ready is derived solely from a valid readable assignment.
4. **Save:** Queue/debounce ordinary changes but serialize writes. Keep the newest in-memory state visibly unsaved until the transaction completes. Quota/clone/blocked errors leave the previous committed revision intact and trigger persistent T04 feedback with retry. A revision mismatch blocks subsequent edits/writes in that tab and asks for refresh. Do not discard in-memory work merely because a save failed.
5. **Export:** Capture an immutable current snapshot, check month readiness, resolve all assets/fonts, render and deliver. Export never mutates the project. Cancellation/failure releases temporary Canvas/Blob/object URLs and allows retry. If current edits are unsaved, T04 must remain truthful; export may use the visible snapshot without claiming it was saved.

## 5. Browser boundary and open decisions

Desktop Chrome/Edge spike results justify the proposed architecture, not release acceptance. Formal QA still covers current stable desktop Chrome/Edge on Windows/macOS, Safari on macOS and iPhone/iPad, and Chrome on Android. UI uses pointer events with touch gesture handling, explicit zoom, safe-area-aware controls, and no crop-swipe month navigation. Do not require a Worker or OffscreenCanvas; sequential main-thread rendering with an event-loop yield and cancellation between months is the initial implementation. Escalate only if measured mobile responsiveness/memory requires it.

**OPEN QUESTION — iPhone Photos outcome:** The Product Owner requested one action that puts a PNG directly into Photos without a second Save action. A Safari file download to iCloud Drive and Open→manual Save do not meet it. Browser Web Share can hand files to a user-selected target; it is not evidence of direct Photos writing. The approved browser-only V1 constraint remains in force. No delivery adapter may be labeled as satisfying this requirement until the Product Owner resolves the conflict using real-device evidence. [Product scope](../product/scope.md) and [Session 05 record](technical-validation.md) remain authoritative.

**OPEN QUESTION — mobile full-set handoff:** HTTPS iPhone/iPad `canShare({files})`, actual 12-file destination, ZIP fallback, interruptions and memory must be tested before choosing the primary mobile handoff and final copy. All paths retain the product meaning of 12 independent PNGs and never auto-start 12 browser downloads.

**OPEN QUESTION — final font and contrast details:** Final font files/names, licenses, WOFF2 size, Safari Canvas fidelity, exact low-resolution warning threshold, and Auto/Custom contrast threshold are not resolved by desktop spikes. Any change to the frozen visual system or interaction semantics follows the UI/UX change-request rule.

Official API references used for the boundary: [Vite React/TypeScript template](https://vite.dev/guide/), [IndexedDB transactions and Blobs](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API), [Canvas font loading](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font), [Web Share limits](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API).

## Session 07 approved amendments

The Product Owner approved a 100×150 mm trim with approximately 3 mm bleed on each side: a 106×156 mm full file represented as 1252×1843 pixels at 300 PPI after integer rounding. The export-variant domain module owns both variant dimensions. The Canvas renderer preserves the shared 1200×1800 composition, scales it into the print trim, extends photo/background artwork through bleed, and keeps all calendar text inside trim. The PNG metadata module records physical resolution in the print PNG. The optional digital output stays 1200×1800. Selection is transient UI state, not a saved project field. Both single and twelve-page export default to print; ZIP remains packaging for twelve independent PNGs. Printer-specific color profile, safe area and provider preflight remain open.

The Product Owner also approved 80%/100%/120% typography scales and an explicit photo color sampler. The sampler maps a touch/click point on the current cropped photo to the decoded source pixel, presents its HEX/swatch, and commits the per-month solid background only on confirmation. It does not change the persisted color model or the desktop native picker. Real iPhone Safari sampling and print-provider handoff remain Session 08 QA; Chrome touch emulation is scoped implementation evidence.