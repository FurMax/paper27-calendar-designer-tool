# Calendar Design Studio — UI Prototype Review

**Stage:** Session 04 — High-Fidelity UI Prototype  
**Status:** Session 04 — Approved / Complete  
**Visual direction:** Direction A — Gallery Proofing, approved 2026-09-23  
**UI Freeze / Visual Gate:** Passed — Product Owner approval on 2026-09-23  
**Prototype type:** NON-PRODUCTION UI PROTOTYPE

## 1. Prototype Entry

- Source: `prototype/visual-directions/index.html`
- Local command: run `python -m http.server 4173` from `prototype/visual-directions/`
- Review URL: `http://127.0.0.1:4173/`

The black control bar is review tooling, not product UI. Collapse it before judging the product at small viewports.

## 2. Complete Coverage

### Core screens

| Screen | States and layouts represented | Status |
|---|---|---|
| S01 Project Entry | First-time and Returning; focused desktop and phone layouts | Covered |
| S02 Assign Photos | Desktop 4 × 3; phone 2-column; Partial, All missing, Full, Ready, Missing Photo, Unassigned Photos, Low resolution | Covered |
| S03 Month Editor | Desktop Ready/Missing; phone Ready/Missing; approved month navigation; Photo & Crop; arbitrary solid Background | Covered |
| S04 Review & Export | Desktop incomplete/complete; phone incomplete/complete; desktop 4 × 3; phone 2 × 6 | Covered |

### Transient surfaces

| Surface | Examples represented | Status |
|---|---|---|
| T01 Contextual Photo Actions / Destination Chooser | Ready month, Missing month, Unassigned Photo, Move chooser, Swap/Replace commitment | Covered |
| T02 Delete Confirmation | Project removal versus device-original preservation | Covered |
| T03 Start New Confirmation | One-project replacement and no-cloud consequence | Covered |
| T04 Save / Conflict Feedback | Persistent save-error banner; blocking newer-tab conflict | Covered |
| T05 Export Progress / Result | PNG progress/result; ZIP progress/success/failure/retry | Covered |

## 3. Review Controls

The prototype toolbar exposes:

- S01, S02, S03, and S04.
- Screen-specific state choices.
- Direct examples for every T01–T05 family.
- Hide / Show controls.

Direction switching has been removed. Direction B and C remain documentation-only comparison/rejected references and are not V1 themes.

## 4. In-Product Prototype Interactions

- Project navigation switches between Assign Photos, Edit Months, and Review & Export.
- S02 month and Unassigned Photo cards open context-sensitive T01 actions.
- T01 actions can open destination selection and explicit Swap/Replace commitment examples.
- S03 phone Month + Year opens the January–December switcher with written Ready/Missing Photo states.
- S03 Photo & Crop opens explicit zoom and Reset Crop controls.
- S03 Background provides a clickable picker, HEX entry, RGB entry, and optional Quick colors.
- Background updates the Calendar Proof separately from app accent/workspace color and recalculates Auto dark/light calendar text.
- S03 desktop places 日历文字 directly in the right Properties Panel as a peer of 照片, 背景色, and 导出; no dialog is needed. Phone opens a 日历文字 bottom sheet. Both Ready and Missing Photo states can reach the same controls.
- Three curated project-wide typography systems have live English `January` samples (经典 / 简约 / 手写). Each may use role-specific fonts, weights, and spacing internally. The project-wide size presets are 小 / 标准 / 大, default 标准; no free px slider exists.
- Auto text color is the default; Custom provides picker and HEX, and a low-contrast choice shows a non-blocking warning. The Auto helper copy hides in Custom mode rather than describing the wrong state.
- Prototype background and text-color mode/value are held separately per month in memory for navigation/review consistency; typography and size presets remain shared across the set. None of these values persist after reload.
- Download PNG opens lightweight transient progress then mock success; Download 12-Month ZIP opens focused progress then mock success. The review toolbar exposes ZIP failure, and Retry returns to progress and then success.
- Start New, Delete, save failure, and conflict examples preserve the approved consequence copy.

All interactions are fake review state. They do not persist or produce files.

## Controlled V1 Change — Language and Calendar Type

