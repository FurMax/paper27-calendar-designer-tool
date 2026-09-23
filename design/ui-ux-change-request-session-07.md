# UI / UX CHANGE REQUEST — Session 07 Implementation Review Feedback

**Status:** Proposed / OPEN QUESTION. No change to frozen V1 scope, hierarchy or visual system is approved by this document. The approved Direction A baseline remains in force.

## Evidence and current behavior

On 2026-09-23, the Product Owner reported the five-step iPhone Safari implementation review working through full-set ZIP download, then raised three usability points:

1. The phone received a ZIP rather than twelve separate downloads. The Product Owner was unsure whether iOS could extract it. iPhone extraction and all-twelve-file inspection were not verified in that report. The approved V1 semantics generate twelve independent PNGs; ZIP is packaging. Automatic twelve-download delivery is explicitly excluded by the approved IA/technical plan. Mobile primary delivery remains an OPEN TECHNICAL QUESTION pending trusted-HTTPS iPhone/iPad testing.
2. The native eyedropper felt inaccurate; the palette could be improved. The current background control uses the browser/system color input plus arbitrary HEX, RGB and Quick Colors. Calendar text Custom uses a color input and HEX.
3. The Product Owner asked for font color adjustment. This already exists as **文字颜色 · 当前月份 → 自动 / 自定义** within the mobile “日历文字” sheet and desktop Properties Panel. Custom applies one color to month title, year, weekdays and dates; low contrast warns without blocking. The project-wide typography preset and scale are separate from per-month text color.

## Implementation fidelity correction already made

The mobile trigger now reads **日历文字：字体、大小、颜色**; the sheet heading explicitly names **文字颜色**. Small helper copy points to HEX/RGB for precise background color and HEX for Custom text color. The state model, controls, placement, feature hierarchy and visual system remain unchanged. A 320px browser check found no horizontal overflow and confirmed the Custom picker/HEX field.

## Proposed palette revision for Product Owner review

Keep the approved per-month solid-color model and all four existing Quick Colors. On desktop Properties and the phone Background sheet, present the same controls with clearer grouping:

```text
背景色
当前颜色   [large swatch]   #E6DDD1
常用颜色   [白色] [浅灰] [暖米] [深绿]   (44 px touch targets)
精确调整   [system color picker] [HEX] [R] [G] [B]
```

Each shortcut receives a visible Chinese name in addition to its color. The current HEX value remains readable without opening the system picker. The browser-native picker stays optional; its eyedropper precision cannot be controlled by this site. No photo-derived palette, extra colors, gradient, texture, or project-wide override is introduced. The calendar text color remains the already-approved **当前月份 → 自动 / 自定义** control. Acceptance would require 320/390px sheet fit, keyboard/screen-reader labels, arbitrary HEX/RGB persistence, and unchanged preview/PNG color output.

This rearranges and enlarges controls in the frozen visual baseline, so it is **proposed only**. It must pass the applicable UI/UX change gate before production implementation.

## Decisions required before a larger change

- **OPEN QUESTION — palette redesign:** Approve the concrete grouped palette revision above, or keep the now-clarified current picker and exact HEX/RGB controls? A custom eyedropper/photo sampling mechanism would be a separate scope proposal. The current browser-native eyedropper sampling precision cannot be changed by styling our existing input.
- **OPEN QUESTION — text-color scope:** Does the requested adjustment mean the existing **current-month Custom color**, or a new project-wide color operation? Project-wide text color would change the approved per-month semantics and require a gate decision.
- **OPEN QUESTION — mobile full-set handoff:** The desired outcome is access to twelve separate PNGs without a confusing ZIP step. Trusted-HTTPS real-device multi-file Web Share/Save and actual destinations must be measured first. No automatic twelve-download action or mobile primary handoff is approved here; the separate one-action direct-Photos issue remains unresolved.

**Gate:** Under `AGENTS.md`, any actual change to Interaction Semantics, Feature Hierarchy or the frozen Visual System needs Product Owner approval before implementation. This request records the options; it does not authorize them.
