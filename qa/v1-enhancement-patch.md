# V1 Enhancement / Polish Patch — QA record

**Status:** Implementation complete for Product Owner visual/interaction review; not a release candidate. No deployment.

## Implemented

- Quiet 32px Editor-only desk grid, Baby Blue CTA/selection/navigation/focus hierarchy with Milk Mint recommendation/success states, typography-based brand slot and minimal `27` favicon. Review gallery remains the focus.
- Three photo-derived background choices directly in each month’s Background Color controls and in the exact-pixel sheet, with manual controls retained. Neutral photos contribute their own colors; limited-color photos show labeled tonal extensions, and unreadable photos show fixed backups without changing the current background.
- Review analyzes each of twelve photos, shows before/after swatches and actual change count, confirms before applying, and persists one-operation color restore across reload.
- Important Date stores only per-month 2027 day numbers. Toggle changes the Preview and Canvas date ink; old projects load with no marks. No event data or reminders.
- Short proof/color/card feedback; `prefers-reduced-motion: reduce` disables the movement. Review now calls out `12 / 12` completion and the full-set action.

## Checks completed

| Check | Evidence | Result |
|---|---|---|
| Production build | `npm run build` | PASS |
| Unit suite | `npm test`, 54/54, including new palette, fallback, color undo and important-date tests | PASS |
| New browser workflow | `tests/browser/enhancement-patch.mjs` in isolated Windows Chrome and Edge | PASS in both |
| Full-set palette | Twelve distinct synthetic photo hues generated twelve distinct coordinated colors; confirmation changed 12 backgrounds; reload retained Restore; Restore returned all original colors | PASS in fixture |
| Important Date | UI add/remove/re-add, reload, single 1200×1800 PNG change at marked day (487 pixels), same marked pixels in first of twelve full-set PNGs | PASS in fixture |
| Visual shell | Brand slot and favicon load; grid appears on Editor workspace; 320px editor has no horizontal overflow; reduced-motion computed proof animation is `none` | PASS in Chrome/Edge emulation |
| Existing 2027 core integration | `session08-integration.mjs`: import, save/reload, 12 digital PNGs and print ZIP | PASS in Chrome |
| Existing JPG path | `session08-jpg-export.mjs`: default PNG, selected twelve-JPG print ZIP, 1252×1843, JFIF 300 dpi, single digital JPG | PASS in Chrome |
| Edge warning/crop | `session08-photo-edge-ui.mjs`: warning/edit/continue and emulated touch crop | PASS in Chrome |
| Responsive regression | `m8-layout.mjs`: 390/320px Editor/Review without horizontal overflow | PASS in Chrome |

Visual evidence: `qa/enhancement-editor-desktop.png`, `qa/enhancement-editor-phone.png`, `qa/enhancement-color-preview-desktop.png`. These synthetic screenshots are for layout review, not real photo aesthetic judgment.

## Remaining before V1 release

The Product Owner has not yet reviewed the patch on their actual project or approved its appearance. Current-build iPhone/iPad Safari, current-stable Safari, Android Chrome, macOS browsers, representative phone originals and named-printer proof remain unverified as recorded in Session 08 QA. Auto contrast and low-resolution warning decisions remain open. The original Session 08 release blockers are not waived by this patch.

## Fresh Baby Blue + Milk Mint color revision

The Product Owner replaced the patch's ink-teal UI direction with Baby Blue for actions/selections and Milk Mint for recommendations/assistance. Before applying it, isolated Chrome comparison screenshots covered Editor, month selector, right controls, photo recommendation sheet, Review gallery/action area, export CTA, smart-color dialog and 320px phone. The first range control looked too heavy and was refined to a thin neutral track with blue thumb; the panel surface was adjusted to near-white. See `design/ui-color-fresh-blue-mint-review.md` and `qa/color-system-comparison/`.

After application, `tests/browser/color-system-regression.mjs` passed in isolated Chrome and Edge: selected month `#EAF3FA`/`#17324A`, navigation/focus blue, workspace `#F3F6F4` with 10% grid, panel `#FCFDFB`, Mint photo recommendation `#EFF8F3`, primary `#B9D7F2`/`#17324A`, hover `#A7CAEB`, pressed `#92B9DE`, and readable neutral disabled state. The 320px page had no horizontal overflow. Rendering the same project before/after a deliberately extreme UI-only style injection yielded identical digital PNG SHA-256, confirming the UI theme does not enter the calendar output in this fixture. The three generated photo suggestion colors also remained unchanged. Product Owner visual review and the formal device/release matrix remain open.

Final regression checked Mint recommendation hover, visible focus boundary, and preserved red error feedback. Browser workflows were run sequentially against the isolated test database: Enhancement Patch, Session 08 integration, twelve-JPG print export, and 390/320px responsive layout all passed. `npm run build`, 55/55 unit tests, and `git diff --check` passed. The existing LAN development address responded with HTTP 200. These results do not replace current-build checks on actual iPhone/iPad or the remaining release matrix.

2026-09-24 per-month palette QA: `tests/browser/monthly-photo-colors.mjs` passed in isolated Windows Chrome. A red January photo produced `#D22832` plus labeled red tonal extensions; a blue February photo produced `#1E5ABE` plus blue extensions. Moving the crop across a synthetic red/blue split image changed the extracted dominant swatch from `#D22832` to `#1E5ABE`. Selecting February's swatch saved February background while January stayed `#FFFFFF`. The 320px phone Background Color sheet showed February's same three swatches without horizontal overflow. Desktop and phone screenshots: `qa/monthly-photo-colors-desktop.png` and `qa/monthly-photo-colors-phone.png`. The preexisting Enhancement Patch, color-system, Session 07 print/color and responsive browser checks passed sequentially. The color domain has unit checks for actual red/blue pixels, neutral pixels, tonal extension and analysis-failure backup. Actual iPhone/iPad photos remain to be reviewed on device.
