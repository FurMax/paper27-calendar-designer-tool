# V1.1 Editor hierarchy follow-up

**Status:** Implemented for Product Owner review (2026-09-25).

The Editor retains its photo crop, per-month colors, typography, dates, single export, and Review flow. The first viewport pairs a large proof with a short quick-controls rail: month readiness, crop/photo actions, current background, three photo-derived suggestions, and ten common colors. Common colors become a 2 × 5 swatch grid with name and HEX on hover or keyboard focus and accessible labels.

Below the proof and rail, the desk is divided into Style (precise HEX/RGB, texture, calendar text), Dates (important-day controls), and Export (variant, format, current-month export and an entry to the existing twelve-month palette on Review). On narrow screens the same sections stack beneath the proof; the quick background sheet remains available. The existing Review palette preview/apply/restore stays its source of truth; no second palette algorithm or export flow is introduced.

The hovered calendar date appearance is unchanged. The UI-only layout does not alter calendar artwork, stored project data, photo analysis, or export pixels. Validate desktop hierarchy, 320/390 px phone layout, keyboard focus/tooltip, crop/color/date/texture/export, and rapid month switching before Product Owner review. No deployment is authorized by this change.
## Superseded placement notice (2026-09-25)

The later Product Owner refinement in `ui-ux-change-request-v1-1-editor-round-colors.md` supersedes this artifact's square 2 × 5 swatches, precise-color-below, and Dates/Export side-by-side decisions. Current placement is round swatches, rail precision, Style beside Dates, and Export last and full-width. See `qa/v1-1-editor-round-colors.md` for validation.

## Superseding placement — 2026-09-25

The Product Owner's later continuous-rail request moves Style and Date into the right rail after Text Color. The earlier lower-card placement in this request is superseded; see `design/ui-ux-change-request-v1-1-editor-continuous-rail.md`.
