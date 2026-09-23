# Calendar, font, PNG and ZIP spikes — Session 05

## Environment and reproducibility

Windows NT 10.0.26200; real installed Chrome 153.0.8010.52 and Edge 153.0.4234.48, headless. Run `node spikes/browser-lab/run-desktop.cjs` from the repository root to regenerate [original raw measurements](../spikes/browser-lab/results/desktop-results.json). A local Windows wallpaper supplied real bitmap photo pixels; it is a desktop proxy, not an iPhone camera photo. Generated [original Canvas PNG](../spikes/browser-lab/results/Chrome-canvas.png), [SVG-path PNG](../spikes/browser-lab/results/Chrome-svg.png) and [12-month ZIP](../spikes/browser-lab/results/Chrome-12-months.zip) are retained as historical first-run output. The first-run photo viewport was centered 800×1200 with side gutters and **is not the approved output geometry**. Product Owner clarification requires a full-width upper Photo Region within the whole 2:3 page. Run `node spikes/browser-lab/run-refinement.cjs` for the [follow-up measurements](../spikes/browser-lab/results/refinement-desktop.json) and [full-width PNG](../spikes/browser-lab/results/Chrome-refined-full-width.png).

## Spike 04 — Calendar rendering

**Hypothesis:** a single 2027 calendar model can feed a scaled browser preview and a 1200×1800 export.  
**Minimal test / run:** `Date.UTC` produced 42 positions for January 2027 with Sunday-first columns and six fixed rows. Jan 1 occupied Friday, column index 5; Jan 31 occupied Sunday of row 6. The same draw routine rendered 400×600 preview and 1200×1800 PNG. Sampling 36,000 RGB channels after scaling export to preview size gave a mean absolute difference of 1.07/255 in Chrome and Edge; anti-aliasing accounts for some difference.  
**Result:** **PASS** for January in both named desktop browsers. Other months, all three scale presets, Safari typography metrics and pixel-perfect comparisons are not yet covered.  
**Recommendation:** carry one date and layout data model into Technical Design; do not copy prototype DOM as the renderer specification.

## Spike 05 — WebFont loading and license evidence

**Hypothesis:** local WebFonts can load before Canvas export; failure can be detected and handled without corrupting output.  
**Minimal test / run:** Local `@font-face` TTFs were loaded via `document.fonts.load()` and `document.fonts.ready` before drawing. In Chrome and Edge all three selected faces reported `loaded`, and the Canvas PNG visibly used the chosen Serif. A separate run aborted the Serif request: the face reported `error`, and the experiment explicitly fell back to Georgia and still made a PNG. This was a simulated network failure, not a Safari result.