- Product UI Language is Simplified Chinese throughout S01–S04 and T01–T05: navigation, buttons, headings, state, helper copy, dialogs, bottom sheets, warnings/errors, and save/export feedback. There is no language switcher.
- Calendar Output Language stays English. Calendar Proof month names remain `January`–`December`, weekday labels remain `S M T W T F S`, and year/dates remain Arabic numerals. The Product UI month navigator instead reads `1月`–`12月`.
- Calendar Background remains any solid color with picker, HEX, RGB, and Quick Colors. Quick Colors do not constrain the palette. No background image/gradient/texture/multi-region option was added.
- Month title, year, weekday labels, and dates all consume the same computed Calendar Text Color. The prior weekday color rule was removed. Auto chooses the higher-contrast dark/light ink; Custom preserves the chosen ink and warns without blocking when contrast falls below the review threshold.
- Classic / Minimal / Handwritten are the three user-facing typography concepts; Instrument Serif, Instrument Sans, and Patrick Hand are temporary English-output prototype candidates, not final font commitments. Typography system and size are project-wide; text color and background are month-level product decisions. No advanced typography panel is introduced.
- The visible site name is `2027 Calendar Designer`. Chinese UI headings, controls, and dialogs use the separate modern UI sans-serif stack. Calendar typography changes do not touch that stack.
- The prototype still does not create real PNG/ZIP files or implement picker, crop engine, persistence, and save. It only demonstrates the approved UX states.

## Final Simplified Chinese UI Copy Polish

- S01 First-time Entry now reads “2027 年日历” / “把喜欢的照片，放进 2027 的每个月。” with the shorter subtitle, “最多选 12 张”, “选择照片”, “逐月添加”, and “仅保存在当前浏览器，不会同步到云端。” The direct-selection and gradual-add paths are unchanged.
- S01 Returning, S02 assignment guidance, S03 editing help, S04 incomplete/complete summaries, and T01–T05 confirmations, save feedback, and export feedback were checked for natural, concise Chinese. Replacement, removal, new-project, conflict, and failure copy still states the original consequence or recovery action.
- Dynamic Product UI labels were checked too: month actions and progress counts translate naturally (for example, “为 4 月添加照片” and “9 / 12 个月已就绪”). The previously untranslated “Unassigned Photo” label in T01 is now “未分配照片”.
- The Calendar Proof still uses English month names and `S M T W T F S`, with `2027` and Arabic dates; Review miniature pages also retain English month names and year. No layout, interaction, or production behavior was changed by this copy pass.

## 5. Calendar and Navigation Verification

- S03 January 2027 places January 1 on Friday and January 31 on Sunday.
- Weekday order is Sunday through Saturday.
- Six date rows remain present.
- The proof is portrait 2:3 with one upper photo region and one lower month/date region.
- Missing Photo changes only the photo region.
- Desktop retains the full January–December horizontal navigator, selected month, written/structural state markers, and Previous/Next.
- Phone top sticky context contains Month + Year direct selector, state, and Review, with no Previous/Next arrows.
- Phone bottom sticky navigation contains only Previous and Next and does not repeat a direct selector.
- Direct and sequential month controls switch the selected month, update the 2027 date grid, and keep the Product UI month label Chinese while the Calendar Proof month name remains English.
- Crop interactions never navigate months.

## 6. Visual Hierarchy Review

- S03 Calendar Proof owns the strongest elevation and the flexible majority of the editor layout.
- The desktop body-level 分配照片 and 预览与导出 buttons were removed because the top navigation already provides them. The duplicate “1月预览” caption was removed above the proof; `1200 × 1800 px` is quiet metadata in the 导出 section.
- The desktop Properties Panel scrolls within the viewport at shorter heights, keeping its direct controls reachable without shrinking the proof. On phone, typography stays in the sheet rather than displacing the preview.
- The proof’s outer workspace uses a light surface boundary and breathing room, not a second heavy card.
- Editorial headings provide identity without outweighing the proof or Calendar Set.
- S02 cards remain assignment objects rather than dashboard widgets.
- S04 miniature pages read as one coordinated Calendar Set rather than a file-management list.
- Ultramarine filled buttons are limited to true task-advancing actions.
- Single-month PNG is neutral/outlined in the editor and month cards.
- There are no product gradients, glass surfaces, decorative props, textures, grain, or heavy print-production chrome.

## 7. Responsive Review Matrix

