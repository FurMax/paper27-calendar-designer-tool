# UI / UX CHANGE REQUEST — Session 05 output and crop clarification

**Status:** Product Owner directed this refinement on 2026-09-23 in Session 05. Record before applying the affected artifact updates; Technical Validation Gate remains open. This is an explicit clarification/change to the frozen V1 baseline, not an agent-selected new theme or production implementation.

## Decision supplied by Product Owner

1. The **whole** Calendar Output is 1200 × 1800 px portrait 2:3. The upper Photo Region spans the full output width and uses cover crop without gutters, letterboxing, an added background border or exposed blank area. The lower Calendar Region remains separate, uses the selected solid color, and retains the English calendar.
2. Desktop pointer/mouse drag, mobile single-finger drag and pinch, explicit zoom, and Reset to centered fill are hard V1 requirements. A failed disposable spike does not weaken them.
3. Full-set output means **12 independent monthly PNGs**. The visible full-set action means generate January–December. ZIP is a delivery package, validated on desktop, not the product output definition.
4. Mobile full-set delivery is unresolved until trusted-HTTPS real-device testing of multi-file Web Share/Save. ZIP and individual saves are candidates; the UI must not automatically start 12 independent downloads.

## Scope of artifact changes

Clarify `product/` output/crop rules and affected `design/` IA, flow, screen, interaction, wireframe, decision and visual-system text. The already approved S01–S04 prototype remains a **non-production historical visual baseline** during Session 05; its old “Download 12-Month ZIP” mock action is a known copy/semantics mismatch to resolve after the mobile handoff is validated. This request does not authorize Production Architecture or implementation.

## Open technical question

Which mobile primary handoff actually gets 12 PNGs into the user's Files or Photos workflow reliably? Record `navigator.share`, `navigator.canShare({files})`, actual Share Sheet, save destination and interruption on real iPhone/iPad Safari under trusted HTTPS before choosing.

## Later Product Owner requirement — direct iPhone Photos save

On 2026-09-23, after trying **both** isolated PNG download entrances, the Product Owner initially could not find the file, then located a downloaded PNG in iCloud Drive → Downloads. The Product Owner stated that opening the PNG and then manually saving it to Photos is unacceptable: the desired action must save directly to Photos **without a second step**. Record this as a requested interaction outcome, **not** an approved claim that a browser-only implementation exists. Ordinary file download, Web Share target selection and Open→Save must not be relabeled as meeting this outcome. The conflict with the approved browser-only V1 platform is an **OPEN QUESTION** for explicit product resolution. This change request authorizes no production implementation or native-app scope change.
