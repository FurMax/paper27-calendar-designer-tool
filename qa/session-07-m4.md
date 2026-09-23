# Session 07 — M4 verification

**Date:** 2026-09-23  
**Status:** Complete. Desktop and responsive browser checks passed. The Product Owner confirmed the required real iPhone Safari font smoke had no problems on 2026-09-23; device model, iOS version and individual measurements were not supplied.

## Implementation and evidence

| Check | Result | Evidence |
|---|---|---|
| Color model | PASS | `tests/unit/style.test.ts`: HEX/RGB canonicalization and invalid-value rejection, Auto chooses the higher-contrast dark/light ink, Custom warning stays non-blocking. The warning threshold **4.5:1 is a technical candidate**, pending the later contrast/device decision. |
| Typography model | PASS | Classic, Minimal and Handwritten use bounded project-wide definitions and Small/Standard/Large scales. `buildMonthRenderModel` applies them to every month while per-month colors stay independent. Product UI retains its Chinese system font. Product month selectors/cards and panel labels were corrected to Chinese; English stays inside Calendar Proof and the live `January` samples. The visible site name now matches the frozen design. |
| Unit/build | PASS | `npm test`: 37/37. `npm run build`: TypeScript/Vite PASS. |
| Font files and license | PASS for bundled candidate licensing | Instrument Sans 194,336 bytes; Instrument Serif 70,012 bytes; Patrick Hand 214,772 bytes. Their SIL Open Font License 1.1 notices are copied into `src/assets/fonts/` with the faces. Total TTF source bytes: 479,120. Final font selection, file-size tuning and PNG/Safari fidelity remain open until validation. |
| Desktop font switching | PASS in local Chrome | All three previews selected their expected CSS face and `document.fonts` reported the corresponding bundled faces loaded. The three samples are visibly distinct in the captured browser image. No fallback was reported. |
| Editor layout | PASS in local Chrome | All twelve months at all three scales (36 cases) had no date-region or month-title overflow at 1440×900. |
| Review layout | PASS in local Chrome | All twelve cards at all three scales (36 cases) had no date-region or month-title overflow at 1440×900. |
| Color controls | PASS in local Chrome | Dark Quick Color + Custom dark text displayed a low-contrast warning; switching to Auto selected white. HEX `#123456`, RGB R=100 and native picker `#ABCDEF` updated the actual proof to the expected colors. Returning to white selected dark ink. |
| Phone responsive layout | PASS in local Chrome emulation | At 390×844, the `日历文字` bottom sheet opened, reported `字体已加载`, the proof was 328px wide and the document had no horizontal overflow. All three fonts × three scales × twelve months (108 cases) had no title/date-region overflow. The same 108 cases passed at 320×760 after a narrow-layout spacing correction. This is Chrome emulation, not Safari evidence. |
| LAN URL | PASS from this computer | `http://192.168.31.102:5173/` returned HTTP 200 with M4 changes. |

Browser evidence: `qa/m4-desktop.png`, `qa/m4-phone.png`, `qa/m4-narrow-proof.png`; repeatable local Chrome check: `node tests/browser/m4-check.mjs` against a Chrome debugging page on port 9224 and the Vite server on 5173. Chrome was used because the built-in browser-control connection reset. The temporary Chrome profile was moved outside the repository after a Vite watcher conflict; the dev server recovered and the full browser check passed. The first phone overflow loop reused detached sheet buttons and missed Large-scale clipping. After correcting that test, 390px Handwritten Large clipped in three months, and 320px exposed more cases. Calendar-region phone padding and six-row grid sizing were corrected without changing the approved photo/calendar geometry. The corrected 390px and 320px matrix passed.

## Product Owner real iPhone Safari smoke

Open `http://192.168.31.102:5173/` in real iPhone Safari. The project is still in memory until M5, so if Safari reloaded, tap `逐月添加照片`, enter `编辑月份`, then open the `日历文字` sheet. Switch 经典, 简约 and 手写. Verify that the English `January` sample and Calendar Proof month name visibly change for each choice, and that status reaches `字体已加载` for each. If the UI says `字体未加载，当前使用替代字体`, report which preset. Also check 小 / 标准 / 大 once and whether large text clips. Please report iPhone model and iOS version if convenient, plus any exact failing preset/step. This scoped check does not establish PNG font fidelity or the formal Safari matrix, which remain for later milestones/Session 08.

**OPEN QUESTION:** Final font names/files and the Custom contrast warning threshold retain their documented technical/device validation status. The currently bundled OFL faces and 4.5:1 warning are implementation candidates, not silent final product decisions.

**Outcome:** After the requested three-preset switch/load and scale check, the Product Owner replied “我已经确认了没问题”. This is a reported PASS for the scoped early M4 smoke, not a claim of PNG font fidelity or full Safari release QA.
