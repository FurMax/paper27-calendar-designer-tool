# V1 Pre-release Regression + QA — execution plan

**Stage:** Pre-release QA, 2026-09-24. No feature work or deployment.

## Evidence rules

- Build the production bundle first and run browser workflows against `vite preview` serving `dist/` on an isolated loopback origin.
- Record each result as PASS, FAIL, PARTIAL, or NOT TESTED with browser, origin, artifact and limitation. A development-server result is supporting evidence only.
- Exercise the product UI and real exported files. Keep test project data in isolated browser profiles; do not touch the Product Owner's LAN project.
- Separate emulated touch and automated WebKit evidence from a real iPhone/iPad Safari pass.
- Record defects as BLOCKER, HIGH, MEDIUM, or LOW; fix BLOCKER/HIGH when feasible and rerun the affected regression.

## Coverage

1. Build, TypeScript, existing lint availability, unit tests.
2. Production-preview first-time and returning workflows; import boundary/failure, assignment, edit, crop, color, type, dates, persistence and export.
3. Twelve-month 2027 preview and exported calendar correctness.
4. Print/digital PNG/JPG file size, 300 PPI print metadata, bleed edges, ordered ZIP, cancel/failure/retry.
5. GSAP latest-month behavior, repeated palette actions, reduced motion, responsive and pointer/touch emulation.
6. Windows Chrome and Edge isolated runs; WebKit only if available. Physical Safari and unavailable platform rows stay unverified.

## Exit

Write `qa/v1-pre-release-results.md` with the requested twelve-part report and a short iPhone handoff. Stop before deployment. Existing Session 08 device/browser/printer gates are not silently waived.