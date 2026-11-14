# Verification

## Passed in the live browser

- Populated every bill field, reference, notes, terms and signature; inspected corresponding preview text.
- Selected Music composition, Mixing & mastering and UPI; checked corresponding preview ticks.
- Entered 2 × ₹2,500, ₹500 discount, 18% tax: subtotal ₹5,000, tax ₹810, total ₹5,310.
- Populated sixth row (1 × ₹500): sixth row and updated total ₹5,900 appeared.
- Reloaded: text, amounts, payment mode and service selections restored.
- At 390px embedded viewport: no horizontal body overflow; bottom actions visible; preview fits; 1.5× zoom works.
- Long notes produce a fit warning and block export; excessive discount produces a validation warning.
- Share PDF preparation succeeds without external dependencies.
- Downloaded PDF parsed by Poppler: one page, A4 (595.28 × 841.89 points), no encryption, 932 KB for the sample.
- Rendered the PDF to PNG and visually inspected all populated boxes, totals, notes and checkmarks.
- JavaScript syntax check: `node --check dist/app.js`.

## Remaining device checks

Test on a physical iPhone in Safari: keyboard, focus zoom, safe-area padding, PDF download/Files, and native share sheet. Native Web Share cannot be fully confirmed using desktop Chromium. Printing uses the supplied raster artwork, and direct PDF text is rasterized.

## Standalone offline build

- Parsed the final HTML: no external image, stylesheet or script references. All artwork is a data URL; PDF creation uses local canvas and a bundled writer.
- Content Security Policy uses `connect-src 'none'`; no network API calls are used.
- Extracted inline JavaScript and passed `node --check`.
- Tested the exact single-file build through the local browser preview: entered values and checkmarks appear, calculated ₹5,310, generated a valid one-page A4 PDF, and downloaded an editable HTML invoice.
- Reopened the downloaded HTML through the test preview: invoice number, customer, service selection, amounts and total restored; exactly six service rows appeared.
- Direct file-URL testing is unavailable in the cloud browser. Physical iPhone local-file execution and its viewer-specific download behavior remain unverified.

## Rebuilt invoice preview (current template)

- Replaced the full-page image and positioned field overlays with a single typeset renderer.
- Embedded Noto Sans regular/bold WOFF subsets and included font license. No font requests or other network calls are needed by the standalone file.
- Rendered original studio identity, address, contacts, eight service checkboxes, four payment checkboxes, reference, all customer/bill fields, six service rows, notes, totals, six terms, payment terms and signature.
- Replayed the reference's six service rows: ₹16,000 subtotal, ₹500 discount, 18% GST ₹2,790, grand total ₹18,290.
- Generated and rendered the final one-page A4 PDF with Poppler; visually checked typography, amounts, all sections, wrapping and spacing. Export uses the exact preview canvas at 2382 × 3369 pixels. PDF text remains rasterized.
- Long notes display a named overflow warning; descriptions can wrap to two lines with controlled fitting.
- Standalone bundle parsed successfully with no external asset links; inline JavaScript passed syntax checking.
- Reopened the rebuilt editable HTML: all sample values, selections and ₹18,290 total restored; exactly six input rows.
- At a 390px embedded mobile viewport: no horizontal body overflow, clear bottom actions, and preview zoom updated to 1.5×. Physical iPhone validation remains outstanding.
