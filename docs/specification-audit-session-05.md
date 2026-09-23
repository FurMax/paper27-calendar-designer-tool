# Session 05 — Source-of-truth specification audit

**Date:** 2026-09-23  
**Scope:** Product Owner's real iPhone Safari refinement. This audit preceded the disposable spike changes. [The Product Owner-directed UI/UX change request](../design/ui-ux-change-request-session-05.md) records the post-freeze clarification. No Production Architecture or S01–S04 implementation was begun.

## What was already specified before this refinement

| Requirement | Existing approved artifacts | Audit finding |
|---|---|---|
| Drag reposition | `product/project-brief.md`, `product/PRD.md`, `product/acceptance-criteria.md`, `design/information-architecture.md`, `design/user-flow.md`, `design/screen-inventory.md`, `design/interaction-rules.md`, `design/wireframes.md`, `design/wireframe-decisions.md` | Desktop pointer and touch drag were explicit in most; scope named reposition but did not spell out single-finger desktop/mobile controls together. Drag was already a V1 requirement and cannot be dropped because a spike failed. |
| Crop remains covered | `product/project-brief.md`, `product/PRD.md`, `product/acceptance-criteria.md`, `design/interaction-rules.md`; `design/DESIGN.md` said assigned photos fill their region | “No empty area” was present, but the complete-width upper Photo Region and no side gutters/letterboxing were not stated explicitly. |
| Twelve independent PNG outputs | `product/project-brief.md`, `product/PRD.md`, `product/scope.md`, `product/acceptance-criteria.md`; `design/screen-inventory.md` identified monthly PNG files | The core output was already 12 separate images, but several UX passages made the ZIP action look like the product output. |

## Gaps found and resolved in normative artifacts

| Gap | Artifacts clarified | Current rule |
|---|---|---|
| Photo Region full width / cover / no gutters | `product/project-brief.md`, `product/PRD.md`, `product/scope.md`, `product/acceptance-criteria.md`, `design/interaction-rules.md`, `design/wireframes.md`, `design/DESIGN.md` | Whole output is 1200×1800 portrait 2:3; upper photo spans all 1200 px, uses cover crop with clamped offsets; lower Calendar Region is separate. Photo Region itself need not be 2:3. |
| Hard crop interactions | Product brief, PRD, scope, acceptance, interaction rules, wireframes, DESIGN | Desktop pointer/mouse drag; mobile single-finger drag and pinch; explicit zoom on both; Reset centered fill; no geometry change or exposed blank area. |
| ZIP as packaging and distinct full-set action | Product brief, PRD, scope, acceptance; IA, user flow, screen inventory, interaction rules, wireframes, wireframe decisions, DESIGN | Full-set action generates 12 independent monthly PNGs. Desktop ZIP packages them. No automatic 12 browser downloads. |
| Mobile full-set delivery differs from desktop | Product brief, PRD, scope, acceptance; IA, user flow, screen inventory, interaction rules, wireframes, wireframe decisions, DESIGN | **OPEN TECHNICAL QUESTION** until trusted-HTTPS real iPhone/iPad Safari multi-file Share/Save test. ZIP and per-month save are fallback candidates. |

The Session 04 UI prototype and its review artifact still show the historically approved “Download 12-Month ZIP” mock. It is a non-production visual baseline and a documented copy/semantics mismatch, not evidence that mobile ZIP is the final primary action. Resolve the final platform label and handoff after Technical Validation without changing the approved screen hierarchy silently.

## Evidence boundary

The Product Owner reported one real iPhone Safari run: native 12-photo selection, local save/restore, Auto contrast, explicit zoom and ZIP generation worked; drag did not visibly reposition and font switching looked unchanged. Device/OS version, exact files, logs and export artifacts were not provided. These are recorded as scoped **PASS** or **FAIL / PARTIAL** in [Technical Validation](technical-validation.md) and the [iOS worksheet](../qa/ios-technical-validation.md). Multi-file Web Share is **REAL HTTPS DEVICE TEST REQUIRED**; the LAN HTTP run cannot decide it.
