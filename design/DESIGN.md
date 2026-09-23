# Calendar Design Studio — UI Visual System

**Stage:** Session 04 — High-Fidelity UI Prototype  
**Status:** Session 04 — Approved / Complete  
**Approved visual direction:** Direction A — Gallery Proofing, approved by the Product Owner on 2026-09-23  
**UI Freeze / Visual Gate:** Passed — Product Owner approval on 2026-09-23  
**Prototype boundary:** NON-PRODUCTION UI PROTOTYPE  
**Prototype entry:** `prototype/visual-directions/index.html`

## 1. Purpose and Authority

This document records the approved V1 visual system and its complete high-fidelity prototype application. It does not change Product Scope, approved IA/UX semantics, or approved Wireframe structure, and it does not define production component or application architecture.

Direction A is now the only V1 prototype direction. Direction B and Direction C remain below only as comparison and rejected-reference records. They are not product themes and must not be implemented as a theme switcher.

No **UX CONFLICT** was found while applying Direction A to S01–S04 and T01–T05.

## 2. Product-Specific Visual Idea

Calendar Design Studio behaves like a quiet photo-proofing table for one personal calendar set:

- Calendar pages behave like carefully handled paper proofs.
- The product UI behaves like a neutral work surface rather than a dashboard.
- The user’s photos and chosen calendar colors supply most of the visible color.
- Fine rules, small radii, and restrained controls organize the work without imitating Canva, Figma, Photoshop, or print-production software.
- The memorable element is the Calendar Preview and the complete Calendar Set, not decorative product chrome.

Visual priority is fixed:

1. Calendar Preview or Calendar Set.
2. Month or page heading.
3. Controls and navigation.

## 3. Approved Direction A — Gallery Proofing

### Tone

Quiet, exact, friendly, contemporary, and lightweight. The system has enough editorial character to feel intentional, but the calendar proof always carries more visual weight than headings and controls.

### Core palette

| Name | Value | Role |
|---|---:|---|
| Gallery fog | `#F2F4F2` | App and workspace background |
| Proof paper | `#FEFFFD` | Primary surface |
| Raised paper | `#FFFFFF` | Dialogs and sheets |
| Carbon | `#18201D` | Primary text |
| Graphite | `#66706B` | Secondary text |
| Rule | `#D5DBD7` | Borders and dividers |
| Ultramarine ink | `#3457D5` | Primary action, selection, and product focus |

Semantic colors remain separate from the accent:

| Role | Value |
|---|---:|
| Error | `#A83636` |
| Warning | `#8B5A12` |
| Success support | `#2F7355` |
| Focus | `#7690FF` |
| Disabled text | `#69736E` |

### Typography and language boundary

- **Product UI Language:** Simplified Chinese for navigation, controls, status, feedback, dialogs, and sheets. No V1 language switcher.
- **Calendar Output Language:** English month names and Sunday-first `S M T W T F S`; year `2027` and dates remain Arabic numerals. The Calendar Proof and future PNGs share this rule.
- **Product UI font:** a clear Simplified-Chinese system stack (`Noto Sans SC` / `PingFang SC` / `Microsoft YaHei` with fallbacks). The UI never adopts the chosen Calendar Font.
- **Calendar typography:** one of three curated, project-wide systems—经典 / 简约 / 手写 in Product UI—with a live English `January` sample for each. Each preset may assign different fonts, weights, and spacing to month title, year/weekday, and date roles; it is not a requirement that every role use one font file. Instrument Serif, Instrument Sans, and Patrick Hand are temporary prototype candidates, not frozen final font choices.
- **Calendar text size:** project-wide 小 / 标准 / 大 scale presets at 80% / 100% / 120%, default 标准. The three bounded scales preserve the fixed Calendar layout; there is no free px slider.
- Page headings are expressive but remain smaller and quieter than the proof or Calendar Set.
- All functional labels use sentence case; decorative all-caps labels are not part of the system.

