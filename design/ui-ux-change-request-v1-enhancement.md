# V1 Enhancement / Polish Patch — UI / UX Change Request

**Status:** Product Owner-directed implementation in progress; visual review pending. This patch does not authorize release or deployment.

## Changes requested

- Editor-only quiet proofing-desk surface, Fresh Baby Blue action/selection hierarchy with Milk Mint recommendation support, typography-based wordmark slot and minimal browser favicon. These do not enter calendar output.
- One-photo recommendation supplies three distinct background colors; exact pixel sampling and manual color controls remain.
- Review offers twelve-photo, month-specific coordinated colors with a before/after preview, explicit confirmation, and one-operation restore retained with the local project.
- Short interaction feedback and clearer Review completion/export status, with reduced-motion support.
- Optional Important Date is assessed as a small per-month list of date numbers. If implemented, it must use the same model in Preview, saved project and Canvas output, and no event metadata or calendar services.

## Boundaries

Calendar geometry, image assignment, crop controls, typography presets, PNG/JPG choices, local-only storage, English output, and Simplified Chinese controls remain. The release matrix and provider proof still block release; this patch goes to Product Owner review first.

## Scope change record

Important Date would be a **controlled V1 scope addition**. It is limited to a red date number for selected dates in the fixed 2027 calendar. No title, description, recurrence, reminders, holiday database, account, sync or new export type. Existing saved schema-1 projects must load with an empty marked-date list. The Product Owner explicitly requested trying this within the patch, subject to implementation not expanding the architecture.

## Per-month photo color visibility correction (Product Owner, 2026-09-24)

The fixed Common Colors row was mistaken for photo recommendations because the actual photo analysis was hidden inside the exact-sampling dialog. In each month's Background Color controls, show three clearly labeled colors derived from that month's visible photo crop. Recompute when its photo, crop, or print/digital preview changes; never copy colors between months or alter a background until the user chooses one. Preserve Common Colors as explicitly fixed shortcuts and retain exact pixel sampling in its dialog. When a photo supplies too few distinct colors, identify tonal extensions as such; reserve the fixed safe palette for analysis failure. Use the same controls in the phone background sheet. This is a visibility and fidelity correction within the approved per-month photo recommendation feature.

## Whole-set photo color selection refinement (Product Owner, 2026-09-24)

The current batch recommendation does sample each month's photo, but turns only its dominant hue into a near-fixed pale tint. The Product Owner asked the whole-set action to draw from the already extracted per-month recommended swatches and choose a gently contrasting principal background. Select a distinct photo-derived companion/accent swatch when available, prefer a moderate relationship to the photo's dominant color, and soften only when the raw swatch is too dark or intense for a calendar background. A one-color photo may use its labeled tonal extension; fixed safe colors remain an analysis-failure fallback only. The confirmation sheet must identify the source swatch and any softening. Preview, explicit apply, cancel, and one-operation restore are unchanged.
