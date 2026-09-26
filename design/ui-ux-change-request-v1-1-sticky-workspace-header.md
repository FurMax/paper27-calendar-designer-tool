# V1.1 Sticky Workspace Header — local navigation refinement (2026-09-25)

## Product Owner direction

On the three project pages—Assign Photos, Month Editor, and Review/Export—keep the existing Calendar Design Studio brand and the three existing stage links reachable while the page scrolls. Landing remains a simple non-sticky hero. Do not create a second persistent navigation bar or change the core workflow.

## Implemented decision

The shared app Header receives a workspace-only class on project screens. Its desktop/iPad surface is a 64px sticky bar with `top:0`, a nearly opaque neutral surface, the existing thin bottom border, and no blur, scaling or prominent shadow. The mobile Header is 56px, hides only the nonessential brand subtitle, and keeps the brand return control and current-stage menu available. No navigation items or routes change.

The Editor's existing desktop sticky calendar preview starts 16px below the 64px Header and fits the remaining viewport, including a short 600px desktop height. The twelve-month selector is not sticky. On phones, the existing separate month selector now scrolls normally so it does not form a second persistent top bar. Modal backdrops remain above the Header.

## Scope and status

Only the shared Header's project-screen class and scoped CSS positioning/sizing change. Calendar artwork, month navigation logic, editor controls and export are unchanged. This awaits Product Owner visual/device review; it does not authorize deployment or pass Session 08 release QA.
