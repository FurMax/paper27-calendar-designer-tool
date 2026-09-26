# V1.1 print PNG photo color fidelity — change request

Directed by the Product Owner on 2026-09-25 after the print PNG photo appeared brighter than the Editor proof.

## Diagnosis

The print proof and renderer share the same photo crop. In the available matching April and July print/digital PNGs, the photo-region average RGB differs by less than 0.03 per channel. A Chrome check with an ICC-tagged source also found zero pixel difference between HTML image decoding and `createImageBitmap` decoding. No preview-only brightness filter is present. The available exported PNGs contain no `sRGB`, `gAMA`, or ICC color-space marker, so color-managed external viewers must infer how to display them. This is a plausible source of the observed difference, not a confirmed diagnosis of the Product Owner's viewer.

## Bounded correction

- Request an sRGB Canvas context for both trim and print bleed renderers.
- For browser-generated PNGs without an existing color marker, write standard `sRGB` and `gAMA` chunks. Preserve any browser-supplied color profile rather than overriding it.
- Keep photo pixel data, crop, print dimensions, 300 PPI metadata, JPG path, calendar design, and UI unchanged.
- Compare the same newly exported print PNG with the print Editor proof in the same browser and the external viewer. Product Owner visual confirmation remains pending.

This correction does not claim CMYK conversion or printer color matching.

## Follow-up after Product Owner screenshot

The owner-provided side-by-side image still shows a difference after sRGB tagging. Inspection found that the shown MagicView file contains `#DB2647` while a later export of the same April photo contains `#C8324D`; the photo pixels in those two files are identical. The screenshot therefore combines a prior background-color export with the current browser proof. The photo's saturation also differs between browser and MagicView, so application/display color management remains a separate plausible factor. Do not alter artwork colors or export pixels based solely on that viewer. Same-file, same-browser visual comparison is the next bounded check.
