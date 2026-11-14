# Current verification: native HTML invoice

## Structure and source

- The preview is an actual `article` with `data-template-kind="native-html"`, semantic headings, definition lists and one service table containing six rows.
- Inspected the live DOM: **zero canvases**, **zero CSS background images**, and **one image**, the cropped 420 × 411 Eden logo.
- The standalone HTML has no full-page invoice-image asset or reference, no external font/image/script links, and a policy prohibiting network calls.
- The original `dist/invoice-template.jpg` asset is removed from the current source tree. The only raster brand asset is `dist/eden-logo.png`.
- Inline JavaScript passes `node --check`.

## Live behavior

- Entered all supplied sample customer/bill fields, notes, terms, reference, signature and six service rows. Preview uses real updated text nodes and table cells.
- Subtotal ₹16,000; discount ₹500; 18% tax ₹2,790; total ₹18,290. Service and UPI checkmarks appear in HTML.
- Downloaded and reopened an editable HTML copy: invoice/customer fields and total restored, with exactly six service input rows and six invoice table rows.
- At a 390px embedded viewport: no horizontal body overflow; live customer, amounts and checkbox ticks update; 1.5× zoom works.
- Removed global smooth scrolling to keep focused form controls and checkbox interaction stable while moving between sections.

## Export and visual review

- Downloaded the PDF produced from the native HTML and rendered it with Poppler.
- Checked the full header, logo, SVG contact icons, bordered fields, service table, notes, totals, all six numbered terms, payment terms and signature/footer. No clipped or overlapping sample values.
- Terms numbers are real HTML spans so the direct PDF export includes them, rather than depending on browser list-marker pseudo-elements.
- Print CSS hides the app header and form while retaining the invoice header and native text.

## Limits

The reference design is recreated in HTML/CSS; it is not a pixel-identical raster reproduction. Direct PDF download is rasterized from the DOM, while native browser printing can preserve text. Physical iPhone Safari/local-file behavior and native share-sheet operation remain unverified. Local HTML requires a viewer that executes JavaScript and supports downloads.

## Added services and larger populated text

- Added two independent service keys (`score_sfx`, `voice_artist`) without removing existing service selections: ten form checkboxes and ten native HTML preview checkboxes.
- Selected both new options; both preview marks became ✓. Sample values had zero overflow warnings.
- Read computed font sizes: customer 12 px, description 12 px, subtotal 12.5 px, grand total 17.5 px. The old populated text was mostly 7–7.35 px.
- Increased field/cell heights, widened footer payment terms, added a third checklist row, and spaced the sections to retain one-page A4 output. Text fitting stops at 11 px.
- Generated and rendered the updated PDF; visually checked all ten service options, larger customer details, quantities/prices/amounts, totals, notes and footer.
- Reopened saved HTML: both new form checkboxes and preview ticks restored as selected; grand total remained ₹18,290.
- Mobile 390px viewport: both new checks update in preview, no horizontal body overflow and no fit warnings for the sample.
- Oversized customer value stops at 11 px and shows an overflow warning instead of silently shrinking further.