| Target | Viewport | Observed result |
|---|---:|---|
| Desktop wide | 1440 × 900 | Pass. S02/S04 use 4 columns; S03 proof dominates beside viewport-bounded, internally scrolling Properties Panel. |
| Desktop medium / iPad landscape | 1024 × 768 | Pass. S02/S04 retain 4 columns; S03 remains side by side and Properties Panel controls scroll within the viewport. |
| iPad portrait | 768 × 1024 | Pass. S02/S04 use 3 adaptive columns; S03 stacks proof and controls without losing actions. |
| iPhone portrait | 390 × 844 | Pass. S02/S04 use 2 columns; S03 direct and sequential navigation remain distinct. |
| Short iPhone portrait | 390 × 667 | Pass with expected vertical scroll. Preview remains large; sticky Previous/Next remains reachable. |
| Phone landscape | 844 × 390 | Pass for operability. Desktop-like controls remain available by vertical scroll; no separate landscape composition. |
| Narrow/enlarged-text proxy | 320 × 844 | Pass. S02/S04 fall back to one column; long labels wrap and actions remain reachable. |

The seven target viewports were rechecked after this refinement. Document width stayed within the viewport in each case; at 390 and 320 px the full `2027 Calendar Designer` brand remains visible. The expanded prototype toolbar deliberately consumes extra height and should not be included in product-layout judgment.

## 8. Required Risk Checks

### Preview as visual subject

Pass. The S03 proof remains larger, more colorful, and more elevated than controls at reviewed desktop, tablet, and phone sizes.

### S02 phone cards

Pass. At 390 px, two columns retain recognizable thumbnails, written month/state, a large card action target, and the low-resolution marker. At the narrow fallback, cards become one column.

### S04 Calendar Set versus file manager

Pass. Cards show miniature calendar pages first, then month/state and quiet actions. Export appears as a set-level conclusion rather than a file table.

### Bottom-sheet height

Pass for prototype review. Background, Calendar Text, Photo & Crop, contextual actions, and confirmation sheets stay within the viewport, scroll internally when required, preserve an explicit close/done action, and include safe-area padding. The 320 × 844 Calendar Text sheet keeps its three presets and Done action readable.

### Long labels / enlarged text

Pass at the narrow/enlarged-text proxy. Labels wrap rather than clip; 2-column content falls back to one column before becoming unreadable.

### Safe areas

Pass in CSS/visual inspection. Sticky action rows and sheets use `env(safe-area-inset-bottom)` and do not place the only action under the bottom edge.

### Save-error banner

Pass. The persistent error participates in layout, pushes S03 content downward, preserves the preview, and does not cover top or bottom month navigation.

### Status and disabled states

Pass. Ready, Missing Photo, Low resolution, save error, export failure, and disabled ZIP/PNG states all include written meaning and recovery or reason.

### Arbitrary Background color

Pass. Desktop and mobile show a native picker plus HEX and RGB inputs. Quick colors are explicitly shortcuts, not the only choices. App accent and calendar output color remain separate.

### Calendar Text Color review cases

| Case | Background | Mode / computed ink | Month / Year / Weekdays / Dates |
|---|---|---|---|
| Light Background | `#FFFFFF` | Auto / `#1E211F` | All four computed `rgb(30, 33, 31)` |
| Dark Background | `#232A3B` | Auto / `#FFFFFF` | All four computed `rgb(255, 255, 255)` |
| Low-contrast Custom | `#232A3B` | Custom / `#232A3B` | Choice retained; non-blocking warning visible |

All three typography presets and the Small/Standard/Large scales were exercised in the browser; computed font sizes changed for month, year, weekdays, and dates. The Handwritten preset used Patrick Hand for month/date roles but Instrument Sans for weekday/year roles, demonstrating a complete preset rather than a single-font-file constraint. The Product UI retained its independent Simplified-Chinese sans-serif stack. On a 320 px phone, all three `January` samples, size options, Custom picker/HEX, warning, and Done action fit inside the bottom sheet; switching back to Auto hid the Custom fields and restored the Auto helper copy. `September` at Large/Handwritten remained clear of the year in the 320 px proof.

## 9. Accessibility Review

- Keyboard focus was visually inspected; the 3 px focus ring remains visible against neutral and accent surfaces.
- Core product controls and swatches use at least 44 × 44 px targets.
- Statuses combine words, marks, and structure; color is not the sole signal.
- Inputs have written labels, and dialogs use associated titles.
- Disabled controls remain legible and expose reasons.
- DOM/source order follows visual reading order.
- Reduced-motion CSS removes nonessential transition duration.
- 320 px review provides the one-column accessibility/narrow-width fallback.

