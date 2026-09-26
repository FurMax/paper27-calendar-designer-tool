# V1.1 light experience enhancement — Part 1

**Status:** Implemented for Product Owner review, 2026-09-25. This stage ends here; Part 2 and deployment are not authorized.

## Scoped implementation

1. Replace the old four visible Quick Color shortcuts with the Product Owner's ten named fixed Common Colors. Keep the native picker, arbitrary HEX/RGB and three actual-photo recommendations.
2. Store one optional validated texture ID per month in the existing CalendarStyle. A missing ID means no texture for legacy projects.
3. Generate deterministic transparent tiles at roughly 6–12% mark opacity. Show them after Background on desktop and inside the same phone sheet. Paint them below the photo in Editor/Review and PNG/JPG; continue them through the lower print bleed.
4. Refine desk neutrals, panel rhythm, brand hierarchy and soft action states without changing layout, GSAP or calendar geometry.
5. Run production build, unit tests, focused texture proof/export/ZIP checks and established full workflow regressions in isolated Chrome/Edge. Record physical Safari as unverified.

## Review gate

Product Owner should inspect Editor desktop/phone, common-color selection, three photo suggestions, all six texture previews, one exported print PNG/JPG and Review full-set ZIP. Resolve any feedback within this Part 1 scope. Stop before Part 2 and deployment.
