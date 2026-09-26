# V1 Enhancement / Polish Patch — Working plan

**Status:** Implementation complete; awaiting Product Owner visual/interaction review. No deployment or release gate is inferred.

## Direction

A restrained proofing desk: cool workspace (`#F3F6F4`), near-white proof surface (`#FCFDFB`), graphite ink (`#1D2925`), quiet rule (`#D8E0DD`), Baby Blue action (`#B9D7F2` with `#17324A` text), and Milk Mint recommendation surfaces (`#EFF8F3` / `#CDE9DD`). The calendar page remains the dominant object. Instrument Serif supplies the wordmark voice; Instrument Sans stays the product UI face. The Editor workspace alone receives a low-contrast drafting grid; Review stays clean.

Desktop: quiet top brand/navigation; month rail; proof centered on a desk field; grouped controls at right. Phone: preserve existing month switch and bottom navigation, with the same proof and controls in sheets. No artwork or brand layer is rendered into export.

## Delivery order

1. P1: tokenized accent hierarchy, desk surface, typographic wordmark slot, minimal 27 favicon, panel hierarchy.
2. P2: three visible, month-specific suggestions extracted from the current photo crop in Background Color; label any tonal extensions and distinguish fixed Common Colors; preserve exact pixel picker and manual color tools.
3. P3: month-specific twelve-photo palette preview with explicit apply and one-operation restore.
4. P4: restrained interaction feedback, Review summary and export clarity; reduced-motion support.
5. P5: evaluate Important Date against schema, storage and renderer. Implement only if the existing model can accept an optional per-month list without a schema migration or wider pipeline change; otherwise record as Post-V1.

## Verification

Build, meaningful unit/domain tests, browser interaction/visual checks at desktop and 320 px phone width, reduced-motion check, existing crop/save/export regression. Real-device and printer release gates stay separate.

## Outcome

P1–P4 and the tightly bounded P5 date-number mark are implemented. The Important Date scope addition is recorded in `product/scope.md` and `design/ui-ux-change-request-v1-enhancement.md`. Build, unit and isolated Chrome/Edge evidence is in `qa/v1-enhancement-patch.md`. Product Owner experience review and formal Session 08 release QA are still required; no deployment occurred.
