# Calendar Design Studio — High-Fidelity UI Prototype

**NON-PRODUCTION UI PROTOTYPE**

This isolated static prototype applies the Product Owner-approved **Direction A — Gallery Proofing** visual system to all four approved V1 screens and all five approved transient-surface families.

It uses mock data and review-only DOM state. It does not implement file selection, persistence, image decoding, production cropping, PNG rendering, ZIP generation, backend behavior, API calls, or production state management.

From this directory, run:

```text
python -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

The black bar is review tooling and is not product UI. It provides:

- S01 First-time and Returning states.
- S02 Partial + warnings, All missing, and Full states.
- S03 Ready and Missing states.
- S04 Incomplete and Complete states.
- Direct access to T01–T05 example surfaces and result states.
- Hide / Show controls for clean responsive review.

Direction B and Direction C remain documented comparison/rejected references in `design/DESIGN.md`; they are intentionally absent from the V1 prototype and are not themes.
