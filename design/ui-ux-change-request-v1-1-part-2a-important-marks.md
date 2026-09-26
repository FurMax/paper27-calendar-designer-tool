# V1.1 Part 2A — Important Date mark style (2026-09-25)

## Product Owner direction

Only extend the existing important-date presentation with three project-wide choices: 红字, 圈记, 小圆点. No new date data, custom colors, event names, reminders, templates, layout changes, font files or motion work.

## Decision

Store `importantMarkStyle: 'red' | 'circle' | 'dot'` once on the project. New projects and legacy schema-version-1 projects default to `red`. A style switch never changes any month's `importantDays` array. Invalid saved style IDs fail validation rather than silently selecting another style.

The existing restrained background-aware red remains the mark ink. Red changes only the date number; circle keeps the normal date ink with a thin ring; dot keeps the normal date ink with a small dot at its upper right. The Editor date section gets a compact three-choice selector above its existing day grid. The shared month render model carries the chosen style into Editor proof, Review proof, and existing PNG/JPG renderer. No new screen, field per month, or export path is added.

## Mark placement correction, 2026-09-25

The Product Owner's January 18 screenshots showed that the first circle crossed into adjacent date rows and the first dot sat too low. The circle is now tightly centered on its own date, and the smaller dot sits at that date's upper right. Both marks must remain inside their date row at the large typography scale in Editor, Review, and export. Marked-day data and the three style IDs remain unchanged.

## Asterisk follow-up, 2026-09-25

The Product Owner replaced the upper-right red dot with a small red `*`. The third UI choice is labeled 星号. Its stored ID remains `dot` to preserve existing saves; only the presentation changes. The asterisk stays close to the date's upper right without touching neighboring rows, in Editor/Review proof and PNG/JPG. This supersedes the earlier dot description.

## Status

Implemented for Product Owner review. Browser visual checks and regression details: `qa/v1-1-part-2a-important-marks.md`. No deployment or next Part 2 stage.