### Simplified Chinese UI voice — final copy polish

- S01 First-time Entry uses concise, direct Chinese copy: “2027 年日历” introduces the context, “把喜欢的照片，放进 2027 的每个月。” carries the promise, and “选择照片” names the immediate action. The supporting copy keeps only the 12-photo limit and ability to adjust months next; the local-only note says the project stays in the current browser and does not sync to the cloud.
- S01–S04 and T01–T05 Product UI copy stays short and natural while keeping each approved consequence, status, recovery path, and action meaning intact. Ready/Missing Photo still map to 已就绪/缺少照片; PNG, ZIP, HEX, and RGB remain format/control terms, not a second UI language.
- Calendar Proof month names, weekday initials, year, dates, and live English `January` font samples are outside this UI-copy pass and remain English-output content.

Instrument Sans and Instrument Serif have preliminary open-license evidence in their source projects. All candidates, including Patrick Hand, still require formal commercial-license, loading, file-size, Safari, and PNG-render stability validation in Technical Validation:

- [Instrument Sans source/licensing](https://github.com/Instrument/instrument-sans)
- [Instrument Serif Google Fonts metadata](https://github.com/google/fonts/blob/main/ofl/instrumentserif/METADATA.pb)

### Calendar text and background

- Calendar Background remains one arbitrary solid color per month: picker, HEX, RGB, and optional Quick Colors. Quick Colors are suggestions, not a palette restriction.
- Calendar Text Color defaults to Auto and chooses a high-contrast dark/light value from the background. Custom offers a picker and HEX. A low-contrast Custom choice produces a non-blocking warning, never an automatic override.
- Month title, year, weekday labels, and date numbers use one computed Calendar Text Color. The weekday rule cannot use a separate fixed ink.
- Desktop Month Editor places 日历文字 directly in the right Properties Panel at the same section level as 照片, 背景色, and 导出. Phone uses one task-specific 日历文字 bottom sheet. Neither surface adds freeform or per-element typography controls.

### Layout and alignment

- Content and controls are predominantly left aligned.
- S01 uses one focused entry proof rather than a marketing page or project dashboard.
- S02 uses an ordered month grid: 4 × 3 on desktop, 2 columns on phone, and one column only for unusually narrow/enlarged-text fallback.
- S03 uses an open work surface around the dominant Calendar Proof; the outer workspace has a light boundary, while the proof owns the principal elevation.
- S04 treats the 12 pages as one Calendar Set: 4 × 3 on desktop and 2 × 6 on phone.
- Dialogs and sheets are neutral reading surfaces without illustration, glass, texture, props, or decorative backgrounds.

## 4. Token System

These are prototype visual values, not production component-architecture decisions.

### Spacing

- Base rhythm: 4 px.
- Primary steps: 8, 12, 16, 24, 32, 48, and 64 px.
- Dense controls: 8–12 px internal gaps.
- Cards: 12–20 px internal spacing according to density.
- Major page regions: 32–64 px separation.
- Preview breathing room takes priority over decorative whitespace around controls.

### Radius

- Inputs and buttons: 8 px.
- Month and review cards: 8 px.
- Dialogs and sheets: 14 px on exposed outer corners.
- Calendar proof: 3 px, like trimmed paper.
- Full pills are reserved for compact state/recovery links such as Missing month links.

### Borders and elevation

- Default organization uses a 1 px neutral rule and surface contrast.
- Ordinary cards do not receive ambient shadows.
- The Calendar Proof receives the strongest controlled shadow.
- S03’s outer work surface uses a subtle boundary, not a heavy SaaS card.
- Dialogs and sheets use one diffuse elevation over a neutral overlay.

## 5. Action Hierarchy

- Ultramarine filled Primary is reserved for a true task-advancing action, including first-time **Choose Photos**, **Continue to Edit Months**, and complete-project **Generate Full Set / 生成整套 12 张**. The final delivery label can name ZIP or Share/Save only after platform validation.
- **Download January PNG** is a neutral outline Secondary, not a saturated page-level Primary.
- Ordinary edit actions use neutral Secondary or Quiet treatment.
- Destructive actions use explicit red wording/treatment and never borrow Primary styling.
- Disabled controls remain written and legible; the reason is shown nearby when not obvious.
- Core product touch targets are at least 44 × 44 px.

## 6. Calendar and Photo Treatment

### Calendar proof

- Portrait 2:3 paper proof uses the 1200 × 1800 trim composition; print export maps it to 100 × 150 mm within a 106 × 156 mm bleed PNG at 300 PPI.
- One fixed upper Photo Region and one fixed lower Calendar Region. The Photo Region spans the full proof width; its photo covers that region edge to edge with no gutters, added border, letterboxing, centered smaller image, or uncovered crop. The Photo Region itself is not 2:3 by requirement. The lower region carries the chosen solid color and English calendar content.
- Correct Sunday-first, six-row January 2027 sample data is visible in S03.
- Missing Photo replaces only the photo region; month identity, calendar, background, and navigation remain intact.
- The proof supplies the main page elevation and is not nested inside another heavy card.

### Calendar background color

Calendar background is completely separate from the app accent and workspace background.

The complete prototype provides:

- A clickable native color picker/swatch.
- Arbitrary `#RRGGBB` HEX input.
- Independent 0–255 RGB inputs.
- Four clearly labeled **Quick colors** shortcuts.
- Auto black/white Calendar text selection for contrast, with one optional Custom picker/HEX color.

V1 output remains one arbitrary solid background color per month. There are no gradients, textures, background images, or multiple background regions. Unified Calendar Text Color is the only direct text-color control.

### Photo behavior represented visually

- Assigned photos cover the full-width fixed Photo Region; pointer/mouse drag, single-finger drag, pinch and explicit zoom preserve coverage through clamped offsets. Reset returns to centered fill.
- S03 provides explicit zoom, Reset Crop, and Replace Photo controls.
- Mobile Photo & Crop uses a task-specific sheet.
- The crop surface does not carry month-navigation gestures.
- Low resolution is a non-blocking written warning and does not change Ready status.

## 7. Screen Application

### S01 — Project Entry

- First-time state keeps the product promise, 2027 context, selection limit, and direct **选择照片** action in the first ordinary phone viewport.
- The final Chinese headline, selection guidance, primary/secondary actions, and local-only note are visible in the 390 × 844 first-time view with review tooling collapsed; copy polish does not add a Start step or change where either action leads.
- Returning state gives **Resume Calendar** sole Primary priority and routes **Start New Calendar** through T03.
- Local-only storage language remains present without becoming the page headline.

### S02 — Assign Photos

- Desktop uses January–December row-major 4 × 3.
- Phone uses a readable 2-column grid; card body is the action target.
- Partial state visibly combines Ready, Missing Photo, a specific Low-resolution warning, and Unassigned Photos.
- All-missing and all-ready states preserve the same ordered structure.
- Unassigned Photos follows the 12 slots, appears only when non-empty, and is described as selected for this calendar only.
- Sticky Continue/Done does not cover the final content and includes safe-area padding on phone.

### S03 — Month Editor

- Desktop preserves the approved January–December horizontal navigator, selected month, Ready/Missing state, and Previous/Next behavior.
- The Calendar Proof remains wider and visually stronger than the bounded control column.
- Phone top sticky context contains only Month + Year direct selector, state, and Review.
- Phone bottom sticky navigation contains only Previous and Next.
- Desktop Properties Panel directly exposes 照片, 背景色, 日历文字, and 导出 in that order. 日历文字 shows three live English font samples, 小 / 标准 / 大, and 自动 / 自定义 text color. The top product navigation is not repeated as body-level 分配照片 / 预览与导出 actions, and the redundant “1月预览” caption has been removed above the proof; 106 × 156 mm print and 1200 × 1800 px digital choices are clear in 导出.
- Phone opens task-specific 照片与裁切, 背景色, and 日历文字 sheets. Background retains arbitrary picker, HEX, RGB, and Quick Colors; 日历文字 provides the same three controls without crowding the preview.
- Single-month PNG remains a quiet Secondary.

### S04 — Review & Export

- Desktop preserves 4 × 3 and phone preserves 2 × 6.
- Cards resemble a coordinated paper Calendar Set, not downloadable file rows.
- Incomplete state shows named Missing month recovery and keeps Ready-month PNG actions available.
- Complete state gives the full-set generation action the sole filled export Primary. It means 12 separate monthly PNGs; desktop ZIP is a delivery package, while the preferred mobile handoff awaits trusted-HTTPS real-device validation.

## 8. Transient Surface Application

- **T01 Contextual Photo Actions / Destination Chooser:** contextual action sheet/menu plus named destination chooser; empty, occupied, and Unassigned contexts expose only valid actions. Swap and Replace commitments remain explicit.
- **T02 Delete Confirmation:** explains removal from this project and preservation of the device original.
- **T03 Start New Confirmation:** explains one-project replacement and lack of cloud backup/history.
- **T04 Save / Conflict Feedback:** save failure is a persistent non-blocking banner; newer-tab conflict is blocking and offers Refresh only.
- **T05 Export Progress / Result:** single PNG uses a lightweight anchored desktop status / phone bottom status; ZIP uses a focused progress/result dialog with month-based progress, success, failure, retry, and safe return.

## 9. Accessibility and Measured Contrast

- Visible 3 px `:focus-visible` ring is defined for links, buttons, inputs, selects, and dialogs and was visually checked with keyboard focus.
- Ready, Missing Photo, Warning, Error, and Disabled states combine text with shape/structure; no state depends on color alone.
- Core controls use a 44 px minimum touch target; 320 px/narrow-width review confirms one-column fallback for S02 and S04.
- Dialogs have written titles and explicit close/safe completion actions.
- Logical DOM/source order follows visual reading order.
- Sticky bars and bottom sheets include safe-area padding.
- Nonessential transitions honor `prefers-reduced-motion`.

Measured prototype contrast pairs:

| Pair | Ratio | Result |
|---|---:|---|
| Carbon on Gallery fog | 15.04:1 | Pass |
| Graphite on Gallery fog | 4.64:1 | Pass for normal text |
| Graphite on Proof paper | 5.11:1 | Pass for normal text |
| Ultramarine on white | 6.05:1 | Pass for normal text |
| Warning text on warning surface | 5.38:1 | Pass for normal text |
| Error text on error surface | 5.84:1 | Pass for normal text |
| Success support on white | 5.67:1 | Pass for normal text |
| Disabled text on disabled surface | 4.09:1 | Deliberately legible disabled state |

Formal assistive-technology and target-browser QA remain implementation/validation work; they are not silently claimed by this visual prototype.

## 10. Responsive Rules Verified in the Prototype

- **Desktop wide, 1440 × 900:** 4-column S02/S04; S03 preview remains dominant beside bounded controls.
- **Desktop medium / iPad landscape, 1024 × 768:** 4-column S02/S04; S03 remains side by side and scrolls vertically when required.
- **iPad portrait, 768 × 1024:** complete workflow; S02/S04 adapt to 3 columns and S03 stacks proof and controls without dropping actions.
- **iPhone portrait, 390 × 844:** 2-column S02/S04; approved S03 top direct selector and bottom sequential navigation remain separate.
- **Short iPhone portrait, 390 × 667:** expected vertical scroll; proof and sticky navigation remain usable.
- **Phone landscape, 844 × 390:** complete desktop-like controls remain operable by vertical scroll; no separate optimized landscape composition is introduced.
- **Narrow/enlarged-text proxy, 320 × 844:** S02/S04 collapse to one column, long labels wrap, and task actions remain reachable.

Exact production breakpoints remain a later implementation decision; the prototype values do not define production architecture.

## 11. Comparison / Rejected References

### Direction B — Soft Album

Mauve-tinted neutrals, DM typography, raspberry accent, and softer cards. Rejected for V1 because it risks a lifestyle/candy tone and competes with user photo color.

### Direction C — Independent Print Desk

Print-shop gray, IBM Plex typography, ochre accent, stronger rules, and near-square surfaces. Rejected for V1 because the denser professional-tool language competes with the Calendar Preview.

Also rejected: warm-cream editorial default, purple-gradient/glass AI SaaS styling, large rounded card kits, decorative workspace props, fake paper clips, textures, grain, and heavy print-production chrome.

## 12. Post-V1 / Future Idea — Workspace Custom Background

**Workspace Custom Background** is recorded as a future idea only. It means the website/editor workspace background, not the Calendar output background.

Possible future exploration may include a user-uploaded workspace background image, optional dim/blur/cover treatment, and workspace appearance presets. Calendar Proof, Controls, Sheets, and Dialogs would retain stable neutral surfaces for readability. A workspace image would never enter Calendar PNG or ZIP output.

This idea is not implemented in the V1 Session 04 prototype and does not change current Product Scope.

## 13. Prototype Boundary and Handoff

The prototype uses mock project state, a local SVG photo illustration, fake progress, and review-only DOM interactions. It intentionally does not implement:

- IndexedDB, LocalStorage, or any production persistence decision.
- Production state management or component architecture.
- System picker integration, image decoding, or unreadable/low-resolution detection.
- Production crop, pinch, or pointer-position engine.
- PNG rendering, ZIP generation, download handoff, backend, or API.

Technical Validation must later verify commercial-use font licensing, WebFont loading/file size, Safari compatibility, stable font rendering in PNG output and the three scale presets' fixed-layout safety across all month names; actual calendar rendering, crop behavior, Auto contrast selection and Custom warning threshold, safe-area/browser-chrome behavior, persistence/conflict handling, and reliable PNG/ZIP handoff in the formal support matrix.

## 14. UI Freeze Gate and Change Control

The approved visual direction and final small-scope refinement have been propagated across all required screens, states, and transient surfaces. The visible site name is `2027 Calendar Designer`; the Product UI remains a modern Chinese sans-serif, separate from the English Calendar typography. The high-fidelity prototype and responsive/accessibility review are complete at the Session 04 artifact level.

There is no remaining blocking **OPEN QUESTION** or **UX CONFLICT** known to the design artifacts. The Technical Validation items in Section 13 remain handoffs, not unresolved UI Gate decisions.

The Product Owner approved Session 04 — **Approved / Complete** — and passed the **UI Freeze / Visual Gate** on **2026-09-23**. The current V1 UI baseline is frozen. Small Chinese copy, spacing/alignment, accessibility, contrast, browser-specific layout, and implementation-fidelity corrections may continue when they preserve the approved baseline. Any change to Product Scope, IA, User Flow, Screen Structure, Interaction Semantics, Feature Hierarchy, or Visual System must first be documented as a **UI / UX CHANGE REQUEST**, not silently introduced during implementation.

This closeout does not begin Technical Validation or Technical Architecture; the next stage starts in a new Codex session under Product Owner direction.

## Session 07 approved visual amendment

The Product Owner approved clearer frozen-UI changes on 2026-09-23. Background controls now group a large current-color swatch/HEX, four named Quick Colors and precise system-picker/HEX/RGB inputs. A distinct **从照片取色** action uses the selected photo inside a touch-friendly sheet, leaving the desktop native picker intact. Text-size cards show visibly spaced 80% / 100% / 120% previews. Export controls name the default print and optional digital PNG sizes; the proof depicts the 100 × 150 mm trim and states that print bleed is added outside the preview. These amendments supersede earlier quiet 1200 × 1800-only export metadata, without changing the Direction A typography families, calendar layout, or four core screens.
