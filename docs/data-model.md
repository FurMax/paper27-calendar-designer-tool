# Session 06 — Data Model and Local Persistence

**Status:** Approved with the Session 06 Technical Gate on 2026-09-23. Types below are contracts for later implementation, not production code.

## 1. Persisted project shape

```ts
type MonthNumber = 1|2|3|4|5|6|7|8|9|10|11|12;
type TypographyPresetId = 'classic'|'minimal'|'handwritten'; // UI concepts; final fonts pending
type TextScale = 'small'|'standard'|'large';
type HexColor = `#${string}`; // validate/canonicalize to #RRGGBB at command boundary

interface CalendarProject {
  schemaVersion: 1;
  id: string;                 // one active project, identity for conflict and replacement
  revision: number;           // monotonic committed revision; starts at 0
  updatedAt: string;          // ISO timestamp of last completed save
  year: 2027;
  typography: { presetId: TypographyPresetId; scale: TextScale };
  months: Record<MonthNumber, MonthState>; // exactly 12 keys
  photoItems: Record<string, ProjectPhotoItem>;
  lastLocation: { screen: 'assign'|'editor'|'review'; month?: MonthNumber };
}

interface MonthState {
  month: MonthNumber;
  photoItemId: string | null;
  crop: CropState | null;     // null iff no assigned item
  style: CalendarStyle;
}

interface ProjectPhotoItem {
  id: string;                 // independently assignable project item
  assetId: string;            // may be shared by multiple items
  createdAt: string;
}

interface PhotoAsset {
  id: string;
  blob: Blob;                 // in the IndexedDB asset store, not embedded in project JSON
  mime: string;               // observed/validated decoded format metadata
  fileName: string;
  byteSize: number;
  decodedWidth: number;       // oriented dimensions from successful decode
  decodedHeight: number;
  importedAt: string;
}

interface CropState {
  zoom: number;               // 1 = centered cover; bounded control range, proposed 1..3
  offsetX: number;            // normalized travel, -1..1; 0 centered
  offsetY: number;            // normalized travel, -1..1; 0 centered
}

interface CalendarStyle {
  background: HexColor;       // default #FFFFFF, month-owned
  text: { mode: 'auto' } | { mode: 'custom'; color: HexColor };
}
```

`TypographyPreset` is a **bundled read-only definition**, not a per-project editable object: `id`, font-face assets/weights for month/year/weekday/date roles, and bounded role metrics for each scale. Project state stores only the preset ID and scale. Final font names/files remain an **OPEN QUESTION** pending licensing, Safari and PNG validation. Fixed output geometry and date rules also live in versioned code constants, not repeated twelve times in saved data.

`ExportState` is **transient**: `{kind: 'single'|'full-set', phase: 'preparing'|'packaging'|'handoff'|'success'|'error'|'cancelled', month?, completedMonths, error?}`. It is not serialized. Save status, conflict flag, selected action, sheets, object URLs, decoded bitmaps, drag pointer positions, and open picker likewise remain runtime state.

## 2. Core invariants and selectors

- Months are exactly January–December. `year` is 2027; Sunday-first/42 date cells are fixed code rules. Unknown schema versions or invalid references are not silently repaired by deleting user work.
- Each month has at most one `photoItemId`. A `ProjectPhotoItem` belongs to at most one month. The **Unassigned Photos** list is derived from photo items referenced by no month; it is not a second asset library or duplicated persisted collection.
- Each item points to one existing asset. Several items may point to the same asset. `Use in Another Month` creates a new item ID with the same `assetId`, so deleting one unassigned item cannot erase another assignment. The original asset Blob is removed only when no item references it after a committed operation.
- A month's crop is `null` when missing and `{zoom:1,offsetX:0,offsetY:0}` when a new readable item is assigned. A changed pairing always gets the default, even when the incoming source Blob was previously used in that month or elsewhere.
- `Ready` / `Missing Photo` and project ready count are **derived**, never stored completion tiers. Ready requires a valid assigned item and decodable asset; default crop and white background suffice. A restore/decode failure is an error, not a fictitious Ready state.
- Background and text mode/value belong to `MonthState.style`; they survive Move, Swap, Remove, Replace, and reuse. Typography and scale belong to the project and apply to all months.
- Colors are canonical `#RRGGBB` on save. Custom choice remains unchanged when low contrast is detected; Auto's selected ink is computed from background and is not persisted as another user choice.
- The 12-photo ceiling applies to **one bulk picker result** per approved flow. This model does not silently invent a lifetime cap on assets/items; normal assignment still has only twelve month slots.

## 3. Assignment command effects

