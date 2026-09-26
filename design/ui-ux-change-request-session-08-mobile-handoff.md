# UI / UX CHANGE REQUEST — Session 08 mobile handoff

**Status:** APPROVED by explicit Product Owner decision on 2026-09-23. Product, UX, technical and QA source-of-truth artifacts have been updated. This is not Release Approval.

## Observed evidence

The production Review page currently offers Download ZIP (12 PNGs), and the Month Editor offers an individual PNG download. Production has no Share button. The Share 12 PNGs experiment exists only in a QA-only helper page. The Product Owner's iPhone 13 Safari 16.2 run on LAN HTTP downloaded a 24.2 MB ZIP to iCloud Drive / Downloads, extracted it and opened all twelve ordered PNGs. The QA-only probe reported an insecure context, so disabled Web Share on that URL does not establish whether a trusted-HTTPS Share flow works.

## Approved V1 decision

- Make browser ZIP download the primary mobile full-set handoff as well as the desktop handoff. The full-set output remains twelve independent monthly PNGs inside one package.
- Keep the existing individual PNG download. Explain in product copy that ZIP files appear in Files/Downloads and require opening or extracting there.
- Do not add a production multi-file Share button in V1. The QA-only experiment need not be part of the product, and it may be removed after its research purpose is closed.
- Explicitly defer the one-action direct save into iPhone Photos request beyond V1. An iCloud Drive download and manual import are not claimed to meet that original request.
- Replace the V1 trusted-HTTPS twelve-file Share acceptance gate with real-device ZIP delivery, extraction and twelve-file inspection across the supported iPhone/iPad/Android browser matrix. This changes the acceptance requirement; it does not claim HTTPS Share PASS.
- Preserve V1 browser-only scope and the requirement that both desktop and phone can complete the full core workflow.

## Decision record

The Product Owner explicitly answered “同意，V1 用 ZIP” after the tested iPhone ZIP extraction and twelve-PNG inspection were presented. V1 mobile primary handoff is browser ZIP download. Multi-file Share and one-action direct Photos are removed from V1 acceptance and deferred. The Product Owner also confirmed the iPad Air 5 completed the same flow in portrait and landscape; iPadOS version, ZIP size and destination were not supplied. This approval does not nominate a Release Candidate or waive the remaining device/browser QA matrix.