| Candidate role | Source file | Format / actual size | License evidence | Desktop PNG | Safari |
|---|---|---:|---|---|---|
| Sans | [Instrument Sans variable](https://github.com/google/fonts/tree/main/ofl/instrumentsans) | TTF, 194,336 B | [OFL 1.1](https://github.com/google/fonts/blob/main/ofl/instrumentsans/OFL.txt) | Canvas target face loaded | NOT TESTED |
| Serif / Editorial | [Instrument Serif Regular](https://github.com/google/fonts/tree/main/ofl/instrumentserif) | TTF, 70,012 B | [OFL 1.1](https://github.com/google/fonts/blob/main/ofl/instrumentserif/OFL.txt) | Canvas target face visibly used | NOT TESTED |
| Handwritten | [Patrick Hand Regular](https://github.com/google/fonts/tree/main/ofl/patrickhand) | TTF, 214,772 B | [OFL 1.1](https://github.com/google/fonts/blob/main/ofl/patrickhand/OFL.txt) | Canvas target face loaded | NOT TESTED |

The downloaded OFL notices in `spikes/browser-lab/fonts/` state that licensed fonts may be bundled and embedded with software under their conditions. This is evidence for these exact source files, not final approval of all V1 preset combinations or a legal review. The files were not optimized to WOFF2; its transfer size, CSS behavior, Safari loading, and license packaging remain to validate. Product UI Chinese font is separate and unaffected.

**Result:** **PARTIAL** across the V1 support matrix. **Recommendation:** verify face status, wait before export, and expose an explicit fallback result if it fails. Do not silently claim that the requested preset was rendered.

**Session 05 refinement:** The Product Owner reported that selecting Sans, Serif and Handwritten on the original iPhone page appeared to leave the preview unchanged (**FAIL / PARTIAL observed**). The page now displays a large `January 2027` sample plus selected preset, `FontFace` status, `document.fonts.status/check`, CSS computed family, Canvas font and fallback status. In Chrome/Edge follow-up, all three faces loaded and the January text-region hashes were distinct: Sans `1633618276`, Serif `907589467`, Handwritten `1811541056` (a quick regression fingerprint, not a typography acceptance metric). Actual iPhone font logs and preview/export comparison remain **REAL DEVICE TEST REQUIRED**.

## Spike 06 — Real PNG paths

**Hypothesis:** photo + crop + solid background + unified text + dates can produce one true 1200×1800 PNG.  
**Minimal test / run:** (A) dedicated Canvas draws at output resolution; (B) an SVG document embeds the JPEG as a data URL and is rasterized into Canvas. Both yielded PNG signatures and 1200×1800 dimensions. The Canvas path generated 2,433,798 B and preserved Instrument Serif; the SVG-image path generated 2,435,272 B but visually substituted sans for the selected Serif. Photo and background sampled pixels matched. The SVG test did not embed font bytes inside the SVG, so it does not rule out every possible SVG pipeline.

Three repeated Canvas exports returned the same byte length, about 46–61 ms each in the final run; their hashes were not compared. The renderer resets its temporary Canvas dimensions to zero after obtaining a Blob. This demonstrates one memory-release action but does not measure native/GPU allocation. Arbitrary dark `#232A3B` background and Auto white ink appeared correctly in the PNG; crop position matched the 2:3 viewport model. A low-contrast Custom choice retained its exact color and showed a warning in the test UI.

**Result:** Canvas path **PASS** for named desktop tests; plain SVG-image path **FAIL** for custom-font fidelity. Follow-up Canvas PNG at 1200×1800 used a 1200×1044 full-width photo region with photo pixels at the left edge and background pixels in the lower calendar region. At zoom 1.5, desktop drag in the blue viewport moved offset 0→(+138.2,−98.7) output px; subsequent drag in the preview moved it to (+254.2,−181.6), with `covered=true` after both. The Product Owner's earlier iPhone drag failure is still **FAIL / PARTIAL** until real-device re-test. **ADR CANDIDATE:** dedicated Canvas renderer. This is not a Production Architecture selection.

## Spike 08 — Sequential ZIP

**Hypothesis:** 12 independent monthly PNGs can be rendered one after another, releasing each Canvas before the next, then packaged for desktop delivery as one ZIP. ZIP is a delivery package, not the output definition.  
**Minimal test / run:** The spike rendered 12 month pages sequentially, accumulated PNG bytes, built an uncompressed ZIP with `01`–`12` filenames, then began one browser download. Python `zipfile` opened all 12 entries and `testzip()` returned `None`. ZIP size was 29,197,207 B. Chrome took 7,707.8 ms; Edge took 7,712.9 ms. The first render was slower because of decode/font/warm-up. The same first source photo was reused for each output, while the persistence test separately used 12 distinct files.

Cancellation after the first month stopped before month 2. A deliberate failure before month 4 stopped after 3 months. A later retry succeeded and the saved project remained intact. This demonstrates the spike's control flow, not behavior under iOS tab suspension.

After the full-width refinement, Chrome/Edge each generated 12 independent valid-signature PNG byte arrays named `01-January-2027.png` through `12-December-2027.png`, then a 33,406,046 B ZIP in the follow-up run. The isolated page now states this two-stage meaning explicitly. This was one landscape desktop proxy photo reused for all months; it does not prove mobile 12-image Save/Share.

`performance.memory.usedJSHeapSize` during the final successful ZIP rose from about 12 to 32 MB in Chrome and 12 to 29 MB in Edge. The value varied substantially across runs with garbage collection. The single renderer Canvas was released each month; all 12 PNG byte arrays still accumulated for ZIP. The metric excludes native decoder, Blob and GPU memory, so it is **not** a peak-device-memory measurement. Mobile is **REAL DEVICE TEST REQUIRED**.

## Spike 11 — Unified text color

**Hypothesis:** one Calendar ink token can serve title, year, weekday labels and date numbers, including the previously missed weekday role.  
**Minimal test / run:** The Canvas draw routine sets `fillStyle` once from Auto/Custom immediately before all four roles. Auto compares relative-luminance contrast against white and `#1E211F` for five backgrounds:

| Background | Auto ink | Ratio |
|---|---|---:|
| `#FFFFFF` | `#1E211F` | 16.25:1 |
| `#777777` | `#FFFFFF` | **4.48:1** |
| `#232A3B` | `#FFFFFF` | 14.33:1 |
| `#E00055` | `#FFFFFF` | 4.88:1 |
| `#00A0FF` | `#1E211F` | 5.78:1 |

The Custom `#232A3B` ink on the same background remained unchanged; a 1.00:1 non-blocking warning appeared. The proposed warning threshold was 4.5:1, informed by [WCAG 2.2 contrast minimum](https://www.w3.org/TR/WCAG22/#contrast-minimum) for normal text. Actual Calendar text role sizes and the design baseline still need product review. `#777777` shows that the current dark-ink/white candidate cannot guarantee 4.5:1 for every arbitrary color. Pure black/white is one candidate for such a guarantee, but changing a frozen visual choice may require a UI/UX change request.

## iOS file handoff boundary

The page exposes Download, Open and Share buttons for one generated PNG, plus full-set PNG generation followed by ZIP download and an isolated 12-file Web Share probe. The Product Owner reported that ZIP generation completed on iPhone, but did not supply ZIP integrity, size or destination; actual 12-image delivery is unresolved. [Web Share](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) requires a secure context and user activation. The LAN HTTP address cannot determine multi-file Share/Save capability; a trusted HTTPS test location is an **OPEN QUESTION**. The probe requires a separate tap after generation to retain user activation. See [the device worksheet](../qa/ios-technical-validation.md).

**PNG handoff follow-up, 2026-09-23:** The Product Owner tried both the generated PNG download and the separate **再次下载已生成 PNG（直接链接）** action on iPhone Safari. Safari displayed a download confirmation. The Product Owner initially could not find a file, then located a downloaded PNG in **iCloud Drive → Downloads**. Therefore the earlier **FAIL for file download was incorrect**: **PASS** for at least one actual iPhone file download, **PARTIAL** for attribution to a specific button, dimensions and reproducibility. The old lab created a Blob URL and called an anchor's `.click()` after asynchronous rendering, then revoked that URL after 60 seconds. The updated lab keeps a prepared PNG URL alive through the page session and logs Blob size/type and user activation; those logs alone cannot assert that iOS wrote a file, but the located file supplies that user-observed evidence. In Chrome/Edge headless follow-up, the async auto-click and direct-link click both produced download events named `01-January-2027.png`, with `userActivationAtClick=false` and `true` respectively. The iPhone observation cannot establish whether restored user activation made the difference. Device/iOS version, Safari download setting and handoff logs are still missing. The same prepared-link probe is available for ZIP, but this report covers PNG only.

**Further iPhone observation and explicit product requirement:** Opening the already generated PNG succeeded. The Product Owner says it can then be saved to Photos through a separate manual action, but explicitly requires **one action that saves directly into Photos with no second step**. This proves the browser produced viewable PNG data; the observed workflow **fails** the requested mobile handoff. The [Web Share specification](https://w3c.github.io/web-share/) delegates destination selection to the user, so opening a Share Sheet would not by itself meet the new requirement. Apple's [PhotoKit guidance](https://developer.apple.com/documentation/PhotoKit/delivering-an-enhanced-privacy-experience-in-your-photos-app) covers authorized native-app additions to Photos. **OPEN QUESTION / feasibility conflict:** browser-only V1 and direct one-action Photos write have not been shown compatible. Keep this unresolved before Technical Architecture; do not infer a production solution from the spike.