| Command | Preconditions | Atomic project effect |
|---|---|---|
| Initial bulk assign | 1–12 decoded candidates; no project | Create one item/asset per accepted photo and assign in picker-returned order; remaining months missing. Unreadable items are reported separately. |
| Add to empty | Readable new item or unassigned item | Set target item ID and default crop; retain target style. |
| Move | Source occupied, target empty | Move item ID, clear source crop, set target default crop; retain both styles. |
| Swap | Two distinct occupied months | Exchange item IDs; set both crops to default; retain styles. |
| Remove from month | Source occupied | Clear source item ID and crop; item becomes derived Unassigned. |
| Replace from unassigned/new picker | Target occupied, incoming readable | Incoming item enters target with default crop; displaced item becomes Unassigned; target style stays. No mutation on picker cancel/decode failure. |
| Use in Another Month | Source occupied; target valid | Create a second item referencing the same asset; assign to empty target or use explicit occupied-target Replace path; source pairing stays intact. |
| Delete unassigned item | Explicit confirmed item, not assigned | Remove item; remove its asset only if no remaining item references it. Original device photo is untouched. |

Every command validates current state, returns a new project snapshot plus asset additions/deletions, and records affected months for the approved non-blocking reset summary. The UI chooses context-sensitive actions; commands do not assume drag-based assignment. No general undo/history model is added.

## 4. Crop coordinates

The persisted crop is independent of viewport pixels, CSS transforms, and Canvas dimensions. For decoded image `(iw, ih)` and fixed Photo Region `(rw, rh)`, base cover scale is `max(rw/iw, rh/ih)`. Drawn size is `(iw,ih) × baseScale × zoom`. Maximum centered travel on each axis is `max(0, (drawnSize - regionSize)/2)`. Convert `offsetX/Y` to actual translation by multiplying this maximum; clamp values to `[-1,1]`, and force zero on an axis with no travel. This guarantees edge-to-edge coverage at any permitted zoom.

Drag delta in the preview is transformed into Photo Region coordinates and then into normalized travel. A two-pointer pinch changes zoom around the touch centroid: compute the image point under that centroid before zoom, solve the new translation that keeps it under the centroid, then clamp. The explicit zoom control uses the same update path with a center anchor. Reset writes `{1,0,0}`. Pointer capture and `touch-action` apply only to the crop surface; month navigation remains separate. Export evaluates the same crop parameters at 1200px output width. The proposed `1..3` zoom bound mirrors the validated spike control and may be tuned only as an implementation detail if coverage/UX testing requires it; no freeform crop ratio is introduced.

## 5. IndexedDB schema and save protocol

Use one database with two object stores: `project` (single key `active`, containing `CalendarProject` without Blobs) and `assets` (keyed `PhotoAsset.id`, Blob plus metadata). No SQL server or generic repository layer. A thin `loadProject`, `commitProject`, `replaceProject`, and `retrySave` module is sufficient.

1. On load, read `project` and referenced `assets`, validate schema/invariants, and decode on demand. Keep a last committed revision for this tab. If storage is absent or unreadable, show an accurate recovery state rather than silently creating a blank replacement.
2. Prevalidate/decode imports **before** an edit or write. Prepare asset additions and project command result in memory. Serially queue saves so one tab does not race itself.
3. Open one `readwrite` transaction spanning both stores. Read `project.active` **inside that transaction**, compare stored `id` and `revision` to this tab's expected committed values, then request all asset writes/deletes and the next project snapshot/revision within the same transaction. Structure asynchronous IDB requests inside the live transaction; do not await unrelated browser tasks after opening it.
4. Treat only the transaction `complete` event as a successful save. Update this tab's expected revision then signal other tabs through `BroadcastChannel`. The message is advisory; every future write still compares the revision in its transaction. A newer `project.id` also blocks an old tab after Start New.
5. If a transaction aborts from quota, clone error, unavailable storage, or other failure, leave the previous committed project/assets intact and retain visible in-memory edits marked unsaved. Do not delete old assets in a separate earlier transaction. Show persistent T04 failure and Retry. If a tab is stale, stop edits/writes and require refresh; no force-overwrite path.
6. `Start New` runs only after T03 confirmation. Replace/remove the active record and old assets in one transaction, revision guarded. The fresh S01 state is entered only after commit; a failure keeps the prior saved project. A subsequent first import creates the new project.

This is atomic at the IndexedDB transaction boundary, not a promise against browser/OS site-data clearing, eviction, private browsing, or all power-loss cases. The UI must communicate local-only storage. Twelve large original phone photos and real quota exhaustion remain QA requirements, not proven capacity. [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) supports Blob storage and transactions; its [transaction completion event](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction/complete_event) is the save acknowledgement boundary.

## 6. Serialization/versioning rules

- Persist plain structured-clone-compatible records; no React state, `ImageBitmap`, object URL, Canvas, `FileList`, or functions. Blob bytes live only in `assets`.
- Validate `schemaVersion`, exactly 12 month keys, canonical colors, crop bounds, unique item assignment, and every asset reference on restore and before commit. Reject malformed content with a recoverable error; do not silently reset it.
- The schema version is an explicit migration boundary for future app versions. V1 has one schema; later migrations must preserve the old committed record until a new valid record commits.
- Stable resume context is only `assign`, `editor` with valid month, or `review`; transient overlays are omitted. An invalid context falls back to Review, preserving the project.
