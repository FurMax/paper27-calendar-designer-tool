# UI / UX CHANGE REQUEST — Session 08 Auto Calendar text contrast

**Status:** OPEN QUESTION — Product Owner decision required before changing the frozen Calendar ink system. This document records a measured release risk; it does not approve or implement a visual change.

## Finding

The approved Calendar Background accepts any solid HEX color. Production Auto chooses between `#18201D` and `#FFFFFF`. In Session 08 measurement, Auto produced 4.478:1 on `#777777` and 4.158:1 on `#FF0000`. A deterministic 32×32×32 RGB sample (32,768 colors in 8-channel steps) found 3,379 Auto combinations below 4.5:1; the lowest observed was 4.077:1 at `#6080A8`. This is a sampled finding, not a claim about every 24-bit color. The original Session 05 4.48:1 observation was explicitly not an acceptance pass. The source uses 4.5:1 as a **Custom warning candidate**; the final Auto acceptance threshold is still an OPEN QUESTION in the approved technical design.

## Decision needed

If the Product Owner adopts 4.5:1 for all ordinary Calendar text, the current two-ink pair cannot pass every arbitrary background. A possible bounded correction is to keep the approved dark ink where it meets the threshold, but choose pure black on colors where the dark ink fails and black meets it; Auto may continue choosing white when white meets the threshold. This changes output ink values on some colors and therefore needs explicit visual-system approval before code changes. Other thresholds or palette decisions require the same explicit resolution.

Custom remains a user choice with a non-blocking warning and must never be silently overridden. The approval should state the Auto minimum contrast target, allowed Auto ink values, whether any exceptions are accepted, and the expected Preview/PNG result. After approval, test white, black, `#777777`, saturated red/green/blue/yellow and a dense arbitrary-color sample in Preview and exported PNG on the required browser matrix.

No scope, typography, calendar geometry or background-color freedom is changed by this request. Release QA will not mark Auto contrast PASS while the decision is unresolved.
