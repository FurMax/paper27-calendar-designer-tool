# Session 06 — Proposed Production Code Index

**Status:** Approved planning map with the Session 06 Technical Gate on 2026-09-23. These source files do **not** exist yet; `prototype/` and `spikes/` remain non-production references. Create this tree only in a separately directed Session 07.

| Proposed path | Responsibility | Milestone |
|---|---|---|
| `package.json`, `vite.config.ts`, `tsconfig.json` | React/TypeScript/Vite build and test scripts, pinned dependencies | M1 |
| `src/app/App.tsx`, `src/app/navigation.ts` | S01–S04 shell, History/back, stable route and month context | M1 |
| `src/screens/Entry.tsx`, `Assign.tsx`, `Editor.tsx`, `Review.tsx` | Approved screen structure and responsive UI | M1–M4, M6–M8 |
| `src/components/` | T01–T05 sheets/dialogs/status and shared Direction A controls | M2–M8 |
| `src/domain/calendar.ts` | 2027 English labels and Sunday-first six-row date engine | M1 |
| `src/domain/project.ts`, `src/domain/assignment.ts` | Project types, selectors, commands, photo-item reuse and reset rules | M2 |
| `src/domain/crop.ts` | Renderer-independent cover/zoom/offset/clamp/pinch math | M3 |
| `src/domain/color.ts`, `src/domain/typography.ts` | Canonical colors, Auto/Custom contrast, bundled preset definitions | M4 |
| `src/domain/geometry.ts`, `src/domain/renderModel.ts` | One fixed output geometry and resolved month render input for preview/export | M1, M4 |
| `src/features/photos/import.ts`, `src/features/photos/decode.ts` | Picker validation, decode-before-commit, metadata and graceful HEIC attempt | M3 |
| `src/features/crop/CropSurface.tsx` | Pointer/touch gesture adapter and explicit zoom/reset controls | M3 |
| `src/persistence/indexedDb.ts`, `src/persistence/serialization.ts` | One-project/asset stores, atomic revision-guarded save/restore, schema validation | M5 |
| `src/export/canvasRenderer.ts`, `src/export/exportController.ts` | Exact monthly PNG renderer and export snapshot/progress/cancel | M6 |
| `src/export/zip.ts`, `src/export/delivery.ts` | Ordered ZIP packaging and isolated browser handoff adapters | M7–M8 |
| `src/styles/` and local font assets under `src/assets/fonts/` | Approved Direction A styling and licensed Calendar faces, independent Chinese UI stack | M1, M4, M8 |
| `tests/unit/`, `tests/browser/`, `qa/` | Domain tests, browser flow/file inspection, targeted device evidence in Session 07; formal release records in Session 08 | Throughout; M8 targeted validation, Session 08 full matrix |

Use `docs/architecture.md` for module boundaries, `docs/data-model.md` for types and invariants, `docs/export-pipeline.md` for render/delivery, `docs/testing-strategy.md` for gates, and `plans/implementation-plan.md` for sequence. Keep this index synchronized if implementation chooses different paths; it is a map, not a requirement to create empty files.

## Session 07 implemented files

M1 created `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/app/App.tsx`, `src/app/navigation.ts`, the four `src/screens/` components, `src/components/CalendarProof.tsx`, `src/domain/calendar.ts`, `geometry.ts`, `renderModel.ts`, `src/styles/app.css`, and `tests/unit/calendar.test.ts`. `qa/session-07-m1.md` records the bounded verification. The initial unit runner is Node 24's built-in TypeScript stripping and test runner, rather than the proposed Vitest, so pure domain tests need no additional runtime package. Browser verification uses the Codex browser control surface; a repeatable browser suite is added with feature flows as the later milestones require. No prototype or spike code is imported.

M2 added `src/domain/project.ts`, `src/domain/assignment.ts`, `src/app/ProjectContext.tsx`, `src/components/PhotoImage.tsx`, `src/features/photos/import.ts`, and `tests/unit/assignment.test.ts`. S01/S02/S03/S04 now read one in-memory project. The picker/decode foundation was connected during M2 so real photos could exercise S02; M3 still owns the complete import policy, crop math and gestures. `qa/session-07-m2.md` records browser evidence.

M3 in progress: `src/domain/crop.ts` owns cover, normalized offsets, drag, anchored zoom and reset; `src/features/crop/CropSurface.tsx` adapts pointer gestures; `src/domain/renderModel.ts` now resolves the same crop for proof and later Canvas export. `src/features/photos/import.ts` attempts `createImageBitmap` then image-element decode before committing. `tests/unit/crop.test.ts` and `tests/unit/import.test.ts` cover boundaries. The desktop evidence and pending iPhone smoke are in `qa/session-07-m3.md`.

The first iPhone LAN test exposed a secure-context dependency. `src/domain/id.ts` now centralizes UUID creation with a `getRandomValues` fallback; `tests/unit/id.test.ts` prevents a repeat. Import diagnostics in `src/features/photos/import.ts` distinguish decoder failure from ID failure. See `qa/session-07-m3.md`.
