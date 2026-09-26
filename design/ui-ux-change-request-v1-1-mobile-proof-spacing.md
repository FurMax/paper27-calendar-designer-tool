# V1.1 phone Editor proof spacing correction — 2026-09-26

The Product Owner reported that the month title and date area look crowded on phone, citing January, May and August. Measurement at 390px and 320px showed a zero-pixel title-to-weekday gap in the Editor proof. In 2027, January, May and October require six occupied calendar rows; August has five, but shares the same phone spacing problem.

The local correction affects only non-compact Month Editor proofs at phone widths. It reserves a small title-to-weekday gap and reclaims space from the prior large top inset. At 350px and narrower, the gap is smaller to preserve the last date row. The artwork geometry, export renderer, Review thumbnails, project data, typography and photo region do not change.
