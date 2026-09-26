# Editor hierarchy and duotone QA

**Status:** automated Chrome/Edge pass; Product Owner visual and physical device review pending.

- Build: PASS. Unit suite: 64/64 PASS.
- Focused production-preview browser test: Chrome and Edge PASS.
- Initial state: 01 EDIT remains visible; 精确调色 closed; 02 FINE TUNE open; 03 MARK closed with “未标记.” The closed MARK summary updates to “已标记 1 天”; its 1–31 grid is absent while closed.
- FINE TUNE can close independently, then reopen. Text Color is under 日历文字; Auto hides HEX, Custom reveals HEX, and a white-on-white choice shows the existing contrast warning.
- Six duotone pairs produce six distinct real PNG photo samples. Swap changes output and reverses the selected pair label; current month keeps that selection while February stays 原图. Swapped Review pixels match PNG within the proof-scale tolerance and remain equal after IndexedDB restore.
- Digital/print PNG/JPG dimensions and lower-calendar pixels remain correct. 390px Review and Editor have no page overflow and no runtime errors.
- Actual user-photo aesthetic review, real iPhone/iPad crop and touch performance remain open. The test photo is synthetic and cannot validate subjective portrait quality.
