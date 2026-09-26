# Review / Export final UX polish — 2026-09-26

Product Owner direction: keep the twelve-month proof wall, full-set palette modal, print/screen and PNG/JPG export paths. This is a local Review wording and navigation pass, not a second editor.

- Each existing proof card remains one button to its month Editor, now with an explicit accessible label and a small hover/keyboard-focus edit hint. No persistent selected-month state.
- The page-header action says 编辑月份 and opens January when all twelve months are ready; for an incomplete set it continues to say 分配照片. The cards themselves always link to their specific months.
- The modal uses 当前背景 / 推荐背景, a month-specific 去编辑 X 月 action, 取消, and 应用推荐配色 · N 个月. N is the actual count of proposals whose color differs from the current background. The note reports that count and the count of proposals already equal to current backgrounds; no month is intentionally excluded.
- Apply feedback says the set recommendation was applied. Existing one-operation color restoration is labeled 撤销本次配色 and retains its persisted behavior. The final export action says 生成整套 12 张; the selected use and format remain directly above it. Choice-card emphasis is softened locally on Review.

Color analysis, stored fields, artwork geometry, export algorithm, dimensions and routes are unchanged. No deployment is authorized.
