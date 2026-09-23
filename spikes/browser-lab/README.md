# Browser lab

Serve from this directory, for example `python -m http.server 4175`, then visit `http://localhost:4175/`. The page is intentionally independent of the Session 04 prototype and contains no production application code. A real photo is supplied through its file picker; no user photo leaves the browser. The page stores test selections in this origin's IndexedDB only when the Store button is pressed. Use a fresh browser profile or origin for repeatable storage tests.

The desktop runner in `run-desktop.cjs` exercises the same page on installed Chrome and Edge. Browser UI picker behavior, iOS/Android touch behavior, and actual save destinations require manual observation; an automated `setInputFiles` call is not equivalent to operating a system picker.

The Session 05 refinement changed the disposable page to a full-width 1200×1044 upper Photo Region within the 1200×1800 output, matching the approved 58% photo split for this experiment. The whole output is 2:3; the photo region is not. The original `run-desktop.cjs` results and files remain historical first-run evidence with a centered 800×1200 photo and side gutters. Run `node spikes/browser-lab/run-refinement.cjs` from the repository root for the updated Chrome/Edge drag, font, PNG and full-set checks. Do not treat this lab geometry or code as Production Architecture.

On the current LAN, the page is `http://192.168.31.102:4175/` while a server is running. A trusted HTTPS origin is still required to test actual iPhone/iPad multi-file Web Share; the HTTP LAN page cannot answer that question. See `qa/ios-technical-validation.md` for exact steps and result fields.
