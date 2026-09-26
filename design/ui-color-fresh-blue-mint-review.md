# Fresh Baby Blue + Milk Mint — UI color review

**Status:** Isolated visual comparison passed and palette applied to the local UI; Product Owner review remains pending. This is a shell-only color revision inside the V1 Enhancement / Polish Patch.

## Roles to compare before applying

- Baby Blue `#B9D7F2` is action fill with dark `#17324A` text; hover `#A7CAEB`, pressed `#92B9DE`.
- Selected controls use `#EAF3FA` and a restrained `#78A9D4` edge, never the full primary fill.
- Milk Mint `#CDE9DD` and `#EFF8F3` identify recommendations and successful application, with `#24483E` text. It does not become a second primary action.
- The Editor desk uses `#F3F6F4` and a 32px blue-gray proofing grid at 10% opacity. Review stays cleaner. Main surface `#FCFDFB`, border `#D8E0DD`, text `#1D2925` / `#65736E`.
- Brand, proofing grid, focus, control states and recommendation framing are product UI only. User-selected swatches, calendar background/ink, photo pixels and exported files are unaffected.

## Contrast calculations

Primary dark text on normal/hover/pressed Baby Blue: 8.84:1 / 7.72:1 / 6.42:1. Selected dark blue text on soft blue: 11.75:1. Mint text on soft/filled mint: 9.36:1 / 7.87:1. The candidate focus blue itself is 2.44:1 against the light surface, so add a dark boundary to the focus treatment for visibility.

## Visual comparison checklist

Capture current and candidate colors in isolated browser profiles for: Editor proof and month selector, control panel, photo-color recommendations, Review gallery and smart-color action, export CTA, dialogs/sheets, and 320px phone. Inspect hierarchy, readable states and whether the calendar artwork remains dominant before committing the palette to production CSS. Existing release/device gates remain separate.

## Comparison outcome

Isolated Windows Chrome screenshots used the same twelve synthetic photos before and after theme injection. The Editor month rail, quiet 10%-opacity grid and near-white control panel remain subordinate to the calendar artwork. The photo-color sheet reads as a Mint recommendation surface; the exact generated swatch colors did not change. Review keeps the twelve pages dominant while its full-set recommendation action uses Mint and its export controls/CTA use Baby Blue. The color sheet and 320px phone layout remain readable without horizontal overflow. The initial native range track looked too heavy, so the final candidate uses a thin neutral track and blue thumb; the right panel gained the specified near-white surface.

Comparison screenshots are in `qa/color-system-comparison/` (ink-teal and Baby Blue/Milk Mint Editor/Review views, desktop recommendations, Review CTA/dialog, and phone Editor/recommendations). After comparison, the candidate rules were applied to `src/styles/app.css`; the `27` favicon and browser theme color were updated. The disabled primary action is neutral (`#E5ECEB` with `#51615B` text, 5.46:1), avoiding a washed-out blue button. No visual Product Owner acceptance is inferred.

