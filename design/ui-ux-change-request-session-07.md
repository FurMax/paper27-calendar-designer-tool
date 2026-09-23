# UI / UX CHANGE REQUEST — Session 07 Implementation Review Feedback

**Status:** Grouped palette, stronger 80% / 100% / 120% text-size cards, and explicit photo-pixel sampling were approved by the Product Owner on 2026-09-23 and implemented in Session 07. Mobile multi-file/Photos handoff remains OPEN QUESTION.

## Evidence and current behavior

On 2026-09-23, the Product Owner reported the five-step iPhone Safari implementation review working through full-set ZIP download, then raised three usability points:

1. The phone received a ZIP rather than twelve separate downloads. The Product Owner later confirmed that iPhone ZIP extraction worked; inspection of all twelve PNGs was not recorded. The approved V1 semantics generate twelve independent PNGs; ZIP is packaging. Automatic twelve-download delivery is explicitly excluded by the approved IA/technical plan. Mobile primary delivery remains an OPEN TECHNICAL QUESTION pending trusted-HTTPS iPhone/iPad testing.
2. The native eyedropper felt inaccurate; the palette could be improved. The current background control uses the browser/system color input plus arbitrary HEX, RGB and Quick Colors. Calendar text Custom uses a color input and HEX.
3. The Product Owner asked for font color adjustment. This already exists as **文字颜色 · 当前月份 → 自动 / 自定义** within the mobile “日历文字” sheet and desktop Properties Panel. Custom applies one color to month title, year, weekdays and dates; low contrast warns without blocking. The project-wide typography preset and scale are separate from per-month text color.

## Implementation fidelity correction already made

The mobile trigger now reads **日历文字：字体、大小、颜色**; the sheet heading explicitly names **文字颜色**. Small helper copy points to HEX/RGB for precise background color and HEX for Custom text color. The state model, controls, placement, feature hierarchy and visual system remain unchanged. A 320px browser check found no horizontal overflow and confirmed the Custom picker/HEX field.

## Grouped palette revision approved by Product Owner

Keep the approved per-month solid-color model and all four existing Quick Colors. On desktop Properties and the phone Background sheet, present the same controls with clearer grouping:

```text
背景色
当前颜色   [large swatch]   #E6DDD1
常用颜色   [白色] [浅灰] [暖米] [深绿]   (44 px touch targets)
精确调整   [system color picker] [HEX] [R] [G] [B]
```

Each shortcut receives a visible Chinese name in addition to its color. The current HEX value remains readable without opening the system picker. The browser-native picker stays optional; its eyedropper precision cannot be controlled by this site. This grouped-controls proposal alone does not add photo sampling, extra colors, gradient, texture, or a project-wide override; the separate photo-sampling proposal is below. The calendar text color remains the already-approved **当前月份 → 自动 / 自定义** control. Acceptance would require 320/390px sheet fit, keyboard/screen-reader labels, arbitrary HEX/RGB persistence, and unchanged preview/PNG color output.

The Product Owner approved this clearer grouping as a frozen-UI amendment on 2026-09-23; it is implemented without changing the per-month solid-color model.

## Remaining decision

The grouped palette and separate photo sampler are approved and implemented as described below.
Text color remains the approved current-month Auto/Custom control. No project-wide color operation was requested or approved.
- **OPEN QUESTION — mobile full-set handoff:** The desired outcome is access to twelve separate PNGs without a confusing ZIP step. Trusted-HTTPS real-device multi-file Web Share/Save and actual destinations must be measured first. No automatic twelve-download action or mobile primary handoff is approved here; the separate one-action direct-Photos issue remains unresolved.

**Gate result:** The Product Owner approved the grouped palette, photo sampler and stronger scale on 2026-09-23. Mobile multi-file/Photos handoff remains an OPEN QUESTION and was not changed.

## Approved follow-up — more distinct text-size presets

The Product Owner reported that Small / Standard / Large are hard to distinguish. At the time of that report, production multipliers were **0.88 / 1 / 1.12**. At a 390px phone viewport, the Calendar Proof measured title **20.24 / 23 / 25.76 px**, weekday **10.56 / 12 / 13.44 px**, and date **11.44 / 13 / 14.56 px**. The observation supports the reported issue; it does not by itself establish a safe larger range.

**Approved Visual System change:** keep the three existing presets and Standard at 1, but widen Small / Large to **0.80 / 1 / 1.20**. Before acceptance, compare all three typography families across all twelve English months at 320px and 390px, and inspect actual PNG exports for clipping, date-grid legibility, adjacent-month balance, and parity with Preview. Persisted scale enum values stay unchanged. If the larger range fails those checks, bring measured alternatives back for Product Owner review instead of silently changing other layout geometry.

The Product Owner subsequently approved this specific visual-system change. The implementation now uses **0.80 / 1 / 1.20**; the earlier automatic approval rejection occurred before this explicit approval.

## Approved follow-up — sample a color from the photo

The Product Owner wants the background color to match a color visible in the selected photo. The current browser/system `<input type="color">` eyedropper is outside the site's control, so improving labels or HEX/RGB entry alone cannot make its photo sampling precise.

**Approved Interaction Semantics change:** add a clearly named **从照片取色** action beside the existing background picker. Activating it enters a temporary sampling mode on the current month's visible photo; a tap/click chooses a point, maps that point through the current crop transform to the decoded source image, and sets the same per-month solid background color used by HEX/RGB. Show the sampled color and HEX immediately; Cancel/Escape leaves the prior value unchanged. Crop gestures resume when sampling ends. A small visible target/zoom aid should be reviewed on touch because finger occlusion makes exact-point choice difficult. The implementation must account for image orientation, canvas color conversion and edge coordinates; test a known-color fixture through both Preview and exported PNG.

The implementation samples the **exact decoded pixel** under the chosen point after the current crop, previews its HEX/swatch, and changes the month background only on confirmation. The desktop native picker and HEX/RGB remain. Real iPhone Safari touch/color verification remains part of Session 08 QA.

## Product Owner approval and implementation result

On 2026-09-23 the Product Owner confirmed that desktop native color picking worked, approved clearer frozen UI changes, requested iPhone color-picking improvement, and approved the more distinct scale. The implemented Background section has a current-color swatch/HEX, four named Quick Colors, system picker, exact HEX/RGB, and a separate touch-friendly **从照片取色** sheet. The user can drag a target across the current cropped photo, inspect a sampled HEX, then explicitly apply or cancel. The size cards and rendered calendar use 80% / 100% / 120%. This does not introduce a project-wide text-color operation. The mobile multi-file/Photos handoff question remains outside this approval.
