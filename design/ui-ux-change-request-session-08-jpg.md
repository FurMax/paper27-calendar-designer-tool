# UI / UX CHANGE REQUEST — Session 08 PNG/JPG export choice

**Status:** APPROVED by Product Owner direction in Session 08: “你最好都支持吧 让用户自己选”. This is an explicit amendment to the earlier PNG-only V1 output specification and the Session 08 no-new-format instruction. Implemented with bounded Chrome/Edge and unit QA; formal device/printer QA remains open. This is not Release Approval.

## Reason

The Product Owner's printer specification names JPG at 300 dpi with 3 mm bleed; RGB is acceptable. Production currently exports PNG only. The Product Owner directed that users choose PNG or JPG.

## Bounded V1 change

- Add a file-format selector beside the existing print/digital purpose selector in the Month Editor and Review & Export. The choices are PNG (default, preserving current behavior) and JPG.
- Apply the chosen format to both single-month and twelve-month output. Each ZIP contains twelve independent files of the chosen format, ordered 01–12. No mixed-format ZIP or automatic duplicate export.
- Keep print geometry at 1252×1843 pixels with approximately 3 mm bleed around a 100×150 mm trim, and digital geometry at 1200×1800. The Preview/crop, color model, typography, assignment, persistence and browser-only platform stay unchanged.
- JPG uses high-quality RGB Canvas output, with 300 PPI density metadata on the print variant. JPG is lossy and cannot promise pixel-identical color to the Preview or PNG. Do not claim CMYK output or printer acceptance without a provider proof.
- Format selection is transient export UI state; it does not change the saved project schema. Switching format invalidates a prepared Blob/ZIP and requires regeneration.
- Existing PNG output and filenames remain unchanged. JPG uses .jpg names and a distinct ZIP filename.

## Acceptance and gates

The output acceptance criteria, product brief/PRD/scope, interaction, design, architecture, export pipeline and QA records must be updated consistently. Verify actual single and twelve-file JPG browser output, signature, SOF dimensions, metadata, ZIP order, failure/retry, photo coverage and legibility. Keep the existing PNG regression suite passing. Real iPhone/iPad, macOS, Android and named-printer gates retain their documented status.

