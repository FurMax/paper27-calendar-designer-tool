# V1.1 six-row handwritten Large proof fit (2026-09-25)

## Product Owner finding

The Product Owner supplied Editor screenshots of January, May and October 2027 in the Handwritten typography preset with Large scale. These months fill a sixth date row; the final dates touched or clipped the calendar's bottom edge. Other type/scale combinations were not reported affected.

## Decision and scope

Keep the existing calendar dimensions, month data, typography preset and export geometry. Only the proof presentation receives a conditional fit rule when the final calendar row contains a date, the preset is Handwritten, and scale is Large. The date grid uses six shrinkable rows with a controlled line-height, and the lower calendar region reserves a little more bottom space. The rule applies to Editor and Review proofs and adapts at phone widths. No project state or export pixel coordinate changes.

Canvas export already uses fixed date centers, with the sixth row centered at output y=1700 on an 1800px page. The proof-only correction does not alter PNG/JPG content, crop or print bleed.

## Status

Implemented for Product Owner visual review. Focused evidence: `qa/v1-1-six-row-handwritten-fit.md`. No deployment or additional feature stage.