Measured color pairs:

| Pair | Ratio |
|---|---:|
| Carbon / Gallery fog | 15.04:1 |
| Graphite / Gallery fog | 4.64:1 |
| Graphite / Proof paper | 5.11:1 |
| White / Ultramarine | 6.05:1 |
| Warning text / warning surface | 5.38:1 |
| Error text / error surface | 5.84:1 |
| Success support / white | 5.67:1 |
| Disabled text / disabled surface | 4.09:1 |

Formal VoiceOver/NVDA and target-browser testing remain later Technical Validation / implementation QA. The visual artifact does not claim those tests have run.

## 10. Consistency Audit

- [x] Four core screens and five transient-surface families are represented.
- [x] Approved IA/UX terms and exit paths remain intact.
- [x] S02 and S04 maintain January–December row-major order.
- [x] Completion vocabulary remains only Ready and Missing Photo.
- [x] Low resolution remains a warning, not a third completion state.
- [x] Unassigned Photos remains project-only and hides outside relevant state.
- [x] S03 Desktop month navigation remains horizontal and complete.
- [x] S03 Phone month navigation contains no duplicate direct selector or crop gesture.
- [x] Calendar background remains an arbitrary single solid color.
- [x] Simplified Chinese Product UI and English Calendar Proof/output are explicit and separated.
- [x] Desktop has direct 日历文字 Properties Panel controls; phone has a bottom sheet. Both expose three live `January` typography samples, Small/Standard/Large, and Auto/Custom unified Calendar Text Color in Ready and Missing Photo states.
- [x] Light/dark Auto cases give Month, Year, Weekdays, and Dates identical computed color; Custom warns without overriding.
- [x] Calendar typography and size changes do not change the Product UI sans-serif font.
- [x] Desktop body-level duplicate navigation actions and redundant proof caption are removed; export dimensions remain low-priority metadata in 导出.
- [x] The visible site name is `2027 Calendar Designer`, including at 320 px.
- [x] Single PNG and ZIP feedback remain transient rather than pages.
- [x] Healthy save remains quiet; failure persists; conflict blocks.
- [x] Direction B/C are absent from the product prototype.
- [x] Workspace Custom Background is recorded only as a Post-V1 idea and is not implemented.
- [x] No production persistence, rendering, ZIP, backend, API, or state architecture is present.

## 11. Known Prototype Limitations and Technical Handoff

- Google Fonts are loaded externally with system fallbacks for this prototype.
- The photo is a local SVG illustration reused with review-only color variation.
- Drag, pinch, picker, decode, crop, persistence, conflict, export, and browser file handoff are visually represented but not implemented.
- The selected S03 month has generated 2027 date cells for navigation review; S04 cards remain miniature visual set representations, not a production calendar engine.
- Review controls use in-memory DOM state and must not be treated as production architecture.

Technical Validation must later verify free-commercial-use licenses for final font files, WebFont loading/file size, Safari compatibility, stable font rendering in PNG output, actual calendar rendering accuracy, pointer/touch crop behavior, Auto contrast behavior over arbitrary colors, safe-area/browser-chrome behavior, local persistence/conflict handling, and PNG/ZIP generation/download handoff across the formal support matrix.

## 12. UI Freeze Gate Status

There is no remaining blocking **OPEN QUESTION** or **UX CONFLICT** known to the Session 04 artifacts. Section 11 Technical Validation handoffs remain in place.

The Product Owner approved Session 04 — **Approved / Complete** — and passed the **UI Freeze / Visual Gate** on **2026-09-23**. This prototype is the frozen V1 UI baseline. Small Chinese copy, spacing/alignment, accessibility, contrast, browser-specific layout, and implementation-fidelity corrections remain permissible when they preserve it. A change to Product Scope, IA, User Flow, Screen Structure, Interaction Semantics, Feature Hierarchy, or Visual System requires a documented **UI / UX CHANGE REQUEST** before implementation; it must not be made silently.

This Session 04 closeout does not begin Technical Validation, Technical Architecture, or production implementation. The next stage begins in a new Codex session with Product Owner direction.
