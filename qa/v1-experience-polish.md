# V1 Experience Polish — Implementation QA

**Status:** V1 Experience Polish — Awaiting Product Owner Review (2026-09-24). No release candidate, release approval, or deployment.

## Requested outcome, in brief order

1. **Editor workspace:** Quieter blue-gray proofing grid, lighter framing, and clearer preview emphasis. The grid exists only in the editor shell, never in calendar output.
2. **Month navigation and controls:** Month hover/selection and right-panel hierarchy refined with spacing and restrained dividers; Important Date hover is distinct from the red marked state.
3. **Photo recommendations:** Recommendations still sample the active cropped photo; semantic 主色/搭配色/点缀色 labels and larger swatches make choices legible. Limited-color crops get labeled light/dark extensions. Selection remains explicit and per month.
4. **Twelve-month palette:** The existing confirmation sheet now shows all twelve proposed backgrounds, allows month-by-month proof and edit navigation, and applies only on confirmation. Cancel does not write; one-time restore still works.
5. **Review:** A clear 12/12 completion cue and export heading support the final check. Every month card remains a route back to editing.
6. **Entry:** Three decorative calendar sheets replace the blank paper illustration; the entry actions and project state are unchanged.
7. **Micro motion:** Small hover, reveal, and completion transitions; reduced-motion disables the new animation.
8. **Export feedback:** Existing ZIP generation reports months 1–12 as they finish and shows a distinct ready state. ZIP content and output formats are unchanged.
9. **Copy:** Crop/proof helpers and import/export errors are clearer; recoverable technical details remain available in expandable areas.
10. **Accessibility:** Keyboard focus and disabled states checked; mobile 320 px layout has no horizontal overflow and full-set palette chips meet the tested 68 px target height.
11. **Visual comparison:** Screenshots under `qa/experience-polish/` capture before/after Entry, Editor, Review, palette sheet, and mobile views using synthetic project data on the isolated test origin.
12. **Boundary:** Product UI polish does not change user calendar colors, typography, artwork, PNG/JPG rendering, print bleed, or packaging. The live LAN project database was not touched by automated tests.

## Verification

- `npm run build` — PASS.
- `npm test` — 55/55 PASS.
- `tests/browser/experience-polish.mjs` — PASS: entry sheets, Review cards, preview/cancel persistence, apply/restore, 320 px mobile, reduced motion.
- `tests/browser/experience-export-progress.mjs` — PASS: progress sequence 0–12 and ready state.
- Existing browser regression suite — PASS sequentially: enhancement patch, UI color regression/output parity, Session 08 integration and JPG export, monthly photo colors, M8 layout, dialog focus.

## Remaining review and release gates

- Product Owner hands-on visual/interaction review of this polish is pending.
- These automated passes do not replace a post-change iPhone/iPad device retest or the untested macOS/Android release matrix. The existing Session 08 release blockers and printer proof remain open in `qa/release-checklist.md`.

## 2026-09-24 whole-set color follow-up

The Product Owner observed that the prior whole-set recommendation looked preset. Inspection confirmed that it used the photo's dominant hue but forced almost every output to saturation 0.28 and lightness 0.85. It now chooses from each month's extracted companion/accent recommendation, preferring a moderate contrast with the photo dominant color. A suitable source swatch is used unchanged; a too-dark or intense swatch is softened, and the preview names its source HEX and treatment. A single-color photo uses a tonal extension; failed extraction alone uses the fixed backup. The user's month Editor recommendations remain unchanged.

**Verification:** `npm test` 56/56 PASS; `npm run build` PASS; isolated Chrome `enhancement-patch.mjs` PASS (12 distinct proposals, apply/restore and output parity); `experience-polish.mjs` PASS (source disclosure, preview/cancel, Apply/Restore, 320px layout). New visual capture: `qa/enhancement-color-preview-desktop.png`. Actual-photo Product Owner review is pending.
